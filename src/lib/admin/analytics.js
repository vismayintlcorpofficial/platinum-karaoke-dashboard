import { SONGS, SONG_BY_NUMBER, PLAYBACK, NOW } from "./data";

import {
   MONTH_NAMES,
   WEEKDAY_LABELS,
   startOfDay,
   addDays,
   addMonths,
   startOfWeek,
   endOfWeek,
   startOfMonth,
   endOfMonth,
   daysInMonth,
   diffDaysInclusive,
   fmtDate,
   fmtDateFull,
   toInputDate,
} from "./dates";

/* ------------------------------------------------------------------ */
/*  Aggregation helpers (would map 1:1 onto future API endpoints)      */
/* ------------------------------------------------------------------ */
function filterByRange(records, start, end) {
   return records.filter(r => r.playedAt >= start && r.playedAt <= end);
}
function getTotalPlays(records) {
   return records.length;
}
function getUniqueSongs(records) {
   return new Set(records.map(r => r.songNumber)).size;
}
function getUniqueArtists(records) {
   return new Set(records.map(r => SONG_BY_NUMBER.get(r.songNumber)?.artist))
      .size;
}
function getTopSongs(records, limit = Infinity) {
   const counts = new Map();
   records.forEach(r =>
      counts.set(r.songNumber, (counts.get(r.songNumber) || 0) + 1),
   );
   const total = records.length || 1;
   return [...counts.entries()]
      .map(([songNumber, plays]) => {
         const song = SONG_BY_NUMBER.get(songNumber);
         return {
            songNumber,
            title: song?.title ?? "Unknown",
            artist: song?.artist ?? "Unknown",
            plays,
            pct: (plays / total) * 100,
         };
      })
      .sort((a, b) => b.plays - a.plays)
      .slice(0, limit);
}
function getTopArtists(records, limit = Infinity) {
   const counts = new Map();
   const songSets = new Map();
   records.forEach(r => {
      const song = SONG_BY_NUMBER.get(r.songNumber);
      if (!song) return;
      counts.set(song.artist, (counts.get(song.artist) || 0) + 1);
      if (!songSets.has(song.artist)) songSets.set(song.artist, new Set());
      songSets.get(song.artist).add(r.songNumber);
   });
   return [...counts.entries()]
      .map(([artist, plays]) => ({
         artist,
         plays,
         songs: songSets.get(artist)?.size ?? 0,
      }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, limit);
}
// Generic bucketed series: daily buckets if range <= 62 days, else monthly buckets
function getPlaybackSeries(records, start, end) {
   const spanDays = diffDaysInclusive(start, end);
   if (spanDays <= 62) {
      const buckets = [];
      for (let i = 0; i < spanDays; i++) {
         const day = addDays(start, i);
         const label =
            spanDays <= 7
               ? WEEKDAY_LABELS[(day.getDay() + 6) % 7]
               : fmtDate(day);
         buckets.push({
            key: toInputDate(day),
            label,
            fullLabel: fmtDateFull(day),
            plays: 0,
         });
      }
      const index = new Map(buckets.map((b, i) => [b.key, i]));
      records.forEach(r => {
         const key = toInputDate(startOfDay(r.playedAt));
         const i = index.get(key);
         if (i !== undefined) buckets[i].plays += 1;
      });
      return buckets;
   }
   const buckets = [];
   let cursor = startOfMonth(start);
   while (cursor <= end) {
      const label = `${MONTH_NAMES[cursor.getMonth()].slice(0, 3)} '${String(cursor.getFullYear()).slice(2)}`;
      buckets.push({
         key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
         label,
         fullLabel: `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`,
         plays: 0,
      });
      cursor = addMonths(cursor, 1);
   }
   const index = new Map(buckets.map((b, i) => [b.key, i]));
   records.forEach(r => {
      const key = `${r.playedAt.getFullYear()}-${r.playedAt.getMonth()}`;
      const i = index.get(key);
      if (i !== undefined) buckets[i].plays += 1;
   });
   return buckets;
}
function getWeekSeries(weekStart) {
   const start = startOfWeek(weekStart);
   const end = endOfWeek(weekStart);
   const records = filterByRange(PLAYBACK, start, end);
   return {
      start,
      end,
      series: getPlaybackSeries(records, start, end),
      records,
   };
}
function getMonthSeries(monthDate) {
   const start = startOfMonth(monthDate);
   const end = endOfMonth(monthDate);
   const records = filterByRange(PLAYBACK, start, end);
   const n = daysInMonth(monthDate.getFullYear(), monthDate.getMonth());
   const buckets = Array.from({ length: n }, (_, i) => ({
      key: i + 1,
      label: String(i + 1),
      plays: 0,
   }));
   records.forEach(r => {
      buckets[r.playedAt.getDate() - 1].plays += 1;
   });
   return { start, end, series: buckets, records };
}
function getSongStats(songNumber) {
   const all = PLAYBACK.filter(r => r.songNumber === songNumber);
   const weekAgo = addDays(NOW, -7);
   const monthAgo = addDays(NOW, -30);
   const thisWeek = all.filter(r => r.playedAt >= weekAgo).length;
   const thisMonth = all.filter(r => r.playedAt >= monthAgo).length;
   const first = all.length ? all[all.length - 1].playedAt : null;
   const spanDays = first ? Math.max(1, diffDaysInclusive(first, NOW)) : 1;
   return {
      totalPlays: all.length,
      thisWeek,
      thisMonth,
      avgDaily: all.length / spanDays,
      records: all,
   };
}
function getArtistStats(artist) {
   const songs = SONGS.filter(s => s.artist === artist);
   const numbers = new Set(songs.map(s => s.songNumber));
   const all = PLAYBACK.filter(r => numbers.has(r.songNumber));
   const weekAgo = addDays(NOW, -7);
   const monthAgo = addDays(NOW, -30);
   return {
      totalSongs: songs.length,
      totalPlays: all.length,
      thisWeek: all.filter(r => r.playedAt >= weekAgo).length,
      thisMonth: all.filter(r => r.playedAt >= monthAgo).length,
      records: all,
      songs,
   };
}

export {
   filterByRange,
   getTotalPlays,
   getUniqueSongs,
   getUniqueArtists,
   getTopSongs,
   getTopArtists,
   getPlaybackSeries,
   getWeekSeries,
   getMonthSeries,
   getSongStats,
   getArtistStats,
};
