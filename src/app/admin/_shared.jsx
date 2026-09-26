"use client";

import { useMemo, useState, useEffect } from "react";
import {
   BarChart,
   Bar,
   LineChart,
   Line,
   AreaChart,
   Area,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
} from "recharts";
import {
   LayoutDashboard,
   Music,
   Users,
   BarChart3,
   Settings,
   Search,
   ChevronRight,
   Menu,
   X,
   TrendingUp,
   TrendingDown,
   ArrowUpDown,
   ArrowLeft,
   ChevronDown,
   ChevronLeft,
   Inbox,
   AlertTriangle,
   PlayCircle,
   ChevronsLeft,
   ChevronsRight,
   User,
   LogOut,
   HelpCircle,
} from "lucide-react";

import {
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
} from "@/lib/admin/analytics";

import {
   startOfWeek,
   endOfDay,
   endOfWeek,
   addDays,
   addMonths,
   startOfDay,
} from "@/lib/admin/dates";
import {
   NOW,
   PLAYBACK,
   SONGS,
   ARTIST_NAMES,
   SONG_BY_NUMBER,
} from "@/lib/admin/data";

/* ------------------------------------------------------------------ */
/*  Date helpers                                                       */
/* ------------------------------------------------------------------ */
const DAY = 24 * 60 * 60 * 1000;

function startOfMonth(d) {
   return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d) {
   return endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}
function startOfYear(d) {
   return new Date(d.getFullYear(), 0, 1);
}
function endOfYear(d) {
   return endOfDay(new Date(d.getFullYear(), 11, 31));
}
function daysInMonth(year, month) {
   return new Date(year, month + 1, 0).getDate();
}
function diffDaysInclusive(start, end) {
   return Math.round((startOfDay(end) - startOfDay(start)) / DAY) + 1;
}
function fmtDate(d, opts = { month: "short", day: "numeric" }) {
   return d.toLocaleDateString("en-US", opts);
}
function fmtDateFull(d) {
   return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
   });
}
function fmtTime(d) {
   return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function toInputDate(d) {
   return d.toISOString().slice(0, 10);
}

function relativeTime(d) {
   const s = Math.floor((NOW - d) / 1000);
   if (s < 60) return "just now";
   const m = Math.floor(s / 60);
   if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
   const h = Math.floor(m / 60);
   if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
   const days = Math.floor(h / 24);
   return `${days} day${days === 1 ? "" : "s"} ago`;
}

const PRESETS = [
   "Today",
   "Yesterday",
   "This Week",
   "Last Week",
   "This Month",
   "Last Month",
   "This Quarter",
   "This Year",
   "Custom Range",
];

function resolvePreset(preset, customStart, customEnd) {
   switch (preset) {
      case "Today":
         return { start: startOfDay(NOW), end: endOfDay(NOW) };
      case "Yesterday": {
         const y = addDays(NOW, -1);
         return { start: startOfDay(y), end: endOfDay(y) };
      }
      case "This Week":
         return { start: startOfWeek(NOW), end: endOfDay(NOW) };
      case "Last Week": {
         const lw = addDays(NOW, -7);
         return { start: startOfWeek(lw), end: endOfWeek(lw) };
      }
      case "This Month":
         return { start: startOfMonth(NOW), end: endOfDay(NOW) };
      case "Last Month": {
         const lm = addMonths(NOW, -1);
         return { start: startOfMonth(lm), end: endOfMonth(lm) };
      }
      case "This Quarter":
         return {
            start: new Date(
               NOW.getFullYear(),
               Math.floor(NOW.getMonth() / 3) * 3,
               1,
            ),
            end: endOfDay(NOW),
         };
      case "This Year":
         return { start: startOfYear(NOW), end: endOfDay(NOW) };
      case "Custom Range":
         return {
            start: startOfDay(new Date(customStart)),
            end: endOfDay(new Date(customEnd)),
         };
      default:
         return { start: startOfWeek(NOW), end: endOfDay(NOW) };
   }
}
// The comparison period immediately preceding a given range, same length
function previousPeriod(start, end) {
   const len = end - start;
   return {
      start: new Date(start.getTime() - len - DAY),
      end: new Date(start.getTime() - DAY),
   };
}
function pctChange(curr, prev) {
   if (prev === 0) return curr === 0 ? 0 : 100;
   return ((curr - prev) / prev) * 100;
}

/* Precompute a few dashboard defaults */
const DEFAULT_RANGE = resolvePreset("This Week");
const ALL_TIME_TOP_SONG = getTopSongs(PLAYBACK, 1)[0];

/* ------------------------------------------------------------------ */
/*  UI primitives                                                      */
/* ------------------------------------------------------------------ */
function cn(...xs) {
   return xs.filter(Boolean).join(" ");
}

function Card({ className, children }) {
   return (
      <div
         className={cn(
            "rounded-xl border border-neutral-200 bg-white",
            className,
         )}
      >
         {children}
      </div>
   );
}

function Badge({ tone = "neutral", children }) {
   const tones = {
      neutral: "bg-neutral-100 text-neutral-600",
      indigo: "bg-[var(--brand-primary)]/10 text-black",
      green: "bg-emerald-50 text-emerald-700",
      red: "bg-rose-50 text-rose-700",
      amber: "bg-[var(--brand-primary)]/10 text-black",
   };
   return (
      <span
         className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
            tones[tone],
         )}
      >
         {children}
      </span>
   );
}

function Skeleton({ className }) {
   return (
      <div
         className={cn("animate-pulse rounded-md bg-neutral-100", className)}
      />
   );
}

function ChangeTag({ value }) {
   if (value === null || value === undefined || Number.isNaN(value))
      return null;
   const up = value >= 0;
   const Icon = up ? TrendingUp : TrendingDown;
   return (
      <span
         className={cn(
            "inline-flex items-center gap-1 text-xs font-medium",
            up ? "text-emerald-600" : "text-rose-600",
         )}
      >
         <Icon size={13} strokeWidth={2.5} />
         {up ? "+" : ""}
         {value.toFixed(1)}%
      </span>
   );
}

function EmptyState({ icon: Icon = Inbox, title, message }) {
   return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
         <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <Icon size={20} />
         </div>
         <p className="text-sm font-medium text-neutral-800">{title}</p>
         <p className="max-w-xs text-sm text-neutral-500">{message}</p>
      </div>
   );
}

function ErrorState({ message }) {
   return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
         <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <AlertTriangle size={20} />
         </div>
         <p className="text-sm font-medium text-neutral-800">
            Something didn&apos;t load
         </p>
         <p className="max-w-xs text-sm text-neutral-500">
            {message || "Please try again in a moment."}
         </p>
      </div>
   );
}

/* A small hook that fakes a brief load whenever `deps` change, so we
   have something real to show skeleton states for. */
function useSimulatedLoad(deps = []) {
   const [loading, setLoading] = useState(true);
   useEffect(() => {
      // This intentionally re-triggers a brief skeleton state when the
      // dependency set changes, so the UI feels responsive without flashing.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 380);
      return () => clearTimeout(t);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, deps);
   return loading;
}

/* ------------------------------------------------------------------ */
/*  Date range filter                                                  */
/* ------------------------------------------------------------------ */
function DateRangeFilter({ value, onChange, align = "right" }) {
   const [open, setOpen] = useState(false);
   const [customStart, setCustomStart] = useState(
      toInputDate(addDays(NOW, -6)),
   );
   const [customEnd, setCustomEnd] = useState(toInputDate(NOW));

   function choose(preset) {
      if (preset === "Custom Range") {
         onChange({ preset, ...resolvePreset(preset, customStart, customEnd) });
      } else {
         onChange({ preset, ...resolvePreset(preset) });
         setOpen(false);
      }
   }
   function applyCustom() {
      onChange({
         preset: "Custom Range",
         ...resolvePreset("Custom Range", customStart, customEnd),
      });
      setOpen(false);
   }

   return (
      <div className="relative">
         <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50"
         >
            <span>{value.preset}</span>
            <ChevronDown
               size={15}
               className={cn(
                  "text-neutral-400 transition-transform",
                  open && "rotate-180",
               )}
            />
         </button>
         {open && (
            <>
               <button
                  aria-hidden
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setOpen(false)}
               />
               <div
                  className={cn(
                     "absolute z-50 mt-2 w-64 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg",
                     align === "right" ? "right-0" : "left-0",
                  )}
               >
                  {PRESETS.filter(p => p !== "Custom Range").map(p => (
                     <button
                        key={p}
                        onClick={() => choose(p)}
                        className={cn(
                           "block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-50",
                           value.preset === p
                              ? "bg-[var(--brand-primary)]/10 font-medium text-black"
                              : "text-neutral-700",
                        )}
                     >
                        {p}
                     </button>
                  ))}
                  <div className="my-2 border-t border-neutral-100" />
                  <p className="px-3 pb-1 text-xs font-medium text-neutral-400">
                     Custom Range
                  </p>
                  <div className="flex items-center gap-2 px-3 pb-2">
                     <input
                        type="date"
                        value={customStart}
                        max={customEnd}
                        onChange={e => setCustomStart(e.target.value)}
                        className="w-full rounded-md border border-neutral-200 px-2 py-1 text-xs"
                     />
                     <span className="text-neutral-300">–</span>
                     <input
                        type="date"
                        value={customEnd}
                        min={customStart}
                        max={toInputDate(NOW)}
                        onChange={e => setCustomEnd(e.target.value)}
                        className="w-full rounded-md border border-neutral-200 px-2 py-1 text-xs"
                     />
                  </div>
                  <button
                     onClick={applyCustom}
                     className="mx-3 mb-1 rounded-lg bg-[var(--brand-primary)] px-3 py-1.5 text-xs font-medium text-black hover:bg-[#d19f1f]"
                  >
                     Apply range
                  </button>
               </div>
            </>
         )}
      </div>
   );
}

/* ------------------------------------------------------------------ */
/*  Generic sortable / searchable / paginated table                    */
/* ------------------------------------------------------------------ */
function DataTable({
   columns,
   data,
   pageSize = 8,
   onRowClick,
   searchPlaceholder,
   searchKeys,
   initialSort,
   defaultQuery = "",
   emptyMessage = "No results found.",
   showPageSizeControl = false,
   pageSizeOptions = [8, 12, 15, 20],
}) {
   const [query, setQuery] = useState(defaultQuery);
   const [sort, setSort] = useState(initialSort || null);
   const [page, setPage] = useState(1);
   const [rowsPerPage, setRowsPerPage] = useState(pageSize);

   const filtered = useMemo(() => {
      if (!query || !searchKeys) return data;
      const q = query.toLowerCase();
      return data.filter(row =>
         searchKeys.some(k =>
            String(row[k] ?? "")
               .toLowerCase()
               .includes(q),
         ),
      );
   }, [data, query, searchKeys]);

   const sorted = useMemo(() => {
      if (!sort) return filtered;
      const { key, dir } = sort;
      return [...filtered].sort((a, b) => {
         const av = a[key],
            bv = b[key];
         if (typeof av === "number" && typeof bv === "number")
            return dir === "asc" ? av - bv : bv - av;
         return dir === "asc"
            ? String(av).localeCompare(String(bv))
            : String(bv).localeCompare(String(av));
      });
   }, [filtered, sort]);

   const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
   const clampedPage = Math.min(page, totalPages);
   const pageData = sorted.slice(
      (clampedPage - 1) * rowsPerPage,
      clampedPage * rowsPerPage,
   );

   function toggleSort(key) {
      setSort(s =>
         s && s.key === key
            ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
            : { key, dir: "desc" },
      );
   }

   return (
      <div>
         {searchKeys && (
            <div className="mb-3 flex items-center gap-2">
               <div className="relative w-full max-w-xs">
                  <Search
                     size={15}
                     className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                     value={query}
                     onChange={e => {
                        setQuery(e.target.value);
                        setPage(1);
                     }}
                     placeholder={searchPlaceholder || "Search…"}
                     className="w-full rounded-lg border border-neutral-200 bg-white py-1.5 pl-8 pr-3 text-sm placeholder:text-neutral-400 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                  />
               </div>
               <span className="text-xs text-neutral-400">
                  {sorted.length} result{sorted.length === 1 ? "" : "s"}
               </span>
            </div>
         )}

         {sorted.length === 0 ? (
            <EmptyState title="No matching rows" message={emptyMessage} />
         ) : (
            <>
               <div className="overflow-x-auto rounded-lg border border-neutral-200">
                  <table className="w-full min-w-[640px] border-collapse text-sm">
                     <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                           {columns.map(col => (
                              <th
                                 key={col.key}
                                 className={cn(
                                    "px-4 py-2.5 font-medium text-neutral-500",
                                    col.align === "right" && "text-right",
                                 )}
                              >
                                 {col.sortable ? (
                                    <button
                                       onClick={() => toggleSort(col.key)}
                                       className="inline-flex items-center gap-1 hover:text-neutral-800"
                                    >
                                       {col.label}
                                       <ArrowUpDown
                                          size={12}
                                          className={cn(
                                             sort?.key === col.key
                                                ? "text-[var(--brand-primary)]"
                                                : "text-neutral-300",
                                          )}
                                       />
                                    </button>
                                 ) : (
                                    col.label
                                 )}
                              </th>
                           ))}
                        </tr>
                     </thead>
                     <tbody>
                        {pageData.map((row, i) => (
                           <tr
                              key={row.id ?? i}
                              onClick={() => onRowClick?.(row)}
                              className={cn(
                                 "border-b border-neutral-100 last:border-0",
                                 onRowClick &&
                                    "cursor-pointer hover:bg-neutral-50",
                              )}
                           >
                              {columns.map(col => (
                                 <td
                                    key={col.key}
                                    className={cn(
                                       "px-4 py-2.5 text-neutral-700",
                                       col.align === "right" &&
                                          "text-right tabular-nums",
                                    )}
                                 >
                                    {col.render
                                       ? col.render(row)
                                       : row[col.key]}
                                 </td>
                              ))}
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {(totalPages > 1 || showPageSizeControl) && (
                  <div className="mt-3 flex items-center justify-between text-sm text-neutral-500">
                     <div className="flex items-center gap-4">
                        {showPageSizeControl && (
                           <label className="flex items-center gap-2">
                              <span>Show rows</span>
                              <select
                                 value={rowsPerPage}
                                 onChange={event => {
                                    setRowsPerPage(Number(event.target.value));
                                    setPage(1);
                                 }}
                                 className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm text-neutral-700"
                              >
                                 {pageSizeOptions.map(size => (
                                    <option key={size} value={size}>
                                       {size}
                                    </option>
                                 ))}
                              </select>
                           </label>
                        )}
                        {totalPages > 1 && (
                           <>
                              <span>
                                 Page {clampedPage} of {totalPages}
                              </span>
                              <div className="flex items-center gap-1">
                                 <button
                                    disabled={clampedPage === 1}
                                    onClick={() => setPage(1)}
                                    className="rounded-md p-1.5 hover:bg-neutral-100 disabled:opacity-30"
                                 >
                                    <ChevronsLeft size={15} />
                                 </button>
                                 <button
                                    disabled={clampedPage === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="rounded-md p-1.5 hover:bg-neutral-100 disabled:opacity-30"
                                 >
                                    <ChevronLeft size={15} />
                                 </button>
                                 <button
                                    disabled={clampedPage === totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="rounded-md p-1.5 hover:bg-neutral-100 disabled:opacity-30"
                                 >
                                    <ChevronRight size={15} />
                                 </button>
                                 <button
                                    disabled={clampedPage === totalPages}
                                    onClick={() => setPage(totalPages)}
                                    className="rounded-md p-1.5 hover:bg-neutral-100 disabled:opacity-30"
                                 >
                                    <ChevronsRight size={15} />
                                 </button>
                              </div>
                           </>
                        )}
                     </div>
                  </div>
               )}
            </>
         )}
      </div>
   );
}

/* ------------------------------------------------------------------ */
/*  Chart tooltip                                                      */
/* ------------------------------------------------------------------ */
function ChartTooltip({ active, payload, label }) {
   if (!active || !payload?.length) return null;
   return (
      <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-md">
         <p className="mb-0.5 font-medium text-neutral-800">
            {payload[0].payload.fullLabel || label}
         </p>
         <p className="text-[var(--brand-primary)]">
            {payload[0].value.toLocaleString()} plays
         </p>
      </div>
   );
}

/* ------------------------------------------------------------------ */
/*  Dashboard page                                                      */
/* ------------------------------------------------------------------ */
function StatCard({ label, value, sub, change, loading, accent }) {
   if (loading) {
      return (
         <Card className="p-4">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-3 h-7 w-24" />
            <Skeleton className="mt-2 h-3 w-16" />
         </Card>
      );
   }
   return (
      <Card
         className={cn(
            "p-4",
            accent &&
               "border-[var(--brand-primary)]/40 bg-gradient-to-br from-[var(--brand-primary)]/15 to-white",
         )}
      >
         <p className="text-xs font-medium text-neutral-500">{label}</p>
         <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-neutral-900">
            {value}
         </p>
         <div className="mt-1.5 flex items-center gap-2 text-xs text-neutral-400">
            {sub && <span>{sub}</span>}
            {change !== undefined && <ChangeTag value={change} />}
         </div>
      </Card>
   );
}

function PlaybackOverviewChart({ series, loading }) {
   if (loading) return <Skeleton className="h-64 w-full" />;
   return (
      <ResponsiveContainer width="100%" height={260}>
         <AreaChart
            data={series}
            margin={{ top: 6, right: 8, left: -18, bottom: 0 }}
         >
            <defs>
               <linearGradient id="playsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e4af24" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#e4af24" stopOpacity={0.02} />
               </linearGradient>
            </defs>
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
            <Tooltip content={<ChartTooltip />} />
            <Area
               type="monotone"
               dataKey="plays"
               name="Plays"
               stroke="#e4af24"
               strokeWidth={2}
               fill="url(#playsFill)"
               activeDot={{ r: 4 }}
            />
         </AreaChart>
      </ResponsiveContainer>
   );
}

export const MONTH_NAMES = [
   "January",
   "February",
   "March",
   "April",
   "May",
   "June",
   "July",
   "August",
   "September",
   "October",
   "November",
   "December",
];

export {
   cn,
   Card,
   Badge,
   Skeleton,
   ChangeTag,
   EmptyState,
   ErrorState,
   useSimulatedLoad,
   DateRangeFilter,
   DataTable,
   ChartTooltip,
   StatCard,
   PlaybackOverviewChart,
   DEFAULT_RANGE,
   startOfMonth,
   endOfMonth,
   startOfYear,
   endOfYear,
   daysInMonth,
   diffDaysInclusive,
   fmtDate,
   fmtDateFull,
   fmtTime,
   toInputDate,
   relativeTime,
   resolvePreset,
   previousPeriod,
   pctChange,
};
