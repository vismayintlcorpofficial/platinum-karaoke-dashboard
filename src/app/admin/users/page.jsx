"use client";

import { useState, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { addDays } from "@/lib/admin/dates";
import {
  filterByRange,
  getTopSongs,
  getUserStats,
} from "@/lib/admin/analytics";
import { USERS, PLAYBACK, NOW } from "@/lib/admin/data";

import {
  Card,
  Skeleton,
  ErrorState,
  DataTable,
  DateRangeFilter,
  StatCard,
  useSimulatedLoad,
  resolvePreset,
  fmtDateFull,
} from "../_shared";

function Users({ goUser }) {
  const [range, setRange] = useState({
    preset: "This Month",
    ...resolvePreset("This Month"),
  });

  const rows = useMemo(() => {
    const today = new Date(NOW);
    today.setHours(0, 0, 0, 0);
    const weekAgo = addDays(NOW, -7);
    const monthAgo = addDays(NOW, -30);
    const yearAgo = addDays(NOW, -365);
    return USERS.map(user => {
      const records = PLAYBACK.filter(record => record.userId === user.id);
      const rangeRecords = filterByRange(records, range.start, range.end);

      const thisDay = records.filter(record => record.playedAt >= today).length;
      const thisWeek = records.filter(
        record => record.playedAt >= weekAgo,
      ).length;
      const thisMonth = records.filter(
        record => record.playedAt >= monthAgo,
      ).length;
      const thisYear = records.filter(
        record => record.playedAt >= yearAgo,
      ).length;

      return {
        id: user.id,
        name: user.name,
        totalPlays: rangeRecords.length,
        thisDay,
        thisWeek,
        thisMonth,
        thisYear,
      };
    });
  }, [range]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Users</h2>
        <p className="text-sm text-neutral-500">All users that played songs</p>
      </div>
      <Card className="p-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-500">
            Showing play counts for{" "}
            <span className="font-medium text-neutral-700">{range.preset}</span>
          </p>
          <DateRangeFilter value={range} onChange={setRange} />
        </div>
        <DataTable
          pageSize={10}
          showPageSizeControl
          searchKeys={["name"]}
          searchPlaceholder="Search Users..."
          onRowClick={row => goUser(row.id)}
          initialSort={{ key: "totalPlays", dir: "desc" }}
          data={rows}
          columns={[
            {
              key: "name",
              label: "User",
              sortable: true,
            },
            {
              key: "totalPlays",
              label: `Total plays (${range.preset})`,
              sortable: true,
              align: "right",
              render: r => r.totalPlays.toLocaleString(),
            },
          ]}
        ></DataTable>
      </Card>
    </div>
  );
}

function UserDetail({ userId, onBack }) {
  const user = USERS.find(u => u.id === userId);
  const [range, setRange] = useState({
    preset: "This Year",
    ...resolvePreset("This Year"),
  });
  const loading = useSimulatedLoad([userId]);
  const stats = useMemo(() => getUserStats(userId), [userId]);

  // One row per song: song number, title, artist, and how many times sung
  const songs = useMemo(
    () => getTopSongs(filterByRange(stats.records, range.start, range.end)),
    [stats, range],
  );

  if (!user)
    return <ErrorState message={`No user with ID "${userId}" was found.`} />;

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800"
      >
        <ArrowLeft size={15} /> Back to Users
      </button>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-xl font-semibold text-neutral-900">
            {user.name}
          </h2>
          <p className="text-sm text-neutral-500">
            {user.id}
            {stats.lastPlayed && (
              <> · Last sang on {fmtDateFull(stats.lastPlayed)}</>
            )}
          </p>
        </Card>
        <StatCard
          label="Different Songs"
          value={stats.uniqueSongs.toLocaleString()}
          loading={loading}
        />
        <StatCard
          label="Total Plays"
          value={stats.totalPlays.toLocaleString()}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Yearly Plays"
          value={stats.thisYear.toLocaleString()}
          loading={loading}
        />
        <StatCard
          label="Monthly Plays"
          value={stats.thisMonth.toLocaleString()}
          loading={loading}
        />
        <StatCard
          label="Weekly Plays"
          value={stats.thisWeek.toLocaleString()}
          loading={loading}
        />
        <StatCard
          label="Daily Plays"
          value={stats.thisDay.toLocaleString()}
          loading={loading}
        />
      </div>

      <Card className="p-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Songs {user.name} sang
            </h3>
            <p className="text-sm text-neutral-500">
              Showing{" "}
              <span className="font-medium text-neutral-700">
                {range.preset}
              </span>
            </p>
          </div>
          <DateRangeFilter value={range} onChange={setRange} />
        </div>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : (
          <DataTable
            key={`${range.preset}-${range.start.getTime()}-${range.end.getTime()}`}
            pageSize={10}
            showPageSizeControl
            searchKeys={["songNumber", "title", "artist"]}
            searchPlaceholder="Search songs or artists…"
            initialSort={{ key: "plays", dir: "desc" }}
            emptyMessage="This user didn't sing any songs in this period."
            data={songs.map(s => ({ ...s, id: s.songNumber }))}
            columns={[
              { key: "songNumber", label: "Song #", sortable: true },
              { key: "title", label: "Song Title", sortable: true },
              { key: "artist", label: "Artist", sortable: true },
              {
                key: "plays",
                label: "Times Sung",
                sortable: true,
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

function UsersRouteContent() {
  const router = useRouter();
  const params = useSearchParams();
  const userId = params.get("user");

  if (userId) {
    return (
      <UserDetail userId={userId} onBack={() => router.push("/admin/users")} />
    );
  }

  return (
    <Users
      goUser={id => router.push(`/admin/users?user=${encodeURIComponent(id)}`)}
    />
  );
}

export default function UsersRoute() {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-sm text-neutral-500"> Loading users...</div>
      }
    >
      <UsersRouteContent />
    </Suspense>
  );
}
