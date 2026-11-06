"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Info,
  ArrowUpRight,
  Eye,
  Smartphone,
  Radio,
  RefreshCw,
  User,
  Star,
  CheckCircle2,
  Truck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { MiniBarChart } from "@/components/dashboard/MiniBarChart";
import { Badge } from "@/components/ui/Badge";
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

// 6 App Lifecycle Stages - Strictly NO subtexts in KPI cards
const STATUS_STAGES = [
  {
    key: "awaiting_driver",
    label: "AWAITING DRIVER",
    count: 3,
    barColor: "bg-[#f59e0b]", // Amber
  },
  {
    key: "driver_accepted",
    label: "DRIVER ACCEPTED",
    count: 4,
    barColor: "bg-[#2563eb]", // Blue
  },
  {
    key: "en_route_pickup",
    label: "EN ROUTE TO PICKUP",
    count: 5,
    barColor: "bg-[#10b981]", // Emerald
  },
  {
    key: "arrived_scene",
    label: "ARRIVED AT SCENE",
    count: 3,
    barColor: "bg-[#059669]", // Dark Green
  },
  {
    key: "towing_transit",
    label: "TOWING IN TRANSIT",
    count: 6,
    barColor: "bg-[#0284c7]", // Sky Blue
  },
  {
    key: "arrived_dropoff",
    label: "ARRIVED AT DROPOFF",
    count: 2,
    barColor: "bg-[#a855f7]", // Purple
  },
];

// Operational metrics for on-demand Customer App <-> Driver App workflow
const METRICS_7_DAYS = [
  {
    id: "jobs_completed",
    title: "App Jobs Completed (last 7 days)",
    tooltip: "Total roadside tow requests booked on Customer App and delivered by drivers",
    value: "48",
    trend: "+14% last 7 days",
    trendType: "positive" as const,
    chartData: [20, 30, 45, 25, 55, 95, 48],
  },
  {
    id: "driver_accept_rate",
    title: "Driver Acceptance Rate (last 7 days)",
    tooltip: "Percentage of app dispatch requests accepted by drivers on Towing Driver App",
    value: "96.4%",
    trend: "+2.1% driver response",
    trendType: "positive" as const,
    chartData: [92, 94, 95, 96, 95, 98, 96],
  },
  {
    id: "avg_accept_speed",
    title: "Avg Driver Accept Speed (last 7 days)",
    tooltip: "Time elapsed from customer booking to a nearby driver tapping Accept in Driver App",
    value: "34s",
    trend: "-6s faster response",
    trendType: "positive" as const,
    chartData: [50, 44, 42, 40, 39, 36, 34],
  },
  {
    id: "avg_eta",
    title: "Avg Driver Pickup ETA (last 7 days)",
    tooltip: "Average driving time from driver acceptance to arrival at customer breakdown location",
    value: "11m 40s",
    trend: "-1m 50s last 7 days",
    trendType: "positive" as const,
    chartData: [45, 38, 35, 30, 28, 22, 24],
  },
  {
    id: "photos_pct",
    title: "% Jobs with Vehicle Photos (last 7 days)",
    tooltip: "Pre-tow vehicle condition and damage inspection photos uploaded by driver in Driver App",
    value: "94%",
    trend: "+4% compliance",
    trendType: "positive" as const,
    chartData: [75, 80, 82, 88, 90, 96, 94],
  },
  {
    id: "gross_volume",
    title: "Gross In-App Booking Fares (last 7 days)",
    tooltip: "Gross customer payments processed through in-app cards, Apple Pay, and digital wallet",
    value: "$4,120.00",
    trend: "+12.5% revenue growth",
    trendType: "positive" as const,
    chartData: [35, 42, 50, 45, 68, 92, 60],
  },
];

const METRICS_30_DAYS = [
  {
    id: "jobs_completed",
    title: "App Jobs Completed (last 30 days)",
    tooltip: "Total roadside tow requests booked on Customer App and delivered by drivers",
    value: "196",
    trend: "+18% vs prev month",
    trendType: "positive" as const,
    chartData: [30, 45, 60, 50, 75, 100, 85],
  },
  {
    id: "driver_accept_rate",
    title: "Driver Acceptance Rate (last 30 days)",
    tooltip: "Percentage of app dispatch requests accepted by drivers on Towing Driver App",
    value: "95.8%",
    trend: "+1.9% vs prev month",
    trendType: "positive" as const,
    chartData: [90, 92, 94, 95, 96, 97, 96],
  },
  {
    id: "avg_accept_speed",
    title: "Avg Driver Accept Speed (last 30 days)",
    tooltip: "Time elapsed from customer booking to a nearby driver tapping Accept in Driver App",
    value: "38s",
    trend: "-8s faster response",
    trendType: "positive" as const,
    chartData: [55, 48, 45, 42, 41, 39, 38],
  },
  {
    id: "avg_eta",
    title: "Avg Driver Pickup ETA (last 30 days)",
    tooltip: "Average driving time from driver acceptance to arrival at customer breakdown location",
    value: "12m 15s",
    trend: "-1m 20s vs prev month",
    trendType: "positive" as const,
    chartData: [50, 42, 38, 32, 29, 25, 26],
  },
  {
    id: "photos_pct",
    title: "% Jobs with Vehicle Photos (last 30 days)",
    tooltip: "Pre-tow vehicle condition and damage inspection photos uploaded by driver in Driver App",
    value: "92%",
    trend: "+6% compliance",
    trendType: "positive" as const,
    chartData: [70, 75, 82, 86, 90, 94, 92],
  },
  {
    id: "gross_volume",
    title: "Gross In-App Booking Fares (last 30 days)",
    tooltip: "Gross customer payments processed through in-app cards, Apple Pay, and digital wallet",
    value: "$16,840.00",
    trend: "+15.2% revenue growth",
    trendType: "positive" as const,
    chartData: [40, 55, 65, 70, 85, 95, 88],
  },
];

export default function DashboardOverviewPage() {
  const [period, setPeriod] = useState<"7" | "30">("7");
  const [drivers, setDrivers] = useState<DriverUser[]>([]);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  const metricsData = period === "7" ? METRICS_7_DAYS : METRICS_30_DAYS;

  // Fetch dynamic driver & customer data strictly from API routes
  const loadDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else if (isInitialMount.current) {
      setLoadingDrivers(true);
      setLoadingCustomers(true);
    }
    setFetchError(null);

    try {
      const [driversRes, customersRes] = await Promise.allSettled([
        fetch("/api/drivers", { cache: "no-store" }),
        fetch("/api/customers", { cache: "no-store" }),
      ]);

      if (driversRes.status === "fulfilled") {
        const json = await driversRes.value.json();
        if (json.success && Array.isArray(json.data)) {
          setDrivers(json.data);
        } else {
          setFetchError(json.error || "Failed to load drivers");
        }
      }

      if (customersRes.status === "fulfilled") {
        const custJson = await customersRes.value.json();
        if (custJson.success) {
          if (typeof custJson.count === "number") {
            setCustomerCount(custJson.count);
          } else if (Array.isArray(custJson.data)) {
            setCustomerCount(custJson.data.length);
          }
        }
      }
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoadingDrivers(false);
      setLoadingCustomers(false);
      setRefreshing(false);
      isInitialMount.current = false;
    }
  }, []);

  useEffect(() => {
    loadDashboardData();

    // Live continuous sync: update drivers online/offline status every 3 seconds
    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const onlineDrivers = drivers.filter((d) => d.is_online);
  const offlineDrivers = drivers.filter((d) => !d.is_online);

  return (
    <div className="space-y-5">
      {/* SECTION 1: STATUS COUNTS & LIVE DRIVER FLEET ONLINE/OFFLINE */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-semibold text-slate-800">Status Counts</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 shadow-2xs">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              {onlineDrivers.length} Drivers Online
            </span>
            {offlineDrivers.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-normal text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                {offlineDrivers.length} Offline
              </span>
            )}
            <span className="text-[11px] font-normal text-slate-400">
              Live Sync 3s
            </span>
          </div>
        </div>

        {/* 6 Stage KPI Cards - Clean, Big Numbers & Clear Labels, NO Subtexts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {STATUS_STAGES.map((stage) => (
            <div
              key={stage.key}
              className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3.5 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div>
                <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                  {stage.count}
                </p>
                <p className="text-xs sm:text-[13px] font-medium tracking-wide text-slate-700 uppercase mt-1 truncate">
                  {stage.label}
                </p>
              </div>

              {/* Stage underline bar */}
              <div
                className={`h-1 w-full rounded-full mt-3.5 ${stage.barColor}`}
              />
            </div>
          ))}
        </div>

        {/* Key App Totals & Driver Availability Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
          {/* Active Drivers Online / Offline Card */}
          <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                  {loadingDrivers ? "..." : onlineDrivers.length}{" "}
                  <span className="text-sm font-normal text-slate-400">/ {drivers.length}</span>
                </p>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {onlineDrivers.length} Online
                </span>
              </div>
              <p className="text-xs sm:text-[13px] font-medium tracking-wide text-slate-700 uppercase mt-1">
                DRIVERS ONLINE STATUS
              </p>
            </div>
            <div className="flex gap-1.5 items-center mt-3.5">
              <div
                className="h-1 bg-emerald-500 rounded-full"
                style={{
                  width: `${Math.max(15, (onlineDrivers.length / Math.max(drivers.length, 1)) * 100)}%`,
                }}
              />
              <div className="h-1 bg-slate-200 rounded-full flex-1" />
              <span className="text-[10px] text-slate-400 font-normal shrink-0">
                {offlineDrivers.length} Offline
              </span>
            </div>
          </div>

          {/* Customers Using App Dedicated Card */}
          <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors">
            <div>
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                {loadingCustomers ? "..." : customerCount}
              </p>
              <p className="text-xs sm:text-[13px] font-medium tracking-wide text-slate-700 uppercase mt-1">
                CUSTOMERS USING APP
              </p>
            </div>
            <div className="h-1 w-full bg-[#0060df] rounded-full mt-3.5" />
          </div>

          {/* All Time Completed */}
          <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors">
            <div>
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                1,639
              </p>
              <p className="text-xs sm:text-[13px] font-medium tracking-wide text-slate-700 uppercase mt-1">
                ALL TIME COMPLETED
              </p>
            </div>
            <div className="h-1 w-full bg-slate-900 rounded-full mt-3.5" />
          </div>

          {/* All Time Cancelled */}
          <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors">
            <div>
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                275
              </p>
              <p className="text-xs sm:text-[13px] font-medium tracking-wide text-slate-700 uppercase mt-1">
                ALL TIME CANCELLED
              </p>
            </div>
            <div className="h-1 w-full bg-slate-400 rounded-full mt-3.5" />
          </div>
        </div>
      </div>

      {/* SECTION 2: APP OPERATIONAL METRICS (Bigger Text & High Visibility) */}
      <div className="space-y-2 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-0.5">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Operational Metrics</h2>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-normal text-slate-500">
              Updated at 12:00 AM daily.
            </span>

            {/* 7 days / 30 days segmented toggle */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs shadow-xs">
              <button
                type="button"
                onClick={() => setPeriod("7")}
                className={`rounded-md px-3 py-1.5 text-xs font-normal transition-colors cursor-pointer ${
                  period === "7"
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                7 days
              </button>
              <button
                type="button"
                onClick={() => setPeriod("30")}
                className={`rounded-md px-3 py-1.5 text-xs font-normal transition-colors cursor-pointer ${
                  period === "30"
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                30 days
              </button>
            </div>
          </div>
        </div>

        {/* Metrics 3x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {metricsData.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-xs"
            >
              <div className="space-y-1.5 pr-2">
                <div className="flex items-center gap-1.5" title={m.tooltip}>
                  <p className="text-sm font-medium text-slate-800 leading-snug">
                    {m.title}
                  </p>
                  <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 stroke-[1.75]" />
                </div>

                <p className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                  {m.value}
                </p>

                <p
                  className={`text-xs font-medium ${
                    m.trendType === "positive"
                      ? "text-emerald-700"
                      : m.trendType === "neutral"
                      ? "text-slate-600"
                      : "text-rose-700"
                  }`}
                >
                  {m.trend}
                </p>
              </div>

              {/* Mini Bar Sparkline Chart */}
              <div className="shrink-0 pl-2">
                <MiniBarChart values={m.chartData} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: DYNAMIC DRIVER FLEET TABLE WITH ONLINE / OFFLINE STATUS */}
      <div className="pt-1">
        <Card className="overflow-hidden p-0 border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b border-slate-200 bg-white">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-slate-800">
                  Driver Fleet Availability
                </h3>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {onlineDrivers.length} Online
                </span>
                <span className="text-[11px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {offlineDrivers.length} Offline
                </span>
              </div>
              <p className="text-xs font-normal text-slate-500 mt-0.5">
                Real-time connection status from Towing Driver App &amp; mobile telemetry
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadDashboardData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-normal text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                title="Refresh live drivers"
              >
                <RefreshCw
                  className={`h-3 w-3 stroke-[1.75] ${refreshing ? "animate-spin text-blue-600" : ""}`}
                />
                <span>{refreshing ? "Syncing..." : "Refresh"}</span>
              </button>

              <Link
                href="/drivers"
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Manage all drivers</span>
                <ArrowUpRight className="h-3.5 w-3.5 stroke-[1.75]" />
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">DRIVER NAME</th>
                  <th className="py-3 px-4 font-semibold">PHONE NUMBER</th>
                  <th className="py-3 px-4 font-semibold">ROLE</th>
                  <th className="py-3 px-4 font-semibold text-center">RATING</th>
                  <th className="py-3 px-4 font-semibold text-center">COMPLETED TOWS</th>
                  <th className="py-3 px-4 font-semibold">ONLINE STATUS</th>
                  <th className="py-3 px-4 font-semibold">REGISTERED</th>
                  <th className="py-3 px-4 font-semibold text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loadingDrivers ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-600 stroke-[1.75]" />
                        <span>Loading live driver telemetry...</span>
                      </div>
                    </td>
                  </tr>
                ) : fetchError ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-xs text-rose-600">
                      <p>Error loading drivers: {fetchError}</p>
                      <button
                        type="button"
                        onClick={() => loadDashboardData()}
                        className="mt-2 text-xs text-blue-600 underline cursor-pointer"
                      >
                        Try again
                      </button>
                    </td>
                  </tr>
                ) : drivers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-slate-500">
                      No drivers with role &quot;driver&quot; found.
                    </td>
                  </tr>
                ) : (
                  drivers.map((driver) => {
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
                        {/* Driver Name & Email */}
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
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-3 px-4 font-normal text-slate-800 whitespace-nowrap">
                          {driver.phone || "—"}
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 uppercase">
                            {driver.role}
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1 text-slate-800">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-xs">
                              {Number(driver.rating || 5.0).toFixed(1)}
                            </span>
                          </div>
                        </td>

                        {/* Completed Tows */}
                        <td className="py-3 px-4 text-center whitespace-nowrap text-slate-800 font-medium">
                          {driver.completed_tows || 0}
                        </td>

                        {/* Online / Offline Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {driver.is_online ? (
                            driver.online_status === "on_trip" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 shadow-2xs">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500"></span>
                                </span>
                                Online (On Trip)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 shadow-2xs">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
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

                        {/* Registered Date */}
                        <td className="py-3 px-4 font-normal text-slate-600 whitespace-nowrap text-xs">
                          {driver.created_at ? formatDate(driver.created_at) : "—"}
                        </td>

                        {/* Action */}
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
    </div>
  );
}
