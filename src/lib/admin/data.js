import { addDays } from "./dates";

/* ------------------------------------------------------------------ */
/*  Fixed "today" so the mock catalogue always reads as current        */
/* ------------------------------------------------------------------ */
const NOW = new Date(2026, 8, 7, 22, 40, 0); // Sep 7, 2026

/* ------------------------------------------------------------------ */
/*  Deterministic PRNG so the dataset is stable across renders         */
/* ------------------------------------------------------------------ */
function mulberry32(seed) {
   return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
   };
}
const rand = mulberry32(88771);
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

/* ------------------------------------------------------------------ */
/*  Mock data: artists, songs, playback records                        */
/* ------------------------------------------------------------------ */
const ARTIST_NAMES = [
   "Frank Sinatra",
   "Queen",
   "Eagles",
   "Guns N' Roses",
   "Elvis Presley",
   "ABBA",
   "Whitney Houston",
   "Journey",
   "Adele",
   "Bon Jovi",
   "Celine Dion",
   "Michael Jackson",
   "Madonna",
   "Elton John",
   "The Beatles",
   "Bruno Mars",
   "Taylor Swift",
   "Ed Sheeran",
   "Katy Perry",
   "Rihanna",
   "Coldplay",
   "Backstreet Boys",
   "Spice Girls",
   "Mariah Carey",
   "Billy Joel",
];

const TITLE_BANK = {
   "Frank Sinatra": [
      "My Way",
      "Fly Me to the Moon",
      "New York, New York",
      "Strangers in the Night",
   ],
   Queen: [
      "Bohemian Rhapsody",
      "Don't Stop Me Now",
      "Somebody to Love",
      "We Are the Champions",
   ],
   Eagles: ["Hotel California", "Take It Easy", "Desperado"],
   "Guns N' Roses": ["Sweet Child O' Mine", "November Rain", "Paradise City"],
   "Elvis Presley": [
      "Can't Help Falling in Love",
      "Suspicious Minds",
      "Jailhouse Rock",
   ],
   ABBA: ["Dancing Queen", "Mamma Mia", "Waterloo", "SOS"],
   "Whitney Houston": [
      "I Will Always Love You",
      "I Wanna Dance with Somebody",
      "Greatest Love of All",
   ],
   Journey: ["Don't Stop Believin'", "Faithfully", "Open Arms"],
   Adele: ["Rolling in the Deep", "Someone Like You", "Set Fire to the Rain"],
   "Bon Jovi": ["Livin' on a Prayer", "It's My Life", "Wanted Dead or Alive"],
   "Celine Dion": ["My Heart Will Go On", "Because You Loved Me"],
   "Michael Jackson": ["Billie Jean", "Man in the Mirror", "Beat It"],
   Madonna: ["Like a Prayer", "Vogue", "Material Girl"],
   "Elton John": ["Rocket Man", "Tiny Dancer", "Your Song"],
   "The Beatles": ["Hey Jude", "Let It Be", "Yesterday"],
   "Bruno Mars": ["Just the Way You Are", "Uptown Funk", "When I Was Your Man"],
   "Taylor Swift": ["Love Story", "Shake It Off", "Blank Space"],
   "Ed Sheeran": ["Perfect", "Shape of You", "Thinking Out Loud"],
   "Katy Perry": ["Firework", "Roar", "Teenage Dream"],
   Rihanna: ["Umbrella", "Diamonds", "Stay"],
   Coldplay: ["Yellow", "Fix You", "The Scientist"],
   "Backstreet Boys": ["I Want It That Way", "Everybody (Backstreet's Back)"],
   "Spice Girls": ["Wannabe", "Spice Up Your Life"],
   "Mariah Carey": ["Hero", "All I Want for Christmas Is You", "Without You"],
   "Billy Joel": ["Piano Man", "Uptown Girl", "We Didn't Start the Fire"],
};

function buildCatalogue() {
   let songNumber = 1000;
   const songs = [];
   ARTIST_NAMES.forEach(artist => {
      (TITLE_BANK[artist] || []).forEach(title => {
         songNumber += randInt(4, 20);
         songs.push({ songNumber: String(songNumber), title, artist });
      });
   });
   return songs;
}
const SONGS = buildCatalogue();
const SONG_BY_NUMBER = new Map(SONGS.map(s => [s.songNumber, s]));

// Zipf-like popularity weights so some songs dominate
const shuffledSongs = [...SONGS].sort(() => rand() - 0.5);
const WEIGHTS = new Map(
   shuffledSongs.map((s, i) => [s.songNumber, 1 / Math.pow(i + 1, 0.72)]),
);

function buildPlayback() {
   const records = [];
   let id = 1;
   const totalDays = 150; // ~5 months of history
   const weightEntries = [...WEIGHTS.entries()];
   const weightSum = weightEntries.reduce((a, [, w]) => a + w, 0);

   for (let dayOffset = totalDays; dayOffset >= 0; dayOffset--) {
      const day = addDays(NOW, -dayOffset);
      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
      const base = isWeekend ? randInt(28, 46) : randInt(14, 28);
      const seasonalBoost = day.getMonth() === 11 ? 1.4 : 1; // Dec bump
      const playsToday = Math.round(base * seasonalBoost);

      for (let p = 0; p < playsToday; p++) {
         let r = rand() * weightSum;
         let chosen = weightEntries[0][0];
         for (const [songNumber, w] of weightEntries) {
            r -= w;
            if (r <= 0) {
               chosen = songNumber;
               break;
            }
         }
         const hour = isWeekend ? randInt(15, 23) : randInt(11, 22);
         const minute = randInt(0, 59);
         const playedAt = new Date(
            day.getFullYear(),
            day.getMonth(),
            day.getDate(),
            hour,
            minute,
            randInt(0, 59),
         );
         records.push({ id: String(id++), songNumber: chosen, playedAt });
      }
   }
   return records.sort((a, b) => b.playedAt - a.playedAt);
}
const PLAYBACK = buildPlayback();

export { ARTIST_NAMES, TITLE_BANK, SONGS, SONG_BY_NUMBER, PLAYBACK, NOW };
