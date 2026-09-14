"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
   filterByRange,
   getSongStats,
   getPlaybackSeries,
} from "@/lib/admin/analytics";
import { NOW, SONGS, SONG_BY_NUMBER } from "@/lib/admin/data";
import { addDays } from "@/lib/admin/dates";
import {
   Card,
   Skeleton,
   EmptyState,
   ErrorState,
   DateRangeFilter,
   DataTable,
   StatCard,
   PlaybackOverviewChart,
   useSimulatedLoad,
   resolvePreset,
   fmtDate,
   fmtDateFull,
   fmtTime,
} from "../_shared";

function SongsPage({ goSong, initialQuery }) {
   const loading = useSimulatedLoad([]);
   const rows = useMemo(() => {
      const weekAgo = addDays(NOW, -7),
         monthAgo = addDays(NOW, -30);
      return SONGS.map(s => {
         const st = getSongStats(s.songNumber);
         const last = st.records[0]?.playedAt;
         return {
            id: s.songNumber,
            songNumber: s.songNumber,
            title: s.title,
            artist: s.artist,
            totalPlays: st.totalPlays,
            thisWeek: st.records.filter(r => r.playedAt >= weekAgo).length,
            thisMonth: st.records.filter(r => r.playedAt >= monthAgo).length,
            lastPlayed: last ? fmtDateFull(last) : "Never",
            _last: last ? last.getTime() : 0,
         };
      });
   }, []);

   return (
      <div className="space-y-5">
         <div>
            <h2 className="text-lg font-semibold text-neutral-900">
               Karaoke Songs
            </h2>
            <p className="text-sm text-neutral-500">
               Browse and analyze all songs in the karaoke library.
            </p>
         </div>
         <Card className="p-4">
            {loading ? (
               <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                     <Skeleton key={i} className="h-9 w-full" />
                  ))}
               </div>
            ) : (
               <DataTable
                  pageSize={10}
                  searchKeys={["songNumber", "title", "artist"]}
                  searchPlaceholder="Search by number, title or artist…"
                  onRowClick={row => goSong(row.songNumber)}
                  initialSort={{ key: "totalPlays", dir: "desc" }}
                  data={rows}
                  defaultQuery={initialQuery}
                  columns={[
                     { key: "songNumber", label: "Song #", sortable: true },
                     { key: "title", label: "Song Title", sortable: true },
                     { key: "artist", label: "Artist", sortable: true },
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
                        key: "lastPlayed",
                        label: "Last Played",
                        sortable: true,
                        align: "right",
                     },
                  ]}
               />
            )}
         </Card>
      </div>
   );
}

function SongDetail({ songNumber, onBack, goArtist }) {
   const song = SONG_BY_NUMBER.get(songNumber);
   const [range, setRange] = useState({
      preset: "This Month",
      ...resolvePreset("This Month"),
   });
   const loading = useSimulatedLoad([songNumber, range.preset]);
   const stats = useMemo(
      () =>
         song
            ? getSongStats(songNumber)
            : {
                 records: [],
                 totalPlays: 0,
                 thisWeek: 0,
                 thisMonth: 0,
                 avgDaily: 0,
              },
      [song, songNumber],
   );
   const rangeRecords = useMemo(
      () => filterByRange(stats.records, range.start, range.end),
      [stats, range],
   );
   const series = useMemo(
      () => getPlaybackSeries(rangeRecords, range.start, range.end),
      [rangeRecords, range],
   );
   const history = useMemo(
      () => [...stats.records].sort((a, b) => b.playedAt - a.playedAt),
      [stats],
   );

   if (!song) {
      return <ErrorState message={`Song #${songNumber} could not be found.`} />;
   }

   return (
      <div className="space-y-5">
         <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800"
         >
            <ArrowLeft size={15} /> Back to Songs
         </button>

         <Card className="p-5">
            <p className="text-xs font-medium text-neutral-400">
               Song #{song.songNumber}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-neutral-900">
               {song.title}
            </h2>
            <button
               onClick={() => goArtist(song.artist)}
               className="text-sm text-[var(--brand-primary)] hover:underline"
            >
               {song.artist}
            </button>
         </Card>

         <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
               label="Total Plays"
               value={stats.totalPlays.toLocaleString()}
               loading={loading}
            />
            <StatCard
               label="This Week"
               value={stats.thisWeek.toLocaleString()}
               loading={loading}
            />
            <StatCard
               label="This Month"
               value={stats.thisMonth.toLocaleString()}
               loading={loading}
            />
            <StatCard
               label="Average Daily Plays"
               value={stats.avgDaily.toFixed(1)}
               loading={loading}
            />
         </div>

         <Card className="p-4">
            <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
               <div>
                  <h3 className="text-sm font-semibold text-neutral-900">
                     Playback History
                  </h3>
                  <p className="text-xs text-neutral-500">
                     How many times this song was played, by day.
                  </p>
               </div>
               <DateRangeFilter value={range} onChange={setRange} />
            </div>
            {!loading && rangeRecords.length === 0 ? (
               <EmptyState
                  title="No playback data"
                  message="This song wasn't played during the selected date range."
               />
            ) : (
               <PlaybackOverviewChart series={series} loading={loading} />
            )}
         </Card>

         <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">
               Recent Playback Records
            </h3>
            {loading ? (
               <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                     <Skeleton key={i} className="h-9 w-full" />
                  ))}
               </div>
            ) : (
               <DataTable
                  pageSize={8}
                  data={history.map(r => ({
                     id: r.id,
                     date: fmtDate(r.playedAt),
                     time: fmtTime(r.playedAt),
                     songNumber: song.songNumber,
                     title: song.title,
                     artist: song.artist,
                  }))}
                  columns={[
                     { key: "date", label: "Date" },
                     { key: "time", label: "Time" },
                     { key: "songNumber", label: "Song #" },
                     { key: "title", label: "Title" },
                     { key: "artist", label: "Artist" },
                  ]}
               />
            )}
         </Card>
      </div>
   );
}

export default function SongsRoute() {
   return (
      <Suspense
         fallback={
            <div className="p-4 text-sm text-neutral-500">Loading songs…</div>
         }
      >
         <SongsRouteContent />
      </Suspense>
   );
}

function SongsRouteContent() {
   const router = useRouter();
   const params = useSearchParams();
   const songNumber = params.get("number");
   const query = params.get("q") || "";
   const parsedNumber = songNumber ? Number(songNumber) : null;

   if (parsedNumber) {
      return (
         <SongDetail
            songNumber={parsedNumber}
            onBack={() => router.push("/admin/songs")}
            goArtist={artist =>
               router.push(
                  `/admin/artists?artist=${encodeURIComponent(artist)}`,
               )
            }
         />
      );
   }

   return (
      <SongsPage
         initialQuery={query}
         goSong={number => router.push(`/admin/songs?number=${number}`)}
      />
   );
}
