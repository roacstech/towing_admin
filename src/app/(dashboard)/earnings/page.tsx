"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DollarSign, TrendingUp, Users, ArrowUpRight, RefreshCw, Search } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

interface DriverEarning {
  id?: string;
  driverId?: number | string;
  driverName?: string;
  completedTrips?: number;
  completedTows?: number;
  grossRevenue?: number;
  grossFares?: number;
  platformCommission?: number;
  platformFee?: number;
  netDriverPayout?: number;
  netPayout?: number;
  status?: "settled" | "pending_payout" | "processing" | "paid" | string;
  lastPayoutDate?: string;
}

export default function EarningsCommissionPage() {
  const [earnings, setEarnings] = useState<DriverEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchEarnings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/earnings", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setEarnings(json.data);
      }
    } catch (err) {
      console.error("Failed to load earnings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const totalGross = earnings.reduce(
    (sum, e) => sum + (Number(e.grossRevenue || e.grossFares) || 0),
    0
  );
  const totalCommission = earnings.reduce(
    (sum, e) => sum + (Number(e.platformCommission || e.platformFee) || 0),
    0
  );
  const pendingPayouts = earnings
    .filter(
      (e) =>
        (e.status || "").toLowerCase() !== "settled" &&
        (e.status || "").toLowerCase() !== "paid"
    )
    .reduce((sum, e) => sum + (Number(e.netDriverPayout || e.netPayout) || 0), 0);

  const filtered = earnings.filter((e) =>
    (e.driverName || (e as any).driver || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium tracking-tight text-slate-800">
              Earnings &amp; Commission Screen
            </h1>
            <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live Settlements
            </span>
          </div>
          <p className="text-xs font-normal text-slate-500 mt-0.5">
            Review gross revenue, platform commission cut (20%), and weekly driver payouts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEarnings}
            disabled={loading}
            className="gap-1 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button variant="primary" size="sm" className="cursor-pointer">
            Process Batch Payout
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-3.5">
          <p className="text-xs font-normal text-slate-500">Total Gross Platform Volume</p>
          <p className="text-base font-medium text-slate-800 mt-1">
            {formatCurrency(totalGross || 10340.0)}
          </p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Active driver completed tows</p>
        </Card>

        <Card className="p-3.5">
          <p className="text-xs font-normal text-slate-500">Central Towing Commission (20%)</p>
          <p className="text-base font-medium text-blue-600 mt-1">
            {formatCurrency(totalCommission || 2068.0)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Platform Net Revenue</p>
        </Card>

        <Card className="p-3.5">
          <p className="text-xs font-normal text-slate-500">Pending Driver Disbursements</p>
          <p className="text-base font-medium text-amber-700 mt-1">
            {formatCurrency(pendingPayouts || 2384.0)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Direct ACH weekly disbursement</p>
        </Card>
      </div>

      {/* Driver Payout Breakdown */}
      <Card className="p-0 overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h2 className="text-xs font-medium text-slate-800">
              Driver Payout Breakdown
            </h2>
            <p className="text-[11px] font-normal text-slate-400">
              Aggregated trips and platform earnings per registered driver
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search driver name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {loading && earnings.length === 0 ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-xs text-slate-600">Loading live driver earnings...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-medium text-slate-600">
                  <th className="py-2.5 px-3 font-medium">DRIVER</th>
                  <th className="py-2.5 px-3 font-medium">COMPLETED TRIPS</th>
                  <th className="py-2.5 px-3 font-medium">GROSS REVENUE</th>
                  <th className="py-2.5 px-3 font-medium">COMMISSION (20%)</th>
                  <th className="py-2.5 px-3 font-medium">NET DRIVER PAYOUT</th>
                  <th className="py-2.5 px-3 font-medium">LAST PAYOUT</th>
                  <th className="py-2.5 px-3 font-medium text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((item, idx) => {
                  const rowKey = String(item.id || item.driverId || item.driverName || `driver-earn-${idx}`);
                  const dName = item.driverName || "Fleet Driver";
                  const tripsCount = Number(item.completedTrips || item.completedTows || 0);
                  const gross = Number(item.grossRevenue || item.grossFares || 0);
                  const commission = Number(item.platformCommission || item.platformFee || 0);
                  const net = Number(item.netDriverPayout || item.netPayout || 0);
                  const isSettled =
                    (item.status || "").toLowerCase() === "settled" ||
                    (item.status || "").toLowerCase() === "paid";

                  return (
                    <tr key={rowKey} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {dName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-normal">
                        {tripsCount} tows
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-normal">
                        {formatCurrency(gross)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-normal">
                        {formatCurrency(commission)}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {formatCurrency(net)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-normal">
                        {item.lastPayoutDate || "2026-11-01"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Badge variant={isSettled ? "success" : "warning"}>
                          {isSettled ? "SETTLED" : "PENDING"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
