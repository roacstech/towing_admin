"use client";

import React from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, Radio } from "lucide-react";

// Dynamically import LiveUSMap with SSR disabled
const LiveUSMap = dynamic(
  () => import("@/components/map/LiveUSMap").then((mod) => mod.LiveUSMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-2 animate-pulse">
          <Navigation className="h-5 w-5 stroke-[1.75]" />
        </div>
        <p className="text-xs font-semibold text-slate-800">
          Initializing Live Fleet &amp; Dispatch Map...
        </p>
        <p className="text-[11px] font-normal text-slate-500 mt-0.5">
          Connecting to real-time driver mobile GPS stream and dispatches
        </p>
      </div>
    ),
  }
);

export default function MapPage() {
  return (
    <div className="h-full w-full flex-1 flex flex-col overflow-hidden min-h-0 space-y-1.5">
      {/* Compact Top Header Bar */}
      <div className="flex items-center justify-between px-1 shrink-0 h-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xs sm:text-sm font-semibold tracking-tight text-slate-800">
            Live Fleet &amp; Dispatch Map
          </h1>
          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            Live GPS Stream • 2.5s Sync
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
          <span className="inline-flex items-center gap-1.5 rounded bg-white px-2.5 py-0.5 border border-slate-200 text-slate-700 shadow-2xs font-medium">
            <MapPin className="h-3 w-3 text-blue-600" />
            Active Operations Hub
          </span>
        </div>
      </div>

      {/* Map fills 100% of viewport without vertical scrolling */}
      <div className="flex-1 w-full h-full min-h-0 overflow-hidden rounded-lg border border-slate-200 shadow-xs">
        <LiveUSMap />
      </div>
    </div>
  );
}
