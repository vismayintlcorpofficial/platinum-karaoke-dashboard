"use client";

import { Suspense, useMemo, useState } from "react";
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

function SongsPage({ initialQuery }) {
  const [range, setRange] = useState({
    preset: "This Month",
    ...resolvePreset("This Month"),
  });
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
        totalPlays: filterByRange(st.records, range.start, range.end).length,
        thisWeek: st.records.filter(r => r.playedAt >= weekAgo).length,
        thisMonth: st.records.filter(r => r.playedAt >= monthAgo).length,
        lastPlayed: last ? fmtDateFull(last) : "Never",
        _last: last ? last.getTime() : 0,
      };
    });
  }, [range]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">
          Karaoke Songs
        </h2>
        <p className="text-sm text-neutral-500">
          All played songs in the karaoke library.
        </p>
      </div>
      <Card className="p-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-500">
            Showing play counts for{" "}
            <span className="font-medium text-neutral-700">{range.preset}</span>
          </p>
          <DateRangeFilter value={range} onChange={setRange} />
        </div>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : (
          <DataTable
            pageSize={10}
            showPageSizeControl
            searchKeys={["songNumber", "title", "artist"]}
            searchPlaceholder="Search by number, title or artist…"
            initialSort={{ key: "totalPlays", dir: "desc" }}
            data={rows}
            defaultQuery={initialQuery}
            columns={[
              { key: "songNumber", label: "Song #", sortable: true },
              { key: "title", label: "Song Title", sortable: true },
              { key: "artist", label: "Artist", sortable: true },
              {
                key: "totalPlays",
                label: `Total Plays (${range.preset})`,
                sortable: true,
                align: "right",
                render: r => r.totalPlays.toLocaleString(),
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

export default function SongsRoute() {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-sm text-neutral-500">Loading songs…</div>
      }
    >
      <SongsPage />
    </Suspense>
  );
}
