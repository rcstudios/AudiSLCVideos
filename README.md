# Audi Showroom Reel

A self-looping, randomized playlist of Audi commercials/films for a showroom TV.
No ads, no related-video suggestions — only the videos listed in `playlist.js`.

## Files

- `index.html` — the player. Tap once to start; it then plays forever, unattended.
- `browse.html` — a page listing every video individually so you can jump straight to one.
- `playlist.js` — **the only file you'll likely need to edit.** Add/remove/reorder videos here.
- `player.js` — playback logic (shuffling, YouTube API, Audi Media Center embed handling).
- `style.css` — styling.

## How playback works

- **YouTube videos** use YouTube's real player API, so the next video starts the
  instant the current one actually ends.
- **Audi Media Center videos** don't give the browser an "ended" signal, so those
  advance on a timer instead — see the `seconds` field for each video in
  `playlist.js`. These are estimates; once you've watched a clip, update its
  `seconds` value to match its real length so the loop feels tight.
- Videos play in **random order**, but every video plays once before any repeats
  (a shuffled "deck" that reshuffles once it's exhausted) — so it won't feel
  obviously repetitive to someone watching it every day, but nothing gets skipped.

## Testing on CodePen

CodePen splits things into separate HTML/CSS/JS panes rather than files, so:
1. Paste the contents of `style.css` into the CSS pane.
2. Paste `playlist.js` + `player.js` into the JS pane (playlist first, then player).
3. Paste the *inside* of `index.html`'s `<body>` (the `#stage` div, `#startOverlay`
   div, and their contents — skip the `<script src="...">` tags, since the JS
   pane already has that code) into the HTML pane.
4. The `browse.html` page won't work as a second page inside a single CodePen —
   test that part after you've moved everything to GitHub Pages instead.

## Hosting on GitHub Pages

1. Create a new GitHub repo and add all the files in this folder to it (including
   a `favicon.ico` if you have one — see below).
2. In the repo, go to **Settings → Pages**, set the source to your main branch
   (root folder), and save.
3. GitHub will give you a URL like `https://yourname.github.io/repo-name/`.
   Point the TV's browser at that URL, tap once to start, and put it in
   fullscreen (F11).

## Favicon

Drop a `favicon.ico` (or any icon file) into this same folder before uploading
to GitHub — both HTML files already reference `favicon.ico` and will pick it up
automatically. To use a different filename or a hosted image URL instead, just
change the `href` in the `<link rel="icon" ...>` tag near the top of `index.html`
and `browse.html`.

## A couple of things worth knowing

- **Autoplay with sound**: browsers generally require one user interaction
  before they'll play audio automatically. That's what the "Start the loop"
  tap is for — do it once when the TV powers on, and playback continues
  unattended after that, including across every video swap.
- **Audi Media Center timing**: since those videos rely on a timer rather
  than a real "ended" event, run the loop once end-to-end after your first
  deploy and nudge the `seconds` values in `playlist.js` for any clip that
  cuts off early or lingers on a black screen too long.
