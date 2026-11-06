"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Navigation, Radio, MapPin } from "lucide-react";

const LiveUSMap = dynamic(
  () => import("@/components/map/LiveUSMap").then((mod) => mod.LiveUSMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[680px] w-full flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-3 animate-pulse">
          <Navigation className="h-6 w-6 stroke-[1.75]" />
        </div>
        <p className="text-sm font-semibold text-slate-800">
          Loading Live Fleet Map...
        </p>
      </div>
    ),
  }
);

export default function LiveMapPage() {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-0.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-semibold tracking-tight text-slate-800">
              Live Fleet Tracking Map
            </h1>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Live GPS Stream • 2.5s Sync
            </span>
          </div>
          <p className="text-xs font-normal text-slate-500 mt-0.5">
            Real-time GPS telemetry from active driver mobile applications
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5 rounded bg-white px-2.5 py-0.5 border border-slate-200 shadow-2xs font-medium text-slate-700">
            <MapPin className="h-3 w-3 text-blue-600" />
            Active Operations Hub
          </span>
        </div>
      </div>

      <LiveUSMap />
    </div>
  );
}
