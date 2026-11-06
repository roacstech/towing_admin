"use client";

import React from "react";
import { Bell, Search, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export function Topbar({
  title = "Overview",
  subtitle = "Dispatch & fleet monitoring",
}: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-slate-200/80 bg-white px-5">
      <div>
        <h2 className="text-xs font-medium text-slate-800">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] font-normal text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search Bar shortcut */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 stroke-[1.75]" />
          <input
            type="text"
            placeholder="Search tows, drivers, plates..."
            className="h-8 w-56 rounded-lg border border-slate-200 bg-slate-50/70 pl-8 pr-3 text-xs font-normal text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        {/* Notifications Icon */}
        <button
          title="Notifications"
          className="relative rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Bell className="h-4 w-4 stroke-[1.75]" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-600" />
        </button>

        {/* Admin Profile pill */}
        <div className="flex items-center gap-2 border-l border-slate-200/80 pl-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-700 font-medium text-[11px] border border-blue-100">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-medium text-slate-800">
              {user?.name || "Admin Dispatcher"}
            </p>
            <p className="text-[10px] font-normal text-slate-400 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500 stroke-[1.75]" />
              {user?.role || "Super Admin"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
