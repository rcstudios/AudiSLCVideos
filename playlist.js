/* ============================================================
   PLAYLIST DATA
   ============================================================
   Each entry is one video. Two types are supported:

   type: "amc"      -> an Audi Media Center video (audimedia.tv)
     - amcId   : the id from the embed code, e.g. "amc-video-8422-en"
     - seconds : how long to show it before switching to the next
                 video. Audi Media Center's embed does NOT tell us
                 when a video ends, so we advance on a timer instead.
                 Adjust these numbers once you've watched each clip
                 and know its real runtime — they're estimates.

   type: "youtube"   -> a YouTube video
     - ytId    : the 11-character video ID from the URL
                 (…/embed/XXXXXXXXXXX)
     - YouTube videos auto-advance the instant they actually end,
       using the real YouTube player API — no timer needed.

   To add/remove videos: just add/remove objects from this array.
   "id" just needs to be unique within this file (used internally
   and for the ?play= link on the browse page).
   ============================================================ */

const DEFAULT_AMC_SECONDS = 45; // fallback if an amc entry has no "seconds"

const PLAYLIST = [

  // ---------------- Audi Media Center ----------------
  { id: "amc-8422", type: "amc", amcId: "amc-video-8422-en", title: "Audi Q7 SUV – Trailer (on location)", source: "Audi Media Center", seconds: 45 },
  { id: "amc-2371", type: "amc", amcId: "amc-video-2371-en", title: "Ski Jump", source: "Audi Media Center", seconds: 60 },
  { id: "amc-4465", type: "amc", amcId: "amc-video-4465-en", title: "GP Ice Race", source: "Audi Media Center", seconds: 60 },
  { id: "amc-4443", type: "amc", amcId: "amc-video-4443-en", title: "A new era in the DTM: The turbo is back", source: "Audi Media Center", seconds: 90 },
  { id: "amc-4839", type: "amc", amcId: "amc-video-4839-en", title: "Audi RS 4 Avant (until 2024) – Footage", source: "Audi Media Center", seconds: 45 },
  { id: "amc-8141", type: "amc", amcId: "amc-video-8141-en", title: "Audi RS 5 Avant / RS 5 Sedan – Trailer (dynamic)", source: "Audi Media Center", seconds: 45 },
  { id: "amc-8301", type: "amc", amcId: "amc-video-8301-en", title: "Audi RS 5 Sedan Bedford green – Footage (on location)", source: "Audi Media Center", seconds: 45 },
  { id: "amc-8115", type: "amc", amcId: "amc-video-8115-en", title: "Audi RS 5 – Integrated brake control system (ABS 2.0) – Animation", source: "Audi Media Center", seconds: 40 },
  { id: "amc-7504", type: "amc", amcId: "amc-video-7504-en", title: "Audi A6 e-tron Family – Trailer (Studio)", source: "Audi Media Center", seconds: 45 },
  { id: "amc-5942", type: "amc", amcId: "amc-video-5942-en", title: "The Audi S8, A8 L and A8 TFSI e on location", source: "Audi Media Center", seconds: 60 },
  { id: "amc-4098", type: "amc", amcId: "amc-video-4098-en", title: "24h Nürburgring 2018 – 8-hour intermediate result", source: "Audi Media Center", seconds: 60 },
  { id: "amc-8045", type: "amc", amcId: "amc-video-8045-en", title: "Audi Q3 Family – Trailer (on location)", source: "Audi Media Center", seconds: 45 },
  { id: "amc-7772", type: "amc", amcId: "amc-video-7772-en", title: "Audi Q5 Family – Trailer (on location)", source: "Audi Media Center", seconds: 45 },
  { id: "amc-7579", type: "amc", amcId: "amc-video-7579-en", title: "Audi Q6 SUV e-tron – Trailer (on location)", source: "Audi Media Center", seconds: 45 },
  { id: "amc-7577", type: "amc", amcId: "amc-video-7577-en", title: "Audi RS Q8 / RS Q8 performance – Trailer (dynamic)", source: "Audi Media Center", seconds: 45 },
  { id: "amc-8484", type: "amc", amcId: "amc-video-8484-en", title: "Audi Q9 SUV – Trailer (dynamic)", source: "Audi Media Center", seconds: 45 },
  { id: "amc-5227", type: "amc", amcId: "amc-video-5227-en", title: "Audi R8 green hell – Tribute to the R8 LMS", source: "Audi Media Center", seconds: 60 },
  { id: "amc-6229", type: "amc", amcId: "amc-video-6229-en", title: "Audi R8 V10 GT RWD – Trailer (until 2024)", source: "Audi Media Center", seconds: 45 },
  { id: "amc-3031", type: "amc", amcId: "amc-video-3031-en", title: "Audi quattro story part 3 – The quattro on ice and snow", source: "Audi Media Center", seconds: 90 },
  { id: "amc-6117", type: "amc", amcId: "amc-video-6117-en", title: "\u201C20 years Audi RS 6\u201D road trip – Trailer", source: "Audi Media Center", seconds: 60 },

  // ---------------- YouTube ----------------
  { id: "yt-PSTIu0u4h90", type: "youtube", ytId: "PSTIu0u4h90", title: "Audi RS 6 Avant: An Avant Story", source: "YouTube \u2013 Audi Hong Kong" },
  { id: "yt-s5VfpM-vSgg", type: "youtube", ytId: "s5VfpM-vSgg", title: "Audi R8 V10 Plus: Introduction", source: "YouTube \u2013 Audi USA" },
  { id: "yt-3wiuFnTdq8Y", type: "youtube", ytId: "3wiuFnTdq8Y", title: "Audi R8: The Last Lap", source: "YouTube \u2013 Audi USA" },
  { id: "yt-x_Mk3IwEBiY", type: "youtube", ytId: "x_Mk3IwEBiY", title: "Audi & Ducati #ComeTogether: Pikes Peak", source: "YouTube \u2013 Audi USA" },
  { id: "yt-HVyAy7A4jOc", type: "youtube", ytId: "HVyAy7A4jOc", title: "Audi Films: Audi Sport \u2013 Defined", source: "YouTube \u2013 Audi USA" },
  { id: "yt-tiTtgq2Pcow", type: "youtube", ytId: "tiTtgq2Pcow", title: "Group B \u2013 The Golden Era of Rallying", source: "YouTube \u2013 daveboy25" },
  { id: "yt-ICPgFXcFuRU", type: "youtube", ytId: "ICPgFXcFuRU", title: "Audi Sport: A Legacy Story in Five Cylinders", source: "YouTube \u2013 Audi USA" },
  { id: "yt-4PYXYI6NtfI", type: "youtube", ytId: "4PYXYI6NtfI", title: "Audi R8: The Slowest Art We've Ever Built", source: "YouTube \u2013 Audi USA" },
  { id: "yt-rE8-hhI79ik", type: "youtube", ytId: "rE8-hhI79ik", title: "Audi Mission to the Moon: Audi Apollo", source: "YouTube \u2013 Audi USA" },
  { id: "yt-Jxn2sdZTLH0", type: "youtube", ytId: "Jxn2sdZTLH0", title: "What does it take for a car to become an Audi?", source: "YouTube \u2013 Audi Belgium" },
  { id: "yt-eMAR5OnG4ro", type: "youtube", ytId: "eMAR5OnG4ro", title: "2011 Audi A8: Pure Aesthetics", source: "YouTube \u2013 Audi USA" },
  { id: "yt-ltwtYi6ZjuY", type: "youtube", ytId: "ltwtYi6ZjuY", title: "Audi R: What it Takes", source: "YouTube \u2013 Audi USA" },
  { id: "yt-9dDS5OJMzBc", type: "youtube", ytId: "9dDS5OJMzBc", title: "The Driven", source: "YouTube \u2013 Audi USA" },
  { id: "yt-9DboAwxJmhA", type: "youtube", ytId: "9DboAwxJmhA", title: "Four Things. Four Rings. Sedona in an Audi e-tron SUV", source: "YouTube \u2013 Audi USA" },

];
