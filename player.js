/* ============================================================
   AUDI SHOWROOM PLAYER
   ============================================================
   How the two video sources are handled:

   YOUTUBE
   - Loaded through YouTube's real IFrame Player API.
   - We get a genuine "video ended" event, so the next video
     starts the instant the current one actually finishes.

   AUDI MEDIA CENTER (audimedia.tv)
   - Their embed.js works by scanning the page for a <script>
     tag whose id starts with "amc-" or "amtve-", and replacing
     THAT ONE tag with a player iframe. It does not expose a
     "video ended" event to the page.
   - So for these, we create a fresh <script id="amc-video-...">
     element for the video we want and append it, which makes
     embed.js convert it into a player. We advance to the next
     video after a timer (see the "seconds" field in playlist.js)
     rather than waiting for an end event.
   ============================================================ */

const stage = document.getElementById('stage');
const startOverlay = document.getElementById('startOverlay');
const startButton = document.getElementById('startButton');

const SAFETY_MAX_MS = 8 * 60 * 1000; // if a YouTube "ended" event never fires, move on anyway after 8 min

let deck = [];          // shuffled queue of playlist indices, consumed one at a time
let lastPlayedIndex = -1;
let ytPlayer = null;
let advanceTimer = null;

/* ---------------- shuffle "deck" (no repeats until every video has played) ---------------- */

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function refillDeck() {
  deck = PLAYLIST.map((_, i) => i);
  shuffle(deck);
  // avoid immediately repeating the video that just finished, if possible
  if (deck.length > 1 && deck[deck.length - 1] === lastPlayedIndex) {
    [deck[deck.length - 1], deck[0]] = [deck[0], deck[deck.length - 1]];
  }
}

function nextFromDeck() {
  if (deck.length === 0) refillDeck();
  return deck.pop();
}

/* ---------------- YouTube API bootstrap ---------------- */

let ytApiReady = false;
let ytApiWaiters = [];

function loadYouTubeApi() {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}
window.onYouTubeIframeAPIReady = function () {
  ytApiReady = true;
  ytApiWaiters.forEach(fn => fn());
  ytApiWaiters = [];
};
function whenYouTubeReady(fn) {
  if (ytApiReady) fn();
  else ytApiWaiters.push(fn);
}

/* ---------------- stage helpers ---------------- */

function clearStage() {
  if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
  if (ytPlayer && typeof ytPlayer.destroy === 'function') {
    try { ytPlayer.destroy(); } catch (e) { /* ignore */ }
  }
  ytPlayer = null;
  stage.innerHTML = '';
}

function scheduleAdvance(ms) {
  advanceTimer = setTimeout(advance, ms);
}

/* ---------------- playback: YouTube ---------------- */

function playYouTube(video) {
  whenYouTubeReady(() => {
    clearStage();
    const slot = document.createElement('div');
    stage.appendChild(slot);
    ytPlayer = new YT.Player(slot, {
      width: '100%',
      height: '100%',
      videoId: video.ytId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        playsinline: 1
      },
      events: {
        onReady: e => e.target.playVideo(),
        onStateChange: e => {
          if (e.data === YT.PlayerState.ENDED) advance();
        }
      }
    });
    scheduleAdvance(SAFETY_MAX_MS); // backstop in case the ended event never arrives
  });
}

/* ---------------- playback: Audi Media Center ---------------- */

function playAmc(video) {
  clearStage();
  const container = document.createElement('div');
  container.className = 'amc-container';
  stage.appendChild(container);

  const script = document.createElement('script');
  script.id = video.amcId;
  script.setAttribute('data-autoplay', 'true');
  script.src = 'https://www.audimedia.tv/embed.js';
  container.appendChild(script);

  scheduleAdvance((video.seconds || DEFAULT_AMC_SECONDS) * 1000);
}

/* ---------------- master control ---------------- */

function playVideo(video) {
  lastPlayedIndex = PLAYLIST.indexOf(video);
  if (video.type === 'youtube') playYouTube(video);
  else playAmc(video);
}

function advance() {
  const video = PLAYLIST[nextFromDeck()];
  playVideo(video);
}

/* ---------------- entry point ---------------- */

function beginShow() {
  startOverlay.classList.add('hidden');
  advance();
}

function init() {
  loadYouTubeApi();

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('play');
  const requestedVideo = requestedId ? PLAYLIST.find(v => v.id === requestedId) : null;

  if (requestedVideo) {
    // Came here from the browse page with a specific pick — that click
    // is our user gesture, so start immediately without the tap screen.
    lastPlayedIndex = PLAYLIST.indexOf(requestedVideo);
    startOverlay.classList.add('hidden');
    playVideo(requestedVideo);
    // once it's done, fall back to the normal random loop
    // (advance() already does this automatically via nextFromDeck)
  } else {
    startButton.addEventListener('click', beginShow, { once: true });
  }
}

init();
