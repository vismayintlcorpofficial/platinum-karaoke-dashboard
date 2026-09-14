const MONTH_NAMES = [
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

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfDay(d) {
   const x = new Date(d);
   x.setHours(0, 0, 0, 0);
   return x;
}

function endOfDay(d) {
   const x = new Date(d);
   x.setHours(23, 59, 59, 999);
   return x;
}

function addDays(d, n) {
   const x = new Date(d);
   x.setDate(x.getDate() + n);
   return x;
}

function addMonths(d, n) {
   const x = new Date(d);
   x.setMonth(x.getMonth() + n);
   return x;
}

// Monday-based week start
function startOfWeek(d) {
   const x = startOfDay(d);
   const day = (x.getDay() + 6) % 7;
   return addDays(x, -day);
}

function endOfWeek(d) {
   return endOfDay(addDays(startOfWeek(d), 6));
}

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
   return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
   });
}

function toInputDate(d) {
   return d.toISOString().slice(0, 10);
}

export {
   MONTH_NAMES,
   WEEKDAY_LABELS,
   startOfDay,
   endOfDay,
   addDays,
   addMonths,
   startOfWeek,
   endOfWeek,
   DAY,
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
};
