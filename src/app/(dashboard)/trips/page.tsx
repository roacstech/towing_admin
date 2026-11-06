"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Clock, Eye, Download, RefreshCw, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/common/SearchBar";
import { TowStatusBadge } from "@/components/tows/TowStatusBadge";
import { TOW_STATUS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface TripItem {
  id: string;
  towId?: string;
  customerName?: string;
  customer?: string;
  driverName?: string;
  driver?: string;
  vehicle?: string;
  pickup?: string;
  dropoff?: string;
  distanceMiles?: number;
  distance?: string;
  duration?: string;
  fare?: number | string;
  completedAt?: string;
  status: string;
}

export default function TripHistoryPage() {
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const loadTrips = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/trips");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTrips(json.data);
      }
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const filtered = trips.filter((t) => {
    const cust = (t.customerName || t.customer || "").toLowerCase();
    const drv = (t.driverName || t.driver || "").toLowerCase();
    const id = String(t.id || t.towId || "").toLowerCase();
    const q = search.toLowerCase();
    return cust.includes(q) || drv.includes(q) || id.includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium tracking-tight text-slate-800">
              Trip History Screen
            </h1>
            <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <Smartphone className="h-3 w-3 stroke-[1.75]" />
              {trips.length} Completed Trips
            </span>
          </div>
          <p className="text-xs font-normal text-slate-500 mt-0.5">
            Audit completed tows, driver mileage, route durations, and finalized fares
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadTrips(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-normal text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh trips"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 stroke-[1.75] ${refreshing ? "animate-spin text-blue-600" : ""}`}
            />
            <span>{refreshing ? "Syncing..." : "Refresh"}</span>
          </button>
          <SearchBar placeholder="Search trip ID, customer, driver..." onSearch={setSearch} />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-normal text-slate-400">
                <th className="pb-2.5 font-normal">TRIP ID</th>
                <th className="pb-2.5 font-normal">CUSTOMER</th>
                <th className="pb-2.5 font-normal">DRIVER</th>
                <th className="pb-2.5 font-normal">VEHICLE</th>
                <th className="pb-2.5 font-normal">DISTANCE & TIME</th>
                <th className="pb-2.5 font-normal">COMPLETED AT</th>
                <th className="pb-2.5 font-normal">STATUS</th>
                <th className="pb-2.5 font-normal text-right">FARE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600 stroke-[1.75]" />
                      <span>Loading dynamic trip records...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-500">
                    No trip history found.
                  </td>
                </tr>
              ) : (
                filtered.map((trip) => (
                  <tr
                    key={trip.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-2.5 font-medium text-blue-600">
                      {trip.id}
                    </td>
                    <td className="py-2.5 font-medium text-slate-800">
                      {trip.customerName || trip.customer || "Customer"}
                    </td>
                    <td className="py-2.5 text-slate-700 font-normal">
                      {trip.driverName || trip.driver || "Driver"}
                    </td>
                    <td className="py-2.5 text-slate-600 font-normal">
                      {trip.vehicle || "Customer Vehicle"}
                    </td>
                    <td className="py-2.5 text-slate-700 font-normal">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-slate-400 stroke-[1.75]" />
                        <span>
                          {trip.distanceMiles ? `${trip.distanceMiles} mi` : trip.distance || "5.2 mi"} &bull; {trip.duration || "18m"}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-slate-500 font-normal">
                      {trip.completedAt ? formatDate(trip.completedAt) : "Recently"}
                    </td>
                    <td className="py-2.5">
                      <TowStatusBadge status={TOW_STATUS.COMPLETED} />
                    </td>
                    <td className="py-2.5 text-right font-medium text-slate-800">
                      {typeof trip.fare === "number" ? `$${trip.fare.toFixed(2)}` : trip.fare || "$85.00"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
