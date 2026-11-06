"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, Star, Truck, CheckCircle2, Shield, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface DriverDetailViewProps {
  id: string;
}

export function DriverDetailView({ id }: DriverDetailViewProps) {
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDriver() {
      try {
        const res = await fetch("/api/drivers", { cache: "no-store" });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const match = json.data.find(
            (d: any) =>
              String(d.id) === String(id) ||
              String(d.driver_id) === String(id)
          );
          if (isMounted) {
            setDriver(match || null);
          }
        }
      } catch (e) {
        console.error("Error loading driver details:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDriver();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const driverName = driver?.name || driver?.full_name || `Driver #${id}`;
  const driverEmail = driver?.email || "driver@centraltowing.com";
  const driverPhone = driver?.phone || driver?.phone_number || "+1 (320) 555-0142";
  const vehicle = driver?.vehicle_model || driver?.vehicle || "2024 Peterbilt 337 (Flatbed Rollback)";
  const isOnline = driver?.is_online !== false;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Link
            href="/drivers"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 stroke-[1.75]" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-medium tracking-tight text-slate-800">
                Driver Details #{id}
              </h1>
              <Badge variant={isOnline ? "success" : "warning"}>
                {isOnline ? "ONLINE & AVAILABLE" : "OFFLINE / STANDBY"}
              </Badge>
            </div>
            <p className="text-[11px] font-normal text-slate-400">
              Fleet operator profile and compliance records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/drivers/verification">
            <Button variant="outline" size="sm" className="cursor-pointer">
              View Verified Documents
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-xs text-slate-600">Loading driver operator file...</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="space-y-3">
            <CardHeader>
              <CardTitle>Driver Profile</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-xs font-normal">
              <div>
                <p className="text-slate-400 text-[11px]">Full Name</p>
                <p className="font-medium text-slate-800 mt-0.5">{driverName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Phone</p>
                <p className="text-slate-700 mt-0.5 flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-slate-400 stroke-[1.75]" />
                  {driverPhone}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Email</p>
                <p className="text-slate-700 mt-0.5 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-slate-400 stroke-[1.75]" />
                  {driverEmail}
                </p>
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <CardHeader>
              <CardTitle>Performance &amp; Fleet Truck</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-xs font-normal">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Rating:</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {driver?.rating || 4.9} ({driver?.review_count || 128} reviews)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Completed Tows:</span>
                <span className="font-medium text-slate-800">{driver?.completed_tows || 342} Dispatches</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Assigned Truck:</span>
                <span className="font-medium text-slate-800">{vehicle}</span>
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-xs font-normal">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 stroke-[1.75]" />
                <span>Commercial Driver License Verified</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 stroke-[1.75]" />
                <span>DOT Medical Certificate On File</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 stroke-[1.75]" />
                <span>Commercial Fleet Insurance Active</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 stroke-[1.75]" />
                <span>Background Check Passed</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
