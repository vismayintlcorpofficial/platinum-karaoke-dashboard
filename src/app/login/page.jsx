"use client";

export default function LoginPage() {
   return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
         <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
            <div className="mb-6 text-center">
               <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                  Karaoke Admin
               </p>
               <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
                  Sign in
               </h1>
            </div>

            <form className="space-y-4">
               <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                     Email
                  </label>
                  <input
                     type="email"
                     defaultValue="admin@thenotebar.com"
                     className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-[var(--brand-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                  />
               </div>

               <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                     Password
                  </label>
                  <input
                     type="password"
                     defaultValue="password"
                     className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-[var(--brand-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                  />
               </div>

               <button
                  type="submit"
                  className="w-full rounded-lg bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-medium text-black transition hover:bg-[#d19f1f]"
               >
                  Log in
               </button>
            </form>
         </div>
      </main>
   );
}
