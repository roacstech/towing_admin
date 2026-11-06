"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Truck, Plus, RefreshCw, Shield, Wrench, Calendar, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface VehicleItem {
  id: string;
  unitNumber: string;
  model: string;
  plate: string;
  type: string;
  capacity: string;
  assignedDriver: string;
  driverId: number;
  status: "active" | "standby" | "maintenance";
  equipment: string;
  lastInspection: string;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vehicles", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setVehicles(json.data);
      }
    } catch (err) {
      console.error("Failed to load vehicles:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium tracking-tight text-slate-800">
              Fleet Tow Trucks &amp; Equipment
            </h1>
            <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Dynamic Fleet
            </span>
          </div>
          <p className="text-xs font-normal text-slate-500 mt-0.5">
            Manage your service vehicles, bed types, towing capacities, and assigned drivers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVehicles}
            disabled={loading}
            className="gap-1 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button variant="primary" size="sm" className="gap-1 cursor-pointer">
            <Plus className="h-3.5 w-3.5 stroke-[1.75]" />
            <span>Add Vehicle</span>
          </Button>
        </div>
      </div>

      {/* Grid of Vehicles */}
      {loading && vehicles.length === 0 ? (
        <Card className="p-8 text-center">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-xs text-slate-600">Loading live fleet vehicles...</p>
        </Card>
      ) : vehicles.length === 0 ? (
        <Card className="p-8 text-center text-xs text-slate-500">
          No fleet vehicles registered.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {vehicles.map((truck) => (
            <Card key={truck.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                    <Truck className="h-4 w-4 stroke-[1.75]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                      {truck.unitNumber}
                    </span>
                    <h3 className="font-medium text-slate-900 text-xs">
                      {truck.model}
                    </h3>
                  </div>
                </div>

                <Badge variant={truck.status === "active" ? "success" : "warning"}>
                  {truck.status === "active" ? "READY" : "STANDBY"}
                </Badge>
              </div>

              <div className="border-t border-slate-100 pt-2.5 text-xs font-normal space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">License Plate:</span>
                  <span className="font-mono text-slate-800">{truck.plate}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Bed / Rig Type:</span>
                  <span className="text-slate-800">{truck.type}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Tow Capacity:</span>
                  <span className="text-slate-800 font-medium">{truck.capacity}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">Assigned Driver:</span>
                  <span className="text-blue-600 font-medium">{truck.assignedDriver}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Inspection: {truck.lastInspection}</span>
                <span className="text-emerald-700 font-normal">Passed</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
