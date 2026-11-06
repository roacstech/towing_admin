"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Eye, UserPlus, RefreshCw, Smartphone, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SearchBar } from "@/components/common/SearchBar";
import { TowStatusBadge } from "@/components/tows/TowStatusBadge";

interface TowItem {
  id: string;
  raw_id?: string;
  customer_name: string;
  customer_phone?: string;
  driver_name?: string;
  driver_phone?: string;
  tow_truck_info?: string;
  service_title: string;
  vehicle_name?: string;
  license_plate?: string;
  status: string;
  pickup_address: string;
  drop_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  drop_lat?: number;
  drop_lng?: number;
  driver_lat?: number;
  driver_lng?: number;
  total_cost?: string;
  payment_method?: string;
  eta_or_duration?: string;
  created_at?: string;
  updated_at?: string;
}

function cleanAddress(addr?: string): string {
  if (!addr) return "—";
  // Remove raw trailing coordinates like (11.1389, 77.0326) for clean UI
  return addr.replace(/\s*\(\s*[-+]?\d+\.\d+,\s*[-+]?\d+\.\d+\s*\)\s*$/, "").trim();
}

export default function TowsListPage() {
  const [tows, setTows] = useState<TowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("");
  const isInitialMount = useRef(true);

  const loadTows = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else if (isInitialMount.current) setLoading(true);

    try {
      const res = await fetch("/api/tows", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTows(json.data);
        const now = new Date();
        setLastSyncedTime(
          now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        );
      }
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
      isInitialMount.current = false;
    }
  }, []);

  useEffect(() => {
    loadTows();

    // Live continuous polling: sync every 3 seconds to catch live driver GPS & stage changes
    const interval = setInterval(() => {
      loadTows(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [loadTows]);

  const filteredTows = tows.filter((tow) => {
    const status = (tow.status || "").toLowerCase().trim();
    const isUnassigned = !tow.driver_name || tow.driver_name.toLowerCase().trim() === "unassigned";

    let matchesFilter = false;
    if (selectedFilter === "all") {
      matchesFilter = true;
    } else if (selectedFilter === "needs_admin") {
      matchesFilter = status.includes("admin_dispatch") || (status.includes("pending") && isUnassigned);
    } else if (selectedFilter === "pending") {
      matchesFilter = ["pending", "waiting", "awaiting_driver", "pending_admin_dispatch"].includes(status);
    } else if (selectedFilter === "in_progress") {
      matchesFilter = [
        "accepted",
        "en_route",
        "en route",
        "on_scene",
        "arrived",
        "towing",
        "in_progress",
        "active",
        "in transit",
      ].includes(status);
    } else if (selectedFilter === "completed") {
      matchesFilter = ["completed", "done"].includes(status);
    } else if (selectedFilter === "cancelled") {
      matchesFilter = ["cancelled", "canceled"].includes(status);
    }

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      String(tow.id || "").toLowerCase().includes(q) ||
      (tow.raw_id && tow.raw_id.toLowerCase().includes(q)) ||
      (tow.customer_name || "").toLowerCase().includes(q) ||
      (tow.customer_phone || "").toLowerCase().includes(q) ||
      (tow.driver_name || "").toLowerCase().includes(q) ||
      (tow.service_title || "").toLowerCase().includes(q) ||
      (tow.vehicle_name || "").toLowerCase().includes(q) ||
      (tow.license_plate || "").toLowerCase().includes(q) ||
      (tow.pickup_address || "").toLowerCase().includes(q) ||
      (tow.drop_address || "").toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const inProgressCount = tows.filter((t) =>
    [
      "accepted",
      "en_route",
      "en route",
      "on_scene",
      "arrived",
      "towing",
      "in_progress",
      "active",
      "in transit",
    ].includes((t.status || "").toLowerCase().trim())
  ).length;

  const needsAdminCount = tows.filter((t) => {
    const s = (t.status || "").toLowerCase().trim();
    const isUnassigned = !t.driver_name || t.driver_name.toLowerCase().trim() === "unassigned";
    return s.includes("admin_dispatch") || (s.includes("pending") && isUnassigned);
  }).length;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-tight text-slate-800">
              Tow Requests &amp; Dispatch
            </h1>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Feed
            </span>
            {inProgressCount > 0 && (
              <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {inProgressCount} in progress
              </span>
            )}
            {needsAdminCount > 0 && (
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                {needsAdminCount} Needs Driver
              </span>
            )}
          </div>
          <p className="text-xs font-normal text-slate-500 mt-0.5">
            Real-time synchronization with Customer App &amp; Towing Driver App
          </p>
        </div>

        <div className="flex items-center gap-2">
          {lastSyncedTime && (
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400 mr-1">
              <Clock className="h-3 w-3 stroke-[1.75]" />
              {lastSyncedTime}
            </span>
          )}
          <button
            type="button"
            onClick={() => loadTows(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-normal text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            title="Force refresh live dispatches"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 stroke-[1.75] ${refreshing ? "animate-spin text-blue-600" : ""}`}
            />
            <span>{refreshing ? "Syncing..." : "Refresh"}</span>
          </button>
          <SearchBar placeholder="Search ID, customer, vehicle, driver..." onSearch={setSearchQuery} />
        </div>
      </div>

      {/* Manual Dispatch Alert if any orders timed out / passed */}
      {needsAdminCount > 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-900 text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            <span className="font-bold text-amber-950">
              {needsAdminCount} Tow Request{needsAdminCount > 1 ? "s" : ""} Require Manual Driver Assignment
            </span>
            <span className="text-amber-800 hidden md:inline">
              — All nearby online drivers timed out (10s) or passed. Assign a driver below.
            </span>
          </div>
          <button
            onClick={() => setSelectedFilter("needs_admin")}
            className="font-bold underline text-amber-900 hover:text-black text-xs cursor-pointer ml-2"
          >
            Filter Needs Assign &rarr;
          </button>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto border-b border-slate-200/80 pb-2.5">
        {[
          { key: "all", label: `All Requests (${tows.length})` },
          {
            key: "needs_admin",
            label: `Needs Driver (${needsAdminCount})`,
            alert: needsAdminCount > 0,
          },
          {
            key: "in_progress",
            label: `In Transit (${inProgressCount})`,
          },
          {
            key: "pending",
            label: `Pending (${
              tows.filter((t) => ["pending", "waiting", "awaiting_driver"].includes((t.status || "").toLowerCase())).length
            })`,
          },
          {
            key: "completed",
            label: `Completed (${
              tows.filter((t) => ["completed", "done"].includes((t.status || "").toLowerCase())).length
            })`,
          },
          {
            key: "cancelled",
            label: `Cancelled (${
              tows.filter((t) => ["cancelled", "canceled"].includes((t.status || "").toLowerCase())).length
            })`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedFilter(tab.key)}
            className={`rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === tab.key
                ? "bg-blue-50 text-blue-700 font-medium border border-blue-200"
                : tab.alert
                ? "bg-amber-50 text-amber-900 font-medium hover:bg-amber-100 border border-amber-300"
                : "bg-white text-slate-600 font-normal hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {tab.alert && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Table with Pixel-Perfect Column Widths and Spacing */}
      <Card className="overflow-hidden p-0 border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                <th className="w-[110px] min-w-[110px] px-4 py-3 text-left">TOW ID</th>
                <th className="w-[180px] min-w-[180px] px-4 py-3 text-left">CUSTOMER</th>
                <th className="w-[210px] min-w-[210px] px-4 py-3 text-left">SERVICE &amp; VEHICLE</th>
                <th className="min-w-[280px] px-4 py-3 text-left">PICKUP &amp; DROPOFF</th>
                <th className="w-[190px] min-w-[190px] px-4 py-3 text-left">ASSIGNED DRIVER</th>
                <th className="w-[160px] min-w-[160px] px-4 py-3 text-left">STATUS</th>
                <th className="w-[110px] min-w-[110px] px-4 py-3 text-right">FARE</th>
                <th className="w-[90px] min-w-[90px] px-4 py-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600 stroke-[1.75]" />
                      <span>Loading live mobile app tows...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                    No tow requests matching the selected view.
                  </td>
                </tr>
              ) : (
                filteredTows.map((tow) => {
                  const targetId = tow.raw_id || String(tow.id).replaceAll("#", "").trim();
                  return (
                    <tr
                      key={tow.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* 1. TOW ID */}
                      <td className="w-[110px] min-w-[110px] px-4 py-3.5 align-top font-semibold text-blue-600 whitespace-nowrap">
                        <Link
                          href={`/tows/${encodeURIComponent(targetId)}`}
                          className="hover:underline inline-flex items-center gap-1"
                        >
                          {tow.id}
                        </Link>
                      </td>

                      {/* 2. CUSTOMER */}
                      <td className="w-[180px] min-w-[180px] px-4 py-3.5 align-top">
                        <p className="font-semibold text-slate-900 truncate">
                          {tow.customer_name || "Madhavan M.047"}
                        </p>
                        <p className="text-[11px] font-normal text-slate-400 mt-0.5 truncate">
                          {tow.customer_phone || "+91 97864 53128"}
                        </p>
                      </td>

                      {/* 3. SERVICE & VEHICLE */}
                      <td className="w-[210px] min-w-[210px] px-4 py-3.5 align-top">
                        <p className="font-medium text-slate-800 truncate">
                          {tow.service_title || "Light-Duty Towing"}
                        </p>
                        <p className="text-[11px] font-normal text-slate-500 mt-0.5 truncate">
                          {tow.vehicle_name || "Tesla Model 3"}
                          {tow.license_plate ? ` (${tow.license_plate})` : ""}
                        </p>
                      </td>

                      {/* 4. PICKUP & DROPOFF */}
                      <td className="min-w-[280px] px-4 py-3.5 align-top">
                        <div className="flex items-start gap-1.5">
                          <span className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider shrink-0 mt-0.5">
                            From:
                          </span>
                          <span className="text-slate-700 font-normal leading-tight line-clamp-1">
                            {cleanAddress(tow.pickup_address)}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5 mt-1">
                          <span className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider shrink-0 mt-0.5">
                            To:
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal leading-tight line-clamp-1">
                            {cleanAddress(tow.drop_address)}
                          </span>
                        </div>
                      </td>

                      {/* 5. ASSIGNED DRIVER */}
                      <td className="w-[190px] min-w-[190px] px-4 py-3.5 align-top">
                        {!tow.driver_name || tow.driver_name.toLowerCase() === "unassigned" ? (
                          <Link
                            href={`/tows/${encodeURIComponent(targetId)}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-300 text-amber-800 text-[11px] font-semibold hover:bg-amber-100 transition-colors shadow-2xs"
                          >
                            <UserPlus className="h-3 w-3 stroke-[2] text-amber-700" />
                            <span>Assign Driver</span>
                          </Link>
                        ) : (
                          <div>
                            <p className="font-semibold text-slate-900 truncate">{tow.driver_name}</p>
                            {tow.tow_truck_info && (
                              <p className="text-[11px] text-slate-500 truncate mt-0.5" title={tow.tow_truck_info}>
                                {tow.tow_truck_info}
                              </p>
                            )}
                            {tow.eta_or_duration && (
                              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                                ETA: {tow.eta_or_duration}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 6. STATUS */}
                      <td className="w-[160px] min-w-[160px] px-4 py-3.5 align-top">
                        <TowStatusBadge status={tow.status} />
                      </td>

                      {/* 7. FARE */}
                      <td className="w-[110px] min-w-[110px] px-4 py-3.5 align-top text-right">
                        <div className="font-semibold text-slate-900 text-xs">
                          {tow.total_cost || "$92.45"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5 truncate">
                          {tow.payment_method || "In-App Tow Pay"}
                        </div>
                      </td>

                      {/* 8. ACTION */}
                      <td className="w-[90px] min-w-[90px] px-4 py-3.5 align-top text-center">
                        <Link
                          href={`/tows/${encodeURIComponent(targetId)}`}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-normal text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-2xs"
                        >
                          <Eye className="h-3 w-3 stroke-[1.75]" />
                          <span>Details</span>
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
