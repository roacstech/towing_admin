"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, Shield, Star, RefreshCw, Eye, Radio, Smartphone, Truck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SearchBar } from "@/components/common/SearchBar";
import { formatDate } from "@/lib/utils";

interface DriverUser {
  id: number;
  firebase_uid: string | null;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  gender: string;
  avatar_index: number;
  rating: number;
  completed_tows: number;
  is_active: boolean;
  is_online?: boolean;
  online_status?: "online" | "on_trip" | "offline";
  active_tow_id?: string | null;
  truck_model?: string;
  created_at: string | null;
  updated_at: string | null;
}

export default function DriversPage() {
  const [search, setSearch] = useState("");
  const [drivers, setDrivers] = useState<DriverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"all" | "online" | "offline">("all");
  const isInitialMount = useRef(true);

  const fetchDrivers = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else if (isInitialMount.current) setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/drivers", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDrivers(json.data);
      } else {
        setError(json.error || "Failed to load drivers");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
      setRefreshing(false);
      isInitialMount.current = false;
    }
  }, []);

  useEffect(() => {
    fetchDrivers();

    // Auto-poll live driver online telemetry every 3 seconds
    const interval = setInterval(() => {
      fetchDrivers(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchDrivers]);

  const onlineDrivers = drivers.filter((d) => d.is_online);
  const offlineDrivers = drivers.filter((d) => !d.is_online);

  const filteredDrivers = drivers.filter((d) => {
    // Tab filter
    if (selectedTab === "online" && !d.is_online) return false;
    if (selectedTab === "offline" && d.is_online) return false;

    // Search query
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      d.name.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q) ||
      (d.phone || "").toLowerCase().includes(q) ||
      (d.truck_model || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-semibold tracking-tight text-slate-800">
              Driver Management
            </h1>
            <span className="text-[11px] font-normal text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {drivers.length} Registered
            </span>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              {onlineDrivers.length} Online
            </span>
            {offlineDrivers.length > 0 && (
              <span className="text-[11px] font-normal text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {offlineDrivers.length} Offline
              </span>
            )}
          </div>
          <p className="text-xs font-normal text-slate-500 mt-0.5">
            Registered tow truck operators with role: &quot;driver&quot; synced from Towing Driver App &amp; live GPS
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchDrivers(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-normal text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 stroke-[1.75] ${refreshing ? "animate-spin text-blue-600" : ""}`}
            />
            <span>{refreshing ? "Syncing..." : "Refresh"}</span>
          </button>
          <SearchBar placeholder="Search driver name, email, phone..." onSearch={setSearch} />
        </div>
      </div>

      {/* Filter Tabs: All, Online, Offline */}
      <div className="flex gap-1.5 border-b border-slate-200/80 pb-2.5">
        <button
          type="button"
          onClick={() => setSelectedTab("all")}
          className={`rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer ${
            selectedTab === "all"
              ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          All Drivers ({drivers.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedTab("online")}
          className={`rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
            selectedTab === "online"
              ? "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Online ({onlineDrivers.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedTab("offline")}
          className={`rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer ${
            selectedTab === "offline"
              ? "bg-slate-100 text-slate-800 font-semibold border border-slate-300"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          Offline ({offlineDrivers.length})
        </button>
      </div>

      <Card className="overflow-hidden p-0 border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">DRIVER</th>
                <th className="py-3 px-4 font-semibold">PHONE NUMBER</th>
                <th className="py-3 px-4 font-semibold">SYSTEM ROLE</th>
                <th className="py-3 px-4 font-semibold text-center">RATING</th>
                <th className="py-3 px-4 font-semibold text-center">COMPLETED TOWS</th>
                <th className="py-3 px-4 font-semibold">ONLINE STATUS</th>
                <th className="py-3 px-4 font-semibold">REGISTERED</th>
                <th className="py-3 px-4 font-semibold text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600 stroke-[1.75]" />
                      <span>Loading drivers and live telemetry...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-rose-600">
                    <p>Error: {error}</p>
                    <button
                      type="button"
                      onClick={() => fetchDrivers()}
                      className="mt-2 text-xs text-blue-600 underline cursor-pointer"
                    >
                      Try again
                    </button>
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                    {search ? `No drivers matching "${search}".` : "No drivers found for this view."}
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => {
                  const initials = (driver.name || "D")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={driver.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {driver.name}
                            </p>
                            <p className="text-[11px] font-normal text-slate-500 truncate">
                              {driver.email}
                            </p>
                            {driver.truck_model && (
                              <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                <Truck className="h-2.5 w-2.5" />
                                {driver.truck_model}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-normal text-slate-800 whitespace-nowrap">
                        {driver.phone || "—"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge variant="info">
                          {driver.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 text-slate-800">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-xs">
                            {Number(driver.rating || 5.0).toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap font-medium text-slate-800">
                        {driver.completed_tows || 0}
                      </td>

                      {/* Online / Offline Status Column */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {driver.is_online ? (
                          driver.online_status === "on_trip" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 shadow-2xs">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                              </span>
                              Online (On Trip)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 shadow-2xs">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              Online
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-normal text-slate-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                            Offline
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-normal text-slate-600 whitespace-nowrap text-xs">
                        {driver.created_at ? formatDate(driver.created_at) : "—"}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <Link
                          href={`/drivers/${driver.id}`}
                          className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-normal text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors shadow-2xs"
                        >
                          <Eye className="h-3.5 w-3.5 stroke-[1.75]" />
                          <span>Inspect</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
