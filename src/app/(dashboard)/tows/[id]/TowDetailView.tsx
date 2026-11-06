"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, RefreshCw, Smartphone, Navigation, Radio, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TowStatusBadge } from "@/components/tows/TowStatusBadge";

interface TowDetailViewProps {
  id: string;
}

export function TowDetailView({ id }: TowDetailViewProps) {
  const [tow, setTow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const isInitialMount = useRef(true);

  const loadDrivers = async () => {
    try {
      const res = await fetch("/api/drivers", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDrivers(json.data);
      }
    } catch (_) {}
  };

  const loadDetail = async (isManual = false) => {
    if (isInitialMount.current) setLoading(true);
    try {
      const res = await fetch(`/api/tows/${encodeURIComponent(id)}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setTow(json.data);
      }
    } catch (_) {
    } finally {
      setLoading(false);
      isInitialMount.current = false;
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriverId) return;
    const targetDriver = drivers.find((d) => String(d.id) === selectedDriverId);
    if (!targetDriver) return;

    setAssigning(true);
    setAssignSuccess(false);

    const payload = {
      status: "accepted",
      driver_name: targetDriver.name,
      driver_id: `DRV-${targetDriver.id}`,
      driver_phone: targetDriver.phone || "+91 97864 53126",
      tow_truck_info: `${targetDriver.truck_model || "Flatbed Tow Truck"} (${targetDriver.license_plate || "TN 59 CT 2484"})`,
      eta_or_duration: "5-10 min",
    };

    try {
      const res = await fetch(`/api/tows/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setTow((prev: any) => ({
          ...prev,
          ...payload,
        }));
        setAssignSuccess(true);
        setTimeout(() => setAssignSuccess(false), 4000);
      }
    } catch (_) {
    } finally {
      setAssigning(false);
    }
  };

  useEffect(() => {
    loadDetail();
    loadDrivers();

    // Auto poll live detail every 3s to reflect moving driver telemetry
    const interval = setInterval(() => {
      loadDetail(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-xs text-slate-500">
        <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
        <span>Loading live dispatch details...</span>
      </div>
    );
  }

  const data = tow || {
    id,
    customer_name: "Madhavan M.047",
    customer_phone: "+91 97864 53128",
    service_title: "Light-Duty Towing",
    vehicle_name: "Tesla Model 3",
    license_plate: "TN 59 CT 2484",
    pickup_address: "Onnipalayam Pudur, Coimbatore North",
    drop_address: "Kurumbapalayam - Karichipalayam Road, Coimbatore",
    driver_name: "madhavan",
    driver_phone: "97864531128",
    tow_truck_info: "2012, ford (Wheel-Lift)",
    status: "accepted",
    total_cost: "$92.45",
    payment_method: "In-App Tow Pay",
    eta_or_duration: "4-8 min",
  };

  const hasLiveDriverGps = data.driver_lat && data.driver_lng;

  // Derive pricing breakdown for admin inspection
  const totalCostNum = parseFloat(String(data.total_cost || "92.45").replace(/[^0-9.]/g, "")) || 92.45;
  const srvTitleLower = String(data.service_title || "Light-Duty Towing").toLowerCase();

  let adminBaseFee = 65.0;
  let perMileRate = 4.5;
  if (srvTitleLower.includes("heavy")) {
    adminBaseFee = 160.0;
    perMileRate = 9.5;
  } else if (srvTitleLower.includes("accident")) {
    adminBaseFee = 120.0;
    perMileRate = 4.5;
  } else if (srvTitleLower.includes("ev") || srvTitleLower.includes("electric")) {
    adminBaseFee = 95.0;
    perMileRate = 4.5;
  } else if (srvTitleLower.includes("medium")) {
    adminBaseFee = 85.0;
    perMileRate = 6.5;
  } else if (srvTitleLower.includes("flatbed")) {
    adminBaseFee = 80.0;
    perMileRate = 4.5;
  } else if (srvTitleLower.includes("winch")) {
    adminBaseFee = 75.0;
    perMileRate = 4.5;
  } else if (srvTitleLower.includes("motorcycle")) {
    adminBaseFee = 70.0;
    perMileRate = 4.0;
  } else if (srvTitleLower.includes("lock")) {
    adminBaseFee = 50.0;
    perMileRate = 4.5;
  } else if (srvTitleLower.includes("tire") || srvTitleLower.includes("roadside")) {
    adminBaseFee = 45.0;
    perMileRate = 4.5;
  } else if (srvTitleLower.includes("jump") || srvTitleLower.includes("battery")) {
    adminBaseFee = 40.0;
    perMileRate = 4.5;
  } else if (srvTitleLower.includes("fuel")) {
    adminBaseFee = 35.0;
    perMileRate = 4.5;
  }

  const perKmRate = perMileRate / 1.60934;
  const distanceCost = totalCostNum > adminBaseFee ? totalCostNum - adminBaseFee : 0;
  const billableMiles = perMileRate > 0 ? distanceCost / perMileRate : 0;
  const billableKm = billableMiles * 1.60934;

  return (
    <div className="space-y-4">
      {/* Back button & Action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Link
            href="/tows"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 stroke-[1.75]" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-medium tracking-tight text-slate-800">
                Dispatch Request #{data.raw_id || String(data.id).replaceAll("#", "")}
              </h1>
              <TowStatusBadge status={data.status} />
              {hasLiveDriverGps && (
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live GPS
                </span>
              )}
            </div>
            <p className="text-[11px] font-normal text-slate-400 mt-0.5">
              Live App Tow Request • Auto-refreshing every 3s
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/map"
            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-normal text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-2xs"
          >
            <Navigation className="h-3.5 w-3.5 stroke-[1.75]" />
            <span>Track on Fleet Map</span>
          </Link>
        </div>
      </div>

      {/* Grid of Details */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Route & Vehicle Info (2 Cols) */}
        <div className="space-y-4 lg:col-span-2">
          {/* Pickup and Dropoff Route */}
          <Card>
            <CardHeader>
              <CardTitle>Route &amp; Locations</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 stroke-[1.75]" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase">
                    Pickup Location
                  </p>
                  <p className="text-xs font-medium text-slate-800 mt-0.5">
                    {data.pickup_address}
                  </p>
                  {data.pickup_lat && data.pickup_lng && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Coordinates: {Number(data.pickup_lat).toFixed(4)}, {Number(data.pickup_lng).toFixed(4)}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-l-2 border-dashed border-slate-200 ml-3.5 h-4" />

              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 stroke-[1.75]" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase">
                    Dropoff Destination
                  </p>
                  <p className="text-xs font-medium text-slate-800 mt-0.5">
                    {data.drop_address}
                  </p>
                  {data.drop_lat && data.drop_lng && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Coordinates: {Number(data.drop_lat).toFixed(4)}, {Number(data.drop_lng).toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Vehicle Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Vehicle</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-slate-400 font-normal text-[11px]">VEHICLE</p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {data.vehicle_name || "Tesla Model 3"}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-normal text-[11px]">LICENSE PLATE</p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {data.license_plate || "TN 59 CT 2484"}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-normal text-[11px]">SERVICE TYPE</p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {data.service_title || "Light-Duty Towing"}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-normal text-[11px]">ESTIMATED ETA</p>
                <p className="font-medium text-emerald-600 mt-0.5">
                  {data.eta_or_duration || "4-8 min"}
                </p>
              </div>
            </div>
          </Card>

          {/* Live Telemetry Card if driver coordinates are available */}
          {hasLiveDriverGps && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
                  <Radio className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                  Live Driver Telemetry
                </CardTitle>
              </CardHeader>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-slate-400 font-normal text-[11px]">DRIVER LATITUDE</p>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {Number(data.driver_lat).toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-normal text-[11px]">DRIVER LONGITUDE</p>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {Number(data.driver_lng).toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-normal text-[11px]">HEADING</p>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {data.driver_heading ? `${data.driver_heading}°` : "45°"}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar: Customer, Driver, Fare */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <div className="text-xs space-y-2">
              <p className="font-medium text-slate-900">{data.customer_name || "Madhavan M.047"}</p>
              <p className="text-slate-500 font-normal flex items-center gap-1.5">
                <Phone className="h-3 w-3 stroke-[1.75]" />
                {data.customer_phone || "+91 97864 53128"}
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Assigned Driver</span>
                {(!data.driver_name || data.driver_name.toLowerCase() === "unassigned") && (
                  <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Needs Assignment
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <div className="text-xs space-y-3">
              {assignSuccess && (
                <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Driver successfully assigned and dispatched!</span>
                </div>
              )}

              {data.driver_name && data.driver_name.toLowerCase() !== "unassigned" ? (
                <div className="space-y-1.5">
                  <p className="font-semibold text-slate-900 text-sm">{data.driver_name}</p>
                  <p className="text-slate-500 font-normal">{data.tow_truck_info || "Tow Truck Verified"}</p>
                  {data.driver_phone && (
                    <p className="text-slate-500 font-normal flex items-center gap-1.5 pt-0.5">
                      <Phone className="h-3 w-3 stroke-[1.75]" />
                      {data.driver_phone}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 space-y-2">
                  <p className="text-amber-800 font-medium text-[11px] leading-snug">
                    All nearby drivers timed out or passed. Manual admin assignment required:
                  </p>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full rounded border border-amber-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">-- Choose Registered Driver --</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.online_status || "offline"}) - {d.truck_model || "Tow Truck"}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAssignDriver}
                    disabled={!selectedDriverId || assigning}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-1.5 px-3 transition-colors cursor-pointer text-xs"
                  >
                    {assigning ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <span>Assign &amp; Dispatch Driver</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fare &amp; Payment Details</CardTitle>
            </CardHeader>
            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-normal">Service Base (Fixed)</span>
                <span className="font-medium text-slate-900">${adminBaseFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-normal">Distance Rate</span>
                <span className="font-normal text-slate-700">
                  ${perMileRate.toFixed(2)}/mi (${perKmRate.toFixed(2)}/km)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-normal">
                  Distance Fare ({billableMiles.toFixed(1)} mi / {billableKm.toFixed(1)} km)
                </span>
                <span className="font-medium text-slate-900">${distanceCost.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-100 my-1 pt-1.5 flex justify-between">
                <span className="text-slate-700 font-semibold">Total Fare</span>
                <span className="font-bold text-slate-900 text-sm">{data.total_cost || "$92.45"}</span>
              </div>
              <div className="flex justify-between text-[11px] pt-0.5">
                <span className="text-slate-400 font-normal">Payment Method</span>
                <span className="font-medium text-emerald-600">{data.payment_method || "In-App Tow Pay"}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
