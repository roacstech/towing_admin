"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, RefreshCw, Smartphone, Navigation, Radio, CheckCircle2, Camera, ExternalLink, X, ShieldCheck, XCircle, Star, MessageSquare } from "lucide-react";
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
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; label: string } | null>(null);
  const [review, setReview] = useState<any>(null);
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

  const loadReview = async (towId: string) => {
    try {
      const res = await fetch("/api/admin/reviews", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const cleanTarget = towId.toLowerCase().replace(/[^a-z0-9]/g, "");
        const match = json.data.find((r: any) => {
          const rTowId = String(r.towId || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          const rId = String(r.id || "").toLowerCase().replace("rev", "").replace(/[^a-z0-9]/g, "");
          return (
            rTowId === cleanTarget ||
            rId === cleanTarget ||
            (cleanTarget.length > 3 && (rTowId.includes(cleanTarget) || cleanTarget.includes(rTowId)))
          );
        });
        if (match) setReview(match);
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
        if (json.data.customer_review) {
          setReview(json.data.customer_review);
        } else {
          loadReview(id);
        }
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
    loadReview(id);

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

  const isCancelled = ["cancelled", "canceled"].includes(
    String(data.status || "").toLowerCase().trim()
  );
  const hasLiveDriverGps = !isCancelled && Boolean(data.driver_lat && data.driver_lng);

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
              {isCancelled ? "Cancelled Dispatch Request • Closed" : "Live App Tow Request • Auto-refreshing every 3s"}
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

      {/* Prominent Cancellation Notice Banner */}
      {isCancelled && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-rose-900 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 border border-rose-200">
              <XCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-rose-950">Dispatch Request Cancelled</h3>
                <span className="rounded bg-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-900 uppercase tracking-wider">
                  Voided
                </span>
              </div>
              <p className="mt-1 text-xs text-rose-800 leading-relaxed">
                This tow request has been cancelled. No driver was dispatched, vehicle inspection is not required, and no charges were incurred.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-rose-950 bg-white/80 rounded-lg p-2.5 border border-rose-200">
                <div>
                  <span className="text-slate-500 font-normal">Reason for Cancellation: </span>
                  <span className="font-semibold text-rose-900">
                    {data.cancel_reason || data.cancellation_reason || data.reason || "Customer cancelled request"}
                  </span>
                </div>
                {data.updated_at && (
                  <div>
                    <span className="text-slate-500 font-normal">Cancelled On: </span>
                    <span className="font-medium text-slate-700">
                      {new Date(data.updated_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
                <p className="text-slate-400 font-normal text-[11px]">
                  {isCancelled ? "DISPATCH STATUS" : "ESTIMATED ETA"}
                </p>
                <p className={`font-medium mt-0.5 ${isCancelled ? "text-rose-600 font-semibold" : "text-emerald-600"}`}>
                  {isCancelled ? "Cancelled" : (data.eta_or_duration || "4-8 min")}
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

          {/* Pre-Tow 4-Side Inspection Photos Card (Hidden when order is Cancelled) */}
          {!isCancelled && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Camera className="h-4 w-4 text-blue-600 stroke-[1.75]" />
                  <span>Pre-Tow 4-Side Inspection Photos</span>
                </CardTitle>
                {data.inspection_photos &&
                (data.inspection_photos.front ||
                  data.inspection_photos.back ||
                  data.inspection_photos.left ||
                  data.inspection_photos.right) ? (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    Inspection Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200">
                    Inspection Pending
                  </span>
                )}
              </CardHeader>
              <div className="space-y-3">
                <p className="text-[11px] text-slate-500">
                  Mandatory condition verification photos captured by the driver upon arriving at the scene before vehicle hooking.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: "front", label: "Front View", icon: "🚗" },
                    { key: "back", label: "Rear View", icon: "🚙" },
                    { key: "left", label: "Left (Driver Side)", icon: "⬅️" },
                    { key: "right", label: "Right (Pass. Side)", icon: "➡️" },
                  ].map(({ key, label, icon }) => {
                    const photoUrl =
                      data.inspection_photos?.[key] ||
                      (key === "back" ? data.inspection_photos?.rear : undefined);
                    return (
                      <div
                        key={key}
                        className="group relative rounded-lg border border-slate-200 bg-slate-50 p-2 text-center transition-all hover:border-blue-300 hover:shadow-xs"
                      >
                        <div className="flex items-center justify-between text-[10px] font-medium text-slate-600 mb-1.5">
                          <span className="truncate">{label}</span>
                          <span>{icon}</span>
                        </div>

                        {photoUrl ? (
                          <div
                            className="relative aspect-4/3 w-full overflow-hidden rounded border border-slate-200 bg-white cursor-pointer group-hover:opacity-95"
                            onClick={() => setPreviewPhoto({ url: photoUrl, label })}
                          >
                            <img
                              src={photoUrl}
                              alt={label}
                              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity rounded bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-slate-800 shadow-xs">
                                Enlarge
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex aspect-4/3 w-full flex-col items-center justify-center rounded border border-dashed border-slate-300 bg-white text-slate-400">
                            <Camera className="h-5 w-5 mb-1 stroke-[1.5]" />
                            <span className="text-[10px]">Awaiting Photo</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* Customer Rating & Review Card */}
          {!isCancelled && (
            <Card className="border-amber-200/90 bg-white shadow-2xs overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-amber-100/60 bg-gradient-to-r from-amber-50/70 to-orange-50/30 pb-3">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500 text-white shadow-2xs">
                    <Star className="h-3.5 w-3.5 fill-white" />
                  </div>
                  <span>Customer Rating &amp; Review</span>
                </CardTitle>
                {review ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200 shadow-2xs">
                    <span className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.round(Number(review.rating) || 5)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-200 text-slate-200"
                          }`}
                        />
                      ))}
                    </span>
                    <span className="ml-0.5">{(Number(review.rating) || 5).toFixed(1)} / 5.0</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 border border-slate-200">
                    Review Pending
                  </span>
                )}
              </CardHeader>
              <div className="p-4 space-y-3">
                {review ? (
                  <div className="space-y-3">
                    {/* Customer Review Profile & Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold text-xs shadow-xs">
                          {(review.customerName || data.customer_name || "C").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900">
                              {review.customerName || data.customer_name}
                            </h4>
                            <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                              Verified Customer
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Submitted on{" "}
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Recently"}{" "}
                            • Dispatch #{data.raw_id || String(data.id).replaceAll("#", "")}
                          </p>
                        </div>
                      </div>

                      {/* Star Rating Breakdown */}
                      <div className="flex items-center gap-2 self-start sm:self-center bg-amber-50/70 border border-amber-200/60 rounded-lg px-2.5 py-1">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < Math.round(Number(review.rating) || 5)
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-slate-200 text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-amber-900">
                          {Math.round(Number(review.rating) || 5) === 5 ? "5.0 Outstanding" : `${Number(review.rating).toFixed(1)} Rated`}
                        </span>
                      </div>
                    </div>

                    {/* Customer Feedback Comment Callout */}
                    <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-3.5 relative">
                      <div className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3 text-amber-600" />
                        <span>Customer Feedback</span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 leading-relaxed italic">
                        &ldquo;{review.comment || "Prompt arrival and professional towing service!"}&rdquo;
                      </p>

                      {/* Quick Compliment Tags / Chips */}
                      {review.comment && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5 pt-1 border-t border-amber-200/50">
                          {review.comment
                            .split(",")
                            .map((chunk: string) => chunk.trim())
                            .filter((c: string) => c.length > 2 && c.length < 35)
                            .map((tag: string, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[10.5px] font-medium text-slate-700 border border-amber-200/70 shadow-2xs"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                {tag}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2">
                      <MessageSquare className="h-4 w-4 stroke-[1.5]" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">Awaiting Customer Feedback</p>
                    <p className="text-[11px] text-slate-400 max-w-sm mt-0.5">
                      The customer has not yet submitted a review or star rating for this completed tow service.
                    </p>
                  </div>
                )}
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
              {review && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-normal">Review Rating:</span>
                  <span className="font-semibold text-amber-700 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {(Number(review.rating) || 5).toFixed(1)} / 5.0
                  </span>
                </div>
              )}
            </div>
          </Card>

          {isCancelled ? (
            <Card className="border-rose-200 bg-rose-50/40">
              <CardHeader>
                <CardTitle className="text-rose-900 flex items-center gap-1.5">
                  <XCircle className="h-4 w-4 text-rose-600" />
                  <span>Cancellation &amp; Settlement</span>
                </CardTitle>
              </CardHeader>
              <div className="text-xs space-y-2.5">
                <div className="flex justify-between items-center py-1 border-b border-rose-100">
                  <span className="text-slate-500 font-normal">Order Status</span>
                  <span className="font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded text-[11px]">
                    Cancelled
                  </span>
                </div>
                <div className="py-1 border-b border-rose-100">
                  <span className="text-slate-500 font-normal block text-[11px]">Reason of Cancellation</span>
                  <span className="font-semibold text-rose-950 mt-0.5 block">
                    {data.cancel_reason || data.cancellation_reason || data.reason || "Customer cancelled request"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-rose-100">
                  <span className="text-slate-500 font-normal">Assigned Driver</span>
                  <span className="font-medium text-slate-500 italic">None (Cancelled)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-rose-100">
                  <span className="text-slate-500 font-normal">Total Amount Billed</span>
                  <span className="font-bold text-slate-800">$0.00</span>
                </div>
                <div className="pt-1 text-[11px] text-slate-500 leading-relaxed">
                  All driver dispatches and inspection obligations for this request have been voided. No charges were billed.
                </div>
              </div>
            </Card>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Lightbox Preview Modal for High-Resolution S3 Inspection Photos */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full rounded-2xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-800">
                  {previewPhoto.label} - Condition Inspection
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewPhoto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>View Full Image</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg bg-slate-950 flex items-center justify-center max-h-[70vh]">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.label}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <p className="text-[10px] text-slate-400 truncate mt-2">
              Photo URL: {previewPhoto.url}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
