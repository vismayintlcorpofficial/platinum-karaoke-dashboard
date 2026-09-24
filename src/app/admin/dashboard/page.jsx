"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   AreaChart,
   Area,
} from "recharts";
import { PlayCircle } from "lucide-react";
import {
   filterByRange,
   getTotalPlays,
   getUniqueSongs,
   getUniqueArtists,
   getTopSongs,
   getPlaybackSeries,
} from "@/lib/admin/analytics";
import {
   NOW,
   PLAYBACK,
   SONGS,
   ARTIST_NAMES,
   SONG_BY_NUMBER,
} from "@/lib/admin/data";
import {
   Card,
   Skeleton,
   EmptyState,
   DateRangeFilter,
   DataTable,
   ChartTooltip,
   StatCard,
   PlaybackOverviewChart,
   useSimulatedLoad,
   previousPeriod,
   pctChange,
   DEFAULT_RANGE,
   relativeTime,
} from "../_shared";

function Dashboard({ goSong, goArtist, presetSearch }) {
   const [range, setRange] = useState({
      preset: "This Week",
      ...DEFAULT_RANGE,
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

   const totalPlays = getTotalPlays(records);
   const prevTotalPlays = getTotalPlays(prevRecords);
   const uniqueSongs = getUniqueSongs(records);
   const uniqueArtists = getUniqueArtists(records);
   const topSong = getTopSongs(records, 1)[0];
   const series = useMemo(
      () => getPlaybackSeries(records, range.start, range.end),
      [records, range],
   );
   const topSongs = useMemo(() => getTopSongs(records, 50), [records]);
   const recent = useMemo(() => PLAYBACK.slice(0, 8), []);

   return (
      <div className="space-y-5">
         <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
               <h2 className="text-lg font-semibold text-neutral-900">
                  Dashboard
               </h2>
               <p className="text-sm text-neutral-500">
                  Monitor karaoke playback activity and song performance.
               </p>
            </div>
            <DateRangeFilter value={range} onChange={setRange} />
         </div>

         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
               label="Total Plays"
               value={totalPlays.toLocaleString()}
               change={pctChange(totalPlays, prevTotalPlays)}
               sub="vs. previous period"
               loading={loading}
            />
            <StatCard
               label="Unique Songs"
               value={uniqueSongs.toLocaleString()}
               sub={`out of ${SONGS.length} in library`}
               loading={loading}
            />
            <StatCard
               label="Artists Played"
               value={uniqueArtists.toLocaleString()}
               sub={`out of ${ARTIST_NAMES.length} total`}
               loading={loading}
            />
            {loading ? (
               <StatCard label="Most Played Song" loading />
            ) : topSong ? (
               <Card
                  className="cursor-pointer border-[var(--brand-primary)]/40 bg-gradient-to-br from-[var(--brand-primary)]/15 to-white p-4 transition-colors hover:from-[var(--brand-primary)]/20"
                  onClick={() => goSong(topSong.songNumber)}
               >
                  <p className="text-xs font-medium text-black">
                     Most Played Song
                  </p>
                  <p className="mt-1.5 truncate text-lg font-semibold text-neutral-900">
                     {topSong.title}
                  </p>
                  <p className="truncate text-sm text-neutral-500">
                     {topSong.artist} &middot; Song #{topSong.songNumber}
                  </p>
                  <p className="mt-1.5 text-sm font-medium tabular-nums text-black">
                     {topSong.plays.toLocaleString()} plays
                  </p>
               </Card>
            ) : (
               <Card className="p-4">
                  <EmptyState
                     title="No plays yet"
                     message="No songs were played in this range."
                  />
               </Card>
            )}
         </div>

         <Card className="p-4">
            <div className="mb-1 flex items-center justify-between">
               <div>
                  <h3 className="text-sm font-semibold text-neutral-900">
                     Karaoke Playback Overview
                  </h3>
                  <p className="text-xs text-neutral-500">
                     Number of songs played during the selected period.
                  </p>
               </div>
            </div>
            {!loading && records.length === 0 ? (
               <EmptyState
                  title="No playback data"
                  message="There are no karaoke plays for the selected date range."
               />
            ) : (
               <PlaybackOverviewChart series={series} loading={loading} />
            )}
         </Card>

         <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card className="p-4 xl:col-span-2">
               <h3 className="mb-3 text-sm font-semibold text-neutral-900">
                  Most Played Songs
               </h3>
               {loading ? (
                  <div className="space-y-2">
                     {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-9 w-full" />
                     ))}
                  </div>
               ) : topSongs.length === 0 ? (
                  <EmptyState
                     title="No plays yet"
                     message="No songs were played for the selected date range."
                  />
               ) : (
                  <DataTable
                     pageSize={5}
                     searchKeys={["title", "artist", "songNumber"]}
                     searchPlaceholder="Search song, artist or #…"
                     onRowClick={row => goSong(row.songNumber)}
                     columns={[
                        {
                           key: "rank",
                           label: "Rank",
                           render: r => `#${topSongs.indexOf(r) + 1}`,
                        },
                        { key: "songNumber", label: "Song #", sortable: true },
                        { key: "title", label: "Song Title", sortable: true },
                        { key: "artist", label: "Artist", sortable: true },
                        {
                           key: "plays",
                           label: "Plays",
                           sortable: true,
                           align: "right",
                           render: r => r.plays.toLocaleString(),
                        },
                     ]}
                     data={topSongs}
                  />
               )}
            </Card>

            <Card className="p-4">
               <h3 className="mb-3 text-sm font-semibold text-neutral-900">
                  Recent Playback Activity
               </h3>
               <div className="space-y-1">
                  {loading
                     ? Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                       ))
                     : recent.map(r => {
                          const song = SONG_BY_NUMBER.get(r.songNumber);
                          return (
                             <button
                                key={r.id}
                                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-neutral-50"
                             >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)]/10 text-black">
                                   <PlayCircle size={16} />
                                </div>
                                <div className="min-w-0 flex-1">
                                   <p className="truncate text-sm font-medium text-neutral-800">
                                      {song?.title}
                                   </p>
                                   <p className="truncate text-xs text-neutral-500">
                                      Song #{r.songNumber} &middot;{" "}
                                      {song?.artist}
                                   </p>
                                </div>
                                <span className="shrink-0 whitespace-nowrap text-xs text-neutral-400">
                                   {relativeTime(r.playedAt)}
                                </span>
                             </button>
                          );
                       })}
               </div>
            </Card>
         </div>
      </div>
   );
}

export default function DashboardPage() {
   const router = useRouter();
   return (
      <Dashboard
         goArtist={artist =>
            router.push(`/admin/artists?artist=${encodeURIComponent(artist)}`)
         }
      />
   );
}
