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
        <p className="text-sm font-medium text-slate-800">
          Connecting to Live Fleet Telemetry...
        </p>
      </div>
    ),
  }
);

export default function LiveTrackingPage() {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-0.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-medium tracking-tight text-slate-800">
              Live Fleet Tracking
            </h1>
            <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <Radio className="h-2.5 w-2.5 animate-pulse text-emerald-600 stroke-[2]" />
              US Fleet Live
            </span>
          </div>
          <p className="text-xs font-normal text-slate-500 mt-0.5">
            Real-time GPS telemetry from active driver mobile applications
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 border border-slate-200">
            <MapPin className="h-3 w-3 text-blue-600" />
            Central US Hub: St. Cloud, MN
          </span>
        </div>
      </div>

      <LiveUSMap />
    </div>
  );
}
