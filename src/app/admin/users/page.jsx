"use client";

import { useState, Suspense, useMemo } from "react";

import { addDays } from "@/lib/admin/dates";
import { filterByRange } from "@/lib/admin/analytics";
import { USERS, PLAYBACK, NOW } from "@/lib/admin/data";

import {
  Card,
  DataTable,
  DateRangeFilter,
  resolvePreset,
  fmtDateFull,
} from "../_shared";

function Users() {
  const [range, setRange] = useState({
    preset: "This Month",
    ...resolvePreset("This Month"),
  });

  const rows = useMemo(() => {
    const weekAgo = addDays(NOW, -7);
    const monthAgo = addDays(NOW, -30);
    return USERS.map(user => {
      const records = PLAYBACK.filter(record => record.userId === user.id);
      const rangeRecords = filterByRange(records, range.start, range.end);

      const thisWeek = records.filter(
        record => record.playedAt >= weekAgo,
      ).length;
      const thisMonth = records.filter(
        record => record.playedAt >= monthAgo,
      ).length;

      return {
        id: user.id,
        name: user.name,
        totalPlays: rangeRecords.length,
        thisWeek,
        thisMonth,
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
              render: r => r.thisWeek.toLocaleString(),
            },
          ]}
        ></DataTable>
      </Card>
    </div>
  );
}

export default function UsersRoute() {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-sm text-neutral-500"> Loading users...</div>
      }
    >
      <Users />
    </Suspense>
  );
}
