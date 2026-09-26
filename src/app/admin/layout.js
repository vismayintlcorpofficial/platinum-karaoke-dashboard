"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
   Mic2,
   ChevronLeft,
   ChevronDown,
   Bell,
   Search,
   Menu,
   User,
   LogOut,
   HelpCircle,
   X,
   LayoutDashboard,
   Music,
   Users,
   Settings,
} from "lucide-react";

const NAV_PRIMARY = [
   { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
   { href: "/admin/songs", label: "Songs", icon: Music },
   { href: "/admin/artists", label: "Artists", icon: Users },
];

const PAGE_META = {
   "/admin": "Dashboard",
   "/admin/songs": "Songs",
   "/admin/artists": "Artists",
   "/admin/settings": "Settings",
};

function cn(...xs) {
   return xs.filter(Boolean).join(" ");
}

function NavItem({
   href,
   icon: Icon,
   label,
   active,
   collapsed,
   onClick,
   nested,
}) {
   return (
      <Link
         href={href}
         onClick={onClick}
         title={collapsed ? label : undefined}
         className={cn(
            "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            nested && !collapsed && "pl-9",
            active
               ? "bg-[var(--brand-primary)]/10 font-medium text-black"
               : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
         )}
      >
         {Icon ? (
            <Icon
               size={17}
               strokeWidth={2}
               className={cn(
                  "shrink-0",
                  active
                     ? "text-[var(--brand-primary)]"
                     : "text-neutral-400 group-hover:text-neutral-600",
               )}
            />
         ) : (
            <span className="w-[17px] shrink-0" />
         )}
         {!collapsed && <span className="truncate">{label}</span>}
         {active && !collapsed && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)]" />
         )}
      </Link>
   );
}

function SidebarContent({ collapsed, onNavigate }) {
   const pathname = usePathname();

   return (
      <div className="flex h-full flex-col">
         <div
            className={cn(
               "flex items-center gap-2.5 px-4 py-5",
               collapsed && "justify-center px-0",
            )}
         >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-primary)] text-black">
               <Mic2 size={16} strokeWidth={2.5} />
            </div>
            {!collapsed && (
               <span className="text-[15px] font-semibold tracking-tight text-neutral-900">
                  Platinum Karaoke
               </span>
            )}
         </div>

         <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
            {NAV_PRIMARY.map(item => (
               <NavItem
                  key={item.href}
                  {...item}
                  collapsed={collapsed}
                  active={
                     pathname === item.href ||
                     (item.href === "/admin/songs" &&
                        pathname === "/admin/songs") ||
                     (item.href === "/admin/artists" &&
                        pathname === "/admin/artists")
                  }
                  onClick={onNavigate}
               />
            ))}

            <NavItem
               href="/admin/settings"
               icon={Settings}
               label="Settings"
               collapsed={collapsed}
               active={pathname === "/admin/settings"}
               onClick={onNavigate}
            />
         </nav>

         <div
            className={cn(
               "border-t border-neutral-100 p-3",
               collapsed && "flex justify-center",
            )}
         >
            <div
               className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-2",
                  !collapsed && "bg-neutral-50",
               )}
            >
               <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
                  A
               </div>
               {!collapsed && (
                  <div className="min-w-0 leading-tight">
                     <p className="truncate text-xs font-medium text-neutral-800">
                        Admin
                     </p>
                     <p className="truncate text-[11px] text-neutral-400">
                        Platinum Karaoke
                     </p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}

function Header({ collapsed, setCollapsed, setMobileOpen }) {
   const pathname = usePathname();
   const router = useRouter();
   const [notifOpen, setNotifOpen] = useState(false);
   const [profileOpen, setProfileOpen] = useState(false);
   const [searchVal, setSearchVal] = useState("");

   function handleSearch(q) {
      if (!q.trim()) return;
      router.push(`/admin/songs?q=${encodeURIComponent(q.trim())}`);
   }

   return (
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur">
         <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 md:hidden"
         >
            <Menu size={19} />
         </button>
         <button
            onClick={() => setCollapsed(c => !c)}
            className="hidden rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 md:block"
         >
            <ChevronLeft
               size={17}
               className={cn("transition-transform", collapsed && "rotate-180")}
            />
         </button>
         <h1 className="text-[15px] font-semibold text-neutral-900">
            {PAGE_META[pathname] || "Dashboard"}
         </h1>

         <div className="ml-auto flex items-center gap-1.5">
            <form
               onSubmit={e => {
                  e.preventDefault();
                  handleSearch(searchVal);
               }}
               className="relative hidden sm:block"
            >
               <Search
                  size={14}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
               />
               <input
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  placeholder="Search songs, artists…"
                  className="w-52 rounded-lg border border-neutral-200 bg-neutral-50 py-1.5 pl-8 pr-3 text-sm placeholder:text-neutral-400 focus:border-[var(--brand-primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
               />
            </form>

            <div className="relative">
               <button
                  onClick={() => {
                     setNotifOpen(v => !v);
                     setProfileOpen(false);
                  }}
                  className="relative rounded-md p-2 text-neutral-500 hover:bg-neutral-100"
               >
                  <Bell size={17} />
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
               </button>
               {notifOpen && (
                  <>
                     <button
                        aria-hidden
                        className="fixed inset-0 z-40"
                        onClick={() => setNotifOpen(false)}
                     />
                     <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg">
                        <p className="px-2 py-1 text-xs font-medium text-neutral-400">
                           Notifications
                        </p>
                        {[
                           {
                              t: "“Hotel California” just hit 1,000 plays",
                              s: "2 min ago",
                           },
                           {
                              t: "Playback data synced successfully",
                              s: "3 hours ago",
                           },
                           {
                              t: "New song added: “Perfect” by Ed Sheeran",
                              s: "1 day ago",
                           },
                        ].map((n, i) => (
                           <div
                              key={i}
                              className="rounded-lg px-2 py-2 hover:bg-neutral-50"
                           >
                              <p className="text-sm text-neutral-700">{n.t}</p>
                              <p className="text-xs text-neutral-400">{n.s}</p>
                           </div>
                        ))}
                     </div>
                  </>
               )}
            </div>

            <div className="relative">
               <button
                  onClick={() => {
                     setProfileOpen(v => !v);
                     setNotifOpen(false);
                  }}
                  className="flex items-center gap-1.5 rounded-md py-1 pl-1.5 pr-2 hover:bg-neutral-100"
               >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-primary)] text-xs font-semibold text-black">
                     A
                  </div>
                  <span className="hidden text-sm font-medium text-neutral-700 sm:block">
                     Admin
                  </span>
                  <ChevronDown
                     size={13}
                     className="hidden text-neutral-400 sm:block"
                  />
               </button>
               {profileOpen && (
                  <>
                     <button
                        aria-hidden
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileOpen(false)}
                     />
                     <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg">
                        <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                           <User size={15} /> Profile
                        </button>
                        <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                           <HelpCircle size={15} /> Help
                        </button>
                        <div className="my-1 border-t border-neutral-100" />
                        <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-rose-600 hover:bg-rose-50">
                           <LogOut size={15} /> Log out
                        </button>
                     </div>
                  </>
               )}
            </div>
         </div>
      </header>
   );
}

export default function AdminLayout({ children }) {
   const [collapsed, setCollapsed] = useState(false);
   const [mobileOpen, setMobileOpen] = useState(false);

   return (
      <div
         className="flex h-full min-h-screen w-full bg-neutral-50 text-neutral-900"
         style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
      >
         <aside
            className={cn(
               "hidden shrink-0 border-r border-neutral-200 bg-white transition-[width] duration-200 md:block",
               collapsed ? "w-[68px]" : "w-60",
            )}
         >
            <Suspense fallback={null}>
               <SidebarContent collapsed={collapsed} />
            </Suspense>
         </aside>

         {mobileOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
               <button
                  aria-label="Close menu"
                  className="absolute inset-0 bg-neutral-900/40"
                  onClick={() => setMobileOpen(false)}
               />
               <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
                  <div className="flex items-center justify-end px-3 pt-3">
                     <button
                        onClick={() => setMobileOpen(false)}
                        className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100"
                     >
                        <X size={18} />
                     </button>
                  </div>
                  <Suspense fallback={null}>
                     <SidebarContent
                        collapsed={false}
                        onNavigate={() => setMobileOpen(false)}
                     />
                  </Suspense>
               </div>
            </div>
         )}

         <div className="flex min-w-0 flex-1 flex-col">
            <Header
               collapsed={collapsed}
               setCollapsed={setCollapsed}
               setMobileOpen={setMobileOpen}
            />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
               <div className="mx-auto max-w-7xl">{children}</div>
            </main>
         </div>
      </div>
   );
}
