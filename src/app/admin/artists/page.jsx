"use client";

export const dynamic = "force-dynamic";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getArtistStats, getTopSongs } from "@/lib/admin/analytics";
import { NOW, ARTIST_NAMES } from "@/lib/admin/data";
import { addDays } from "@/lib/admin/dates";
import {
   Card,
   Skeleton,
   EmptyState,
   ErrorState,
   DataTable,
   StatCard,
   useSimulatedLoad,
} from "../_shared";

function ArtistsPage({ goArtist }) {
   const loading = useSimulatedLoad([]);
   const rows = useMemo(() => {
      const weekAgo = addDays(NOW, -7),
         monthAgo = addDays(NOW, -30);
      return ARTIST_NAMES.map(artist => {
         const st = getArtistStats(artist);
         return {
            id: artist,
            artist,
            songs: st.totalSongs,
            totalPlays: st.totalPlays,
            thisWeek: st.records.filter(r => r.playedAt >= weekAgo).length,
            thisMonth: st.records.filter(r => r.playedAt >= monthAgo).length,
         };
      });
   }, []);

   return (
      <div className="space-y-5">
         <div>
            <h2 className="text-lg font-semibold text-neutral-900">Artists</h2>
            <p className="text-sm text-neutral-500">
               See which artists get the most karaoke play.
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
                  searchKeys={["artist"]}
                  searchPlaceholder="Search artists…"
                  onRowClick={row => goArtist(row.artist)}
                  initialSort={{ key: "totalPlays", dir: "desc" }}
                  data={rows}
                  columns={[
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
                  ]}
               />
            )}
         </Card>
      </div>
   );
}

function ArtistDetail({ artist, onBack, goSong }) {
   const loading = useSimulatedLoad([artist]);
   const stats = getArtistStats(artist);
   const topSongs = useMemo(() => {
      const numbers = new Set(stats.songs.map(s => s.songNumber));
      return getTopSongs(
         stats.records.filter(r => numbers.has(r.songNumber)),
         50,
      );
   }, [stats]);

   if (!stats.totalSongs)
      return <ErrorState message={`No artist named "${artist}" was found.`} />;

   return (
      <div className="space-y-5">
         <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800"
         >
            <ArrowLeft size={15} /> Back to Artists
         </button>

         <Card className="p-5">
            <h2 className="text-xl font-semibold text-neutral-900">{artist}</h2>
            <p className="text-sm text-neutral-500">
               {stats.totalSongs} songs in the karaoke library
            </p>
         </Card>

         <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
               label="Total Songs"
               value={stats.totalSongs}
               loading={loading}
            />
            <StatCard
               label="Total Plays"
               value={stats.totalPlays.toLocaleString()}
               loading={loading}
            />
            <StatCard
               label="Weekly Plays"
               value={stats.thisWeek.toLocaleString()}
               loading={loading}
            />
            <StatCard
               label="Monthly Plays"
               value={stats.thisMonth.toLocaleString()}
               loading={loading}
            />
         </div>

         <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">
               {artist}&apos;s Most Played Songs
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
                  onRowClick={row => goSong(row.songNumber)}
                  data={topSongs}
                  columns={[
                     { key: "songNumber", label: "Song #" },
                     { key: "title", label: "Song Title" },
                     {
                        key: "plays",
                        label: "Plays",
                        align: "right",
                        render: r => r.plays.toLocaleString(),
                     },
                  ]}
               />
            )}
         </Card>
      </div>
   );
}

export default function ArtistsRoute() {
   return (
      <Suspense
         fallback={
            <div className="p-4 text-sm text-neutral-500">Loading artists…</div>
         }
      >
         <ArtistsRouteContent />
      </Suspense>
   );
}

function ArtistsRouteContent() {
   const router = useRouter();
   const params = useSearchParams();
   const artist = params.get("artist");

   if (artist) {
      return (
         <ArtistDetail
            artist={artist}
            onBack={() => router.push("/admin/artists")}
            goSong={number => router.push(`/admin/songs?number=${number}`)}
         />
      );
   }

   return (
      <ArtistsPage
         goArtist={name =>
            router.push(`/admin/artists?artist=${encodeURIComponent(name)}`)
         }
      />
   );
}
