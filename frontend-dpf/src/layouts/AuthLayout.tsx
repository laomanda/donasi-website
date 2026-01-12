import type { PropsWithChildren } from "react";

type AuthLayoutProps = PropsWithChildren;

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-28 top-20 h-80 w-80 rounded-full bg-brandGreen-200/25 blur-[130px]" />
          <div className="absolute -right-28 bottom-12 h-80 w-80 rounded-full bg-brandGreen-300/20 blur-[130px]" />
        </div>

        <main className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
