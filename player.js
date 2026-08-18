/* ============================================================
   AUDI SHOWROOM PLAYER
   ============================================================
   YOUTUBE
   - Uses YouTube's real IFrame Player API, so we get a genuine
     "video ended" event and advance the instant it actually ends.

   AUDI MEDIA CENTER (audimedia.tv)
   - Their embed doesn't tell the page when a video ends, and
     swapping to a new video means re-injecting their whole embed
     script, which is slow and occasionally flaky. So instead of
     one single fragile timer, this uses a background "watchdog"
     that checks once a second whether the current video's time
     is up, and force-advances if so. Even if one swap fails
     entirely, the watchdog notices within a second or two and
     tries again - it cannot get permanently stuck.
   - "seconds" in playlist.js is a best estimate of each clip's
     real runtime. If a video keeps cutting off early or keeps
     sitting too long on Audi's own "Similar videos" end screen,
     nudge that video's "seconds" value up or down.

   CONTROLS
   - Bottom-right bar (fades in on mouse move / key press):
     Skip, and a Stop button that returns to the Start screen.
   - Keyboard: Right Arrow or "N" = skip, Escape = exit fullscreen,
     Backspace = stop and return to Start screen.
   ============================================================ */

const stage = document.getElementById('stage');
const startOverlay = document.getElementById('startOverlay');
const startButton = document.getElementById('startButton');
const controlBar = document.getElementById('controlBar');
const skipButton = document.getElementById('skipButton');
const exitButton = document.getElementById('exitButton');
const stopButton = document.getElementById('stopButton');
const loadingOverlay = document.getElementById('loadingOverlay');

const SAFETY_MAX_MS = 8 * 60 * 1000; // backstop if a YouTube "ended" event never fires
const WATCHDOG_TICK_MS = 1000;
const LOADING_OVERLAY_MS = 2200; // how long the "Loading..." message stays up during a swap

let deck = [];
let lastPlayedIndex = -1;
let ytPlayer = null;
let currentDeadline = null;   // timestamp (ms) at which the current video should be cut, or null
let watchdogHandle = null;
let advancing = false;        // guards against double-advancing in the same instant
let loadingHideTimer = null;

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

/* ---------------- watchdog ---------------- */

function setDeadline(ms) {
  currentDeadline = Date.now() + ms;
}

function startWatchdog() {
  if (watchdogHandle) return;
  watchdogHandle = setInterval(() => {
    if (currentDeadline && Date.now() >= currentDeadline) {
      advance();
    }
  }, WATCHDOG_TICK_MS);
}

function stopWatchdog() {
  if (watchdogHandle) {
    clearInterval(watchdogHandle);
    watchdogHandle = null;
  }
  currentDeadline = null;
}

/* ---------------- loading overlay ---------------- */

function flashLoading() {
  loadingOverlay.classList.remove('hidden');
  clearTimeout(loadingHideTimer);
  loadingHideTimer = setTimeout(() => {
    loadingOverlay.classList.add('hidden');
  }, LOADING_OVERLAY_MS);
}

/* ---------------- stage helpers ---------------- */

function clearStage() {
  currentDeadline = null;
  if (ytPlayer && typeof ytPlayer.destroy === 'function') {
    try { ytPlayer.destroy(); } catch (e) { /* ignore */ }
  }
  ytPlayer = null;
  stage.innerHTML = '';
}

/* ---------------- playback: YouTube ---------------- */

function playYouTube(video) {
  whenYouTubeReady(() => {
    try {
      clearStage();
      flashLoading();
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
      setDeadline(SAFETY_MAX_MS);
    } catch (err) {
      console.error('YouTube playback failed, skipping to next video', err);
      setTimeout(advance, 500);
    }
  });
}

/* ---------------- playback: Audi Media Center ---------------- */

function playAmc(video) {
  try {
    clearStage();
    flashLoading();
    const container = document.createElement('div');
    container.className = 'amc-container';
    stage.appendChild(container);

    const script = document.createElement('script');
    script.id = video.amcId;
    script.setAttribute('data-autoplay', 'true');
    script.src = 'https://www.audimedia.tv/embed.js';
    container.appendChild(script);

    setDeadline((video.seconds || DEFAULT_AMC_SECONDS) * 1000);
  } catch (err) {
    console.error('Audi Media Center playback failed, skipping to next video', err);
    setTimeout(advance, 500);
  }
}

/* ---------------- master control ---------------- */

function playVideo(video) {
  lastPlayedIndex = PLAYLIST.indexOf(video);
  if (video.type === 'youtube') playYouTube(video);
  else playAmc(video);
}

function advance() {
  if (advancing) return;
  advancing = true;
  currentDeadline = null;
  const video = PLAYLIST[nextFromDeck()];
  playVideo(video);
  setTimeout(() => { advancing = false; }, 300);
}

/* ---------------- controls: skip / exit fullscreen / stop ---------------- */

let controlsHideTimer = null;

function showControls() {
  controlBar.classList.remove('hidden');
  clearTimeout(controlsHideTimer);
  controlsHideTimer = setTimeout(() => controlBar.classList.add('hidden'), 4000);
}

function exitFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
}

function backToStart() {
  // Full reload back to a clean index.html with no ?play= param -
  // the simplest, most reliable way to land back on the Start screen.
  window.location.href = window.location.pathname;
}

document.addEventListener('mousemove', showControls);
document.addEventListener('keydown', (e) => {
  showControls();
  if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'n') advance();
  if (e.key === 'Escape') exitFullscreen();
  if (e.key === 'Backspace') backToStart();
});
skipButton.addEventListener('click', () => { advance(); showControls(); });
exitButton.addEventListener('click', () => { exitFullscreen(); showControls(); });
stopButton.addEventListener('click', backToStart);

/* ---------------- entry point ---------------- */

function beginShow() {
  startOverlay.classList.add('hidden');
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
  startWatchdog();
  advance();
}

function init() {
  loadYouTubeApi();

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('play');
  const requestedVideo = requestedId ? PLAYLIST.find(v => v.id === requestedId) : null;

  if (requestedVideo) {
    lastPlayedIndex = PLAYLIST.indexOf(requestedVideo);
    startOverlay.classList.add('hidden');
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    startWatchdog();
    playVideo(requestedVideo);
  } else {
    startButton.addEventListener('click', beginShow, { once: true });
  }
}

init();
