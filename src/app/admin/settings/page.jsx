"use client";

import { useState } from "react";
import { Card, cn } from "../_shared";

export default function SettingsPage() {
   const [venueName, setVenueName] = useState("The Note Bar");
   const [weekStart, setWeekStart] = useState("Monday");
   const [notifs, setNotifs] = useState(true);

   return (
      <div className="max-w-xl space-y-5">
         <div>
            <h2 className="text-lg font-semibold text-neutral-900">Settings</h2>
            <p className="text-sm text-neutral-500">
               General preferences for this karaoke system.
            </p>
         </div>

         <Card className="space-y-4 p-5">
            <div>
               <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Venue name
               </label>
               <input
                  value={venueName}
                  onChange={e => setVenueName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
               />
            </div>

            <div>
               <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Week starts on
               </label>
               <select
                  value={weekStart}
                  onChange={e => setWeekStart(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
               >
                  <option>Monday</option>
                  <option>Sunday</option>
               </select>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2.5">
               <div>
                  <p className="text-sm font-medium text-neutral-700">
                     Playback notifications
                  </p>
                  <p className="text-xs text-neutral-500">
                     Get notified when a song crosses a play-count milestone.
                  </p>
               </div>

               <button
                  type="button"
                  aria-pressed={notifs}
                  onClick={() => setNotifs(n => !n)}
                  className={cn(
                     "h-6 w-10 shrink-0 rounded-full transition-colors",
                     notifs ? "bg-[var(--brand-primary)]" : "bg-neutral-200",
                  )}
               >
                  <span
                     className={cn(
                        "block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform",
                        notifs ? "translate-x-[18px]" : "translate-x-0.5",
                     )}
                  />
               </button>
            </div>

            <button
               type="button"
               className="
    relative overflow-hidden rounded-lg
    bg-(--brand-primary) px-4 py-2
    text-sm font-medium text-black
    transition-colors duration-700
    before:absolute before:inset-y-0 before:inset-x-0 before:left-0 before:top-0 before:w-0
    before:bg-black
    before:transition-all before:duration-700 before:ease-in-out
    hover:before:w-full
    hover:text-(--brand-primary)
  "
            >
               <span className="relative">Save changes</span>
            </button>
         </Card>
      </div>
   );
}
