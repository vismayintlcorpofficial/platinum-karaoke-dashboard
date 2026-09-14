"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
   BarChart,
   Bar,
   LineChart,
   Line,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
   filterByRange,
   getTotalPlays,
   getUniqueSongs,
   getUniqueArtists,
   getTopSongs,
   getTopArtists,
   getWeekSeries,
   getMonthSeries,
} from "@/lib/admin/analytics";
import { NOW, PLAYBACK, SONG_BY_NUMBER } from "@/lib/admin/data";
import { addDays, addMonths } from "@/lib/admin/dates";
import {
   Card,
   Badge,
   Skeleton,
   EmptyState,
   DateRangeFilter,
   DataTable,
   ChartTooltip,
   StatCard,
   useSimulatedLoad,
   resolvePreset,
   previousPeriod,
   pctChange,
   daysInMonth,
   MONTH_NAMES,
   fmtDate,
   ChangeTag,
} from "../_shared";

function WeeklyReport({ goSong }) {
   const [weekOffset, setWeekOffset] = useState(0);
   const loading = useSimulatedLoad([weekOffset]);
   const weekAnchor = addDays(NOW, weekOffset * 7);
   const { start, end, series, records } = useMemo(
      () => getWeekSeries(weekAnchor),
      [weekOffset],
   );
   const prevWeek = useMemo(
      () => getWeekSeries(addDays(weekAnchor, -7)),
      [weekOffset],
   );

   const total = getTotalPlays(records);
   const uniqueSongs = getUniqueSongs(records);
   const uniqueArtists = getUniqueArtists(records);
   const avgPerDay = total / 7;
   const topSong = getTopSongs(records, 1)[0];
   const topArtist = getTopArtists(records, 1)[0];
   const topSongs = useMemo(() => getTopSongs(records, 50), [records]);

   return (
      <div className="space-y-5">
         <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
               <h2 className="text-lg font-semibold text-neutral-900">
                  Weekly Karaoke Report
               </h2>
               <p className="text-sm text-neutral-500">
                  Analyze karaoke playback activity throughout the week.
               </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-1 py-1 shadow-sm">
               <button
                  onClick={() => setWeekOffset(o => o - 1)}
                  className="rounded-md p-1.5 hover:bg-neutral-100"
               >
                  <ChevronLeft size={15} />
               </button>
               <span className="px-2 text-sm font-medium text-neutral-700 tabular-nums">
                  {fmtDate(start)} – {fmtDate(end)}
               </span>
               <button
                  disabled={weekOffset === 0}
                  onClick={() => setWeekOffset(o => Math.min(0, o + 1))}
                  className="rounded-md p-1.5 hover:bg-neutral-100 disabled:opacity-30"
               >
                  <ChevronRight size={15} />
               </button>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
               label="Total Plays"
               value={total.toLocaleString()}
               change={pctChange(total, prevWeek.records.length)}
               sub="vs. previous week"
               loading={loading}
            />
            <StatCard
               label="Unique Songs"
               value={uniqueSongs.toLocaleString()}
               loading={loading}
            />
            <StatCard
               label="Unique Artists"
               value={uniqueArtists.toLocaleString()}
               loading={loading}
            />
            <StatCard
               label="Average / Day"
               value={avgPerDay.toFixed(0)}
               loading={loading}
            />
         </div>

         <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-4">
               <p className="text-xs font-medium text-neutral-500">
                  Most Played Song
               </p>
               {topSong ? (
                  <button
                     onClick={() => goSong(topSong.songNumber)}
                     className="mt-1 block text-left hover:underline"
                  >
                     <p className="text-base font-semibold text-neutral-900">
                        {topSong.title}
                     </p>
                     <p className="text-sm text-neutral-500">
                        {topSong.artist} &middot;{" "}
                        {topSong.plays.toLocaleString()} plays
                     </p>
                  </button>
               ) : (
                  <p className="mt-1 text-sm text-neutral-400">
                     No plays this week.
                  </p>
               )}
            </Card>
            <Card className="p-4">
               <p className="text-xs font-medium text-neutral-500">
                  Most Played Artist
               </p>
               {topArtist ? (
                  <div className="mt-1">
                     <p className="text-base font-semibold text-neutral-900">
                        {topArtist.artist}
                     </p>
                     <p className="text-sm text-neutral-500">
                        {topArtist.plays.toLocaleString()} plays
                     </p>
                  </div>
               ) : (
                  <p className="mt-1 text-sm text-neutral-400">
                     No plays this week.
                  </p>
               )}
            </Card>
         </div>

         <Card className="p-4">
            <h3 className="text-sm font-semibold text-neutral-900">
               Weekly Karaoke Playback
            </h3>
            <p className="mb-2 text-xs text-neutral-500">
               Songs played, Monday through Sunday.
            </p>
            {!loading && total === 0 ? (
               <EmptyState
                  title="No playback data"
                  message="There are no karaoke plays for this week."
               />
            ) : loading ? (
               <Skeleton className="h-64 w-full" />
            ) : (
               <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                     data={series}
                     margin={{ top: 6, right: 8, left: -18, bottom: 0 }}
                  >
                     <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e5e5"
                     />
                     <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12, fill: "#a3a3a3" }}
                        axisLine={{ stroke: "#e5e5e5" }}
                        tickLine={false}
                     />
                     <YAxis
                        tick={{ fontSize: 12, fill: "#a3a3a3" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                     />
                     <Tooltip
                        content={<ChartTooltip />}
                        cursor={{ fill: "#f5f5f5" }}
                     />
                     <Bar
                        dataKey="plays"
                        name="Songs Played"
                        fill="#e4af24"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={44}
                     />
                  </BarChart>
               </ResponsiveContainer>
            )}
         </Card>

         <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">
               Top Songs This Week
            </h3>
            {loading ? (
               <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                     <Skeleton key={i} className="h-9 w-full" />
                  ))}
               </div>
            ) : topSongs.length === 0 ? (
               <EmptyState
                  title="No playback data"
                  message="No songs were played this week."
               />
            ) : (
               <DataTable
                  pageSize={8}
                  searchKeys={["title", "artist", "songNumber"]}
                  searchPlaceholder="Search songs…"
                  onRowClick={row => goSong(row.songNumber)}
                  data={topSongs}
                  columns={[
                     {
                        key: "rank",
                        label: "Rank",
                        render: r => `#${topSongs.indexOf(r) + 1}`,
                     },
                     { key: "songNumber", label: "Song #" },
                     { key: "title", label: "Title", sortable: true },
                     { key: "artist", label: "Artist", sortable: true },
                     {
                        key: "plays",
                        label: "Plays",
                        sortable: true,
                        align: "right",
                     },
                     {
                        key: "pct",
                        label: "% of Total",
                        sortable: true,
                        align: "right",
                        render: r => `${r.pct.toFixed(1)}%`,
                     },
                  ]}
               />
            )}
         </Card>
      </div>
   );
}

/* ------------------------------------------------------------------ */
/*  Monthly report                                                      */
/* ------------------------------------------------------------------ */
function MonthlyReport({ goSong }) {
   const [monthOffset, setMonthOffset] = useState(0);
   const loading = useSimulatedLoad([monthOffset]);
   const anchor = useMemo(
      () => addMonths(new Date(NOW.getTime()), monthOffset),
      [monthOffset],
   );

   const { start, end, series, records } = useMemo(
      () => getMonthSeries(new Date(anchor.getTime())),
      [anchor],
   );

   const prevMonthData = useMemo(
      () => getMonthSeries(addMonths(new Date(anchor.getTime()), -1)),
      [anchor],
   );

   const total = getTotalPlays(records);
   const uniqueSongs = getUniqueSongs(records);
   const uniqueArtists = getUniqueArtists(records);
   const daysN = daysInMonth(anchor.getFullYear(), anchor.getMonth());
   const avgPerDay = total / daysN;
   const topSong = getTopSongs(records, 1)[0];
   const topArtist = getTopArtists(records, 1)[0];

   const prevCounts = useMemo(() => {
      const m = new Map();
      getTopSongs(prevMonthData.records, 500).forEach(s =>
         m.set(s.songNumber, s.plays),
      );
      return m;
   }, [prevMonthData]);

   const topSongs = useMemo(
      () =>
         getTopSongs(records, 50).map(s => {
            const prev = prevCounts.get(s.songNumber) || 0;
            return {
               ...s,
               prev,
               change: prev === 0 ? null : pctChange(s.plays, prev),
            };
         }),
      [records, prevCounts],
   );

   return (
      <div className="space-y-5">
         <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
               <h2 className="text-lg font-semibold text-neutral-900">
                  Monthly Karaoke Report
               </h2>
               <p className="text-sm text-neutral-500">
                  Analyze karaoke playback activity throughout the month.
               </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-1 py-1 shadow-sm">
               <button
                  onClick={() => setMonthOffset(o => o - 1)}
                  className="rounded-md p-1.5 hover:bg-neutral-100"
               >
                  <ChevronLeft size={15} />
               </button>
               <span className="px-2 text-sm font-medium text-neutral-700">
                  {MONTH_NAMES[anchor.getMonth()]} {anchor.getFullYear()}
               </span>
               <button
                  disabled={monthOffset === 0}
                  onClick={() => setMonthOffset(o => Math.min(0, o + 1))}
                  className="rounded-md p-1.5 hover:bg-neutral-100 disabled:opacity-30"
               >
                  <ChevronRight size={15} />
               </button>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
               label="Total Plays"
               value={total.toLocaleString()}
               change={pctChange(total, prevMonthData.records.length)}
               sub="vs. previous month"
               loading={loading}
            />
            <StatCard
               label="Unique Songs"
               value={uniqueSongs.toLocaleString()}
               loading={loading}
            />
            <StatCard
               label="Unique Artists"
               value={uniqueArtists.toLocaleString()}
               loading={loading}
            />
            <StatCard
               label="Average / Day"
               value={avgPerDay.toFixed(0)}
               loading={loading}
            />
         </div>

         <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-4">
               <p className="text-xs font-medium text-neutral-500">
                  Most Played Song
               </p>
               {topSong ? (
                  <button
                     onClick={() => goSong(topSong.songNumber)}
                     className="mt-1 block text-left hover:underline"
                  >
                     <p className="text-base font-semibold text-neutral-900">
                        {topSong.title}
                     </p>
                     <p className="text-sm text-neutral-500">
                        {topSong.artist} &middot;{" "}
                        {topSong.plays.toLocaleString()} plays
                     </p>
                  </button>
               ) : (
                  <p className="mt-1 text-sm text-neutral-400">
                     No plays this month.
                  </p>
               )}
            </Card>
            <Card className="p-4">
               <p className="text-xs font-medium text-neutral-500">
                  Most Played Artist
               </p>
               {topArtist ? (
                  <div className="mt-1">
                     <p className="text-base font-semibold text-neutral-900">
                        {topArtist.artist}
                     </p>
                     <p className="text-sm text-neutral-500">
                        {topArtist.plays.toLocaleString()} plays
                     </p>
                  </div>
               ) : (
                  <p className="mt-1 text-sm text-neutral-400">
                     No plays this month.
                  </p>
               )}
            </Card>
         </div>

         <Card className="p-4">
            <h3 className="text-sm font-semibold text-neutral-900">
               Monthly Playback
            </h3>
            <p className="mb-2 text-xs text-neutral-500">
               Songs played per day, {MONTH_NAMES[anchor.getMonth()]}{" "}
               {anchor.getFullYear()} ({daysN} days).
            </p>
            {!loading && total === 0 ? (
               <EmptyState
                  title="No playback data"
                  message="There are no karaoke plays for this month."
               />
            ) : loading ? (
               <Skeleton className="h-64 w-full" />
            ) : (
               <ResponsiveContainer width="100%" height={260}>
                  <LineChart
                     data={series}
                     margin={{ top: 6, right: 8, left: -18, bottom: 0 }}
                  >
                     <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e5e5"
                     />
                     <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "#a3a3a3" }}
                        axisLine={{ stroke: "#e5e5e5" }}
                        tickLine={false}
                        interval={Math.ceil(daysN / 15) - 1}
                     />
                     <YAxis
                        tick={{ fontSize: 12, fill: "#a3a3a3" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                     />
                     <Tooltip content={<ChartTooltip />} />
                     <Line
                        type="monotone"
                        dataKey="plays"
                        name="Songs Played"
                        stroke="#e4af24"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                     />
                  </LineChart>
               </ResponsiveContainer>
            )}
         </Card>

         <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">
               Most Played Songs This Month
            </h3>
            {loading ? (
               <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                     <Skeleton key={i} className="h-9 w-full" />
                  ))}
               </div>
            ) : topSongs.length === 0 ? (
               <EmptyState
                  title="No playback data"
                  message="No songs were played this month."
               />
            ) : (
               <DataTable
                  pageSize={8}
                  searchKeys={["title", "artist", "songNumber"]}
                  searchPlaceholder="Search songs…"
                  onRowClick={row => goSong(row.songNumber)}
                  data={topSongs}
                  columns={[
                     {
                        key: "rank",
                        label: "Rank",
                        render: r => `#${topSongs.indexOf(r) + 1}`,
                     },
                     { key: "songNumber", label: "Song #" },
                     { key: "title", label: "Title", sortable: true },
                     { key: "artist", label: "Artist", sortable: true },
                     {
                        key: "plays",
                        label: "Plays",
                        sortable: true,
                        align: "right",
                     },
                     {
                        key: "prev",
                        label: "Previous Month",
                        align: "right",
                        render: r => (r.prev ? r.prev.toLocaleString() : "—"),
                     },
                     {
                        key: "change",
                        label: "Change",
                        align: "right",
                        render: r =>
                           r.change === null ? (
                              <Badge tone="indigo">New</Badge>
                           ) : (
                              <ChangeTag value={r.change} />
                           ),
                     },
                  ]}
               />
            )}
         </Card>
      </div>
   );
}

/* ------------------------------------------------------------------ */
/*  Artist report                                                       */
/* ------------------------------------------------------------------ */
function ArtistReportPage({ goArtist }) {
   const [range, setRange] = useState({
      preset: "This Month",
      ...resolvePreset("This Month"),
   });
   const loading = useSimulatedLoad([range.preset, range.start?.getTime()]);
   const records = useMemo(
      () => filterByRange(PLAYBACK, range.start, range.end),
      [range],
   );
   const prevRange = useMemo(
      () => previousPeriod(range.start, range.end),
      [range],
   );
   const prevRecords = useMemo(
      () => filterByRange(PLAYBACK, prevRange.start, prevRange.end),
      [prevRange],
   );
   const prevTotals = useMemo(() => {
      const m = new Map();
      getTopArtists(prevRecords, 500).forEach(a => m.set(a.artist, a.plays));
      return m;
   }, [prevRecords]);

   const weekAgo = addDays(NOW, -7),
      monthAgo = addDays(NOW, -27);
   const rows = useMemo(
      () =>
         getTopArtists(records, 500).map(a => {
            const prev = prevTotals.get(a.artist) || 0;
            const artistRecords = PLAYBACK.filter(
               r => SONG_BY_NUMBER.get(r.songNumber)?.artist === a.artist,
            );
            return {
               id: a.artist,
               artist: a.artist,
               songs: a.songs,
               totalPlays: a.plays,
               thisWeek: artistRecords.filter(r => r.playedAt >= weekAgo)
                  .length,
               thisMonth: artistRecords.filter(r => r.playedAt >= monthAgo)
                  .length,
               change: prev === 0 ? null : pctChange(a.plays, prev),
            };
         }),
      [records, prevTotals],
   );

   return (
      <div className="space-y-5">
         <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
               <h2 className="text-lg font-semibold text-neutral-900">
                  Artist Playback Report
               </h2>
               <p className="text-sm text-neutral-500">
                  Rank artists based on total karaoke plays.
               </p>
            </div>
            <DateRangeFilter value={range} onChange={setRange} />
         </div>

         <Card className="p-4">
            {loading ? (
               <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                     <Skeleton key={i} className="h-9 w-full" />
                  ))}
               </div>
            ) : rows.length === 0 ? (
               <EmptyState
                  title="No playback data"
                  message="No artists were played during the selected date range."
               />
            ) : (
               <DataTable
                  pageSize={10}
                  searchKeys={["artist"]}
                  searchPlaceholder="Search artists…"
                  onRowClick={row => goArtist(row.artist)}
                  initialSort={{ key: "totalPlays", dir: "desc" }}
                  data={rows}
                  columns={[
                     {
                        key: "rank",
                        label: "Rank",
                        render: r => `#${rows.indexOf(r) + 1}`,
                     },
                     { key: "artist", label: "Artist", sortable: true },
                     {
                        key: "songs",
                        label: "Songs",
                        sortable: true,
                        align: "right",
                     },
                     {
                        key: "totalPlays",
                        label: "Total Plays",
                        sortable: true,
                        align: "right",
                        render: r => r.totalPlays.toLocaleString(),
                     },
                     {
                        key: "thisWeek",
                        label: "This Week",
                        sortable: true,
                        align: "right",
                     },
                     {
                        key: "thisMonth",
                        label: "This Month",
                        sortable: true,
                        align: "right",
                     },
                     {
                        key: "change",
                        label: "Change",
                        align: "right",
                        render: r =>
                           r.change === null ? (
                              <Badge tone="indigo">New</Badge>
                           ) : (
                              <ChangeTag value={r.change} />
                           ),
                     },
                  ]}
               />
            )}
         </Card>
      </div>
   );
}

export default function ReportsRoute() {
   return (
      <Suspense
         fallback={
            <div className="p-4 text-sm text-neutral-500">Loading report…</div>
         }
      >
         <ReportsRouteContent />
      </Suspense>
   );
}

function ReportsRouteContent() {
   const router = useRouter();
   const params = useSearchParams();
   const report = params.get("report") || "weekly";
   const goSong = number => router.push(`/admin/songs?number=${number}`);
   const goArtist = artist =>
      router.push(`/admin/artists?artist=${encodeURIComponent(artist)}`);

   if (report === "monthly") return <MonthlyReport goSong={goSong} />;
   if (report === "artist") return <ArtistReportPage goArtist={goArtist} />;
   return <WeeklyReport goSong={goSong} />;
}
