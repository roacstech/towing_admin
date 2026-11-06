"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { TopNavbar } from "./TopNavbar";
import { GreetingBanner } from "./GreetingBanner";

interface DashboardShellProps {
  children: React.ReactNode;
}

function InnerDashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const isMapPage =
    pathname === "/map" ||
    pathname.startsWith("/live-map") ||
    pathname.startsWith("/live-tracking");

  return (
    <div
      className={`flex flex-col bg-slate-50 ${
        isMapPage
          ? "h-screen max-h-screen overflow-hidden"
          : "min-h-screen"
      }`}
    >
      {/* Top Navbar */}
      <Suspense fallback={<div className="h-12 w-full bg-[#0060df] shrink-0" />}>
        <TopNavbar />
      </Suspense>

      {/* Dynamic Greetings Section */}
      <Suspense
        fallback={
          <div className="h-9 w-full bg-white border-b border-slate-200/80 shrink-0" />
        }
      >
        <GreetingBanner />
      </Suspense>

      {/* Main Content Area */}
      <main
        className={`flex-1 w-full ${
          isMapPage
            ? "h-full overflow-hidden p-2 sm:p-2.5 flex flex-col min-h-0"
            : "p-4 md:p-5 mx-auto max-w-7xl"
        }`}
      >
        <Suspense
          fallback={
            <div className="flex h-48 items-center justify-center text-xs font-normal text-slate-400">
              Loading...
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-slate-50" />}>
      <InnerDashboardShell>{children}</InnerDashboardShell>
    </Suspense>
  );
}
