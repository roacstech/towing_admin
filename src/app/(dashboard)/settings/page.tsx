"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Save, RefreshCw, Settings, Shield, Sliders, Globe, Bell } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { useNotification } from "@/context/NotificationContext";
import { APP_CONFIG } from "@/lib/constants";

export default function SettingsPage() {
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Platform dynamic settings
  const [platformName, setPlatformName] = useState("Central Towing Service");
  const [supportEmail, setSupportEmail] = useState("dispatch@centraltowing.com");
  const [commissionRate, setCommissionRate] = useState(20);
  const [currency, setCurrency] = useState("USD");
  const [dispatchRadiusKm, setDispatchRadiusKm] = useState(25);
  const [autoAssignment, setAutoAssignment] = useState(true);
  const [liveTrackingIntervalSec, setLiveTrackingIntervalSec] = useState(5);
  const [maxActiveJobsPerDriver, setMaxActiveJobsPerDriver] = useState(2);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.platformName) setPlatformName(d.platformName);
        if (d.supportEmail) setSupportEmail(d.supportEmail);
        if (d.commissionRate !== undefined) setCommissionRate(d.commissionRate);
        if (d.currency) setCurrency(d.currency);
        if (d.dispatchRadiusKm !== undefined) setDispatchRadiusKm(d.dispatchRadiusKm);
        if (d.autoAssignment !== undefined) setAutoAssignment(d.autoAssignment);
        if (d.liveTrackingIntervalSec !== undefined) setLiveTrackingIntervalSec(d.liveTrackingIntervalSec);
        if (d.maxActiveJobsPerDriver !== undefined) setMaxActiveJobsPerDriver(d.maxActiveJobsPerDriver);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        platformName,
        supportEmail,
        commissionRate: Number(commissionRate),
        currency,
        dispatchRadiusKm: Number(dispatchRadiusKm),
        autoAssignment,
        liveTrackingIntervalSec: Number(liveTrackingIntervalSec),
        maxActiveJobsPerDriver: Number(maxActiveJobsPerDriver),
      };

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Platform configuration saved successfully!", "success");
      } else {
        showToast("Error updating settings", "error");
      }
    } catch (err) {
      showToast("Network error saving settings", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium tracking-tight text-slate-800">
              Admin Portal Settings
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettings}
            disabled={loading}
            className="gap-1 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Reset</span>
          </Button>

          <Button
            onClick={handleSave}
            variant="primary"
            size="sm"
            disabled={saving}
            className="gap-1 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5 stroke-[1.75]" />
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* General Dispatch Configuration */}
        <Card className="space-y-3">
          <CardHeader>
            <CardTitle>Dispatch &amp; Operations Rules</CardTitle>
          </CardHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Platform Title / Brand"
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
            />
            <Input
              label="Operations Support Email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Platform Commission (%)"
              type="number"
              step="1"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
            />
            <Input
              label="Max Dispatch Radius (km)"
              type="number"
              step="1"
              value={dispatchRadiusKm}
              onChange={(e) => setDispatchRadiusKm(Number(e.target.value))}
            />
            <Input
              label="Max Active Jobs / Driver"
              type="number"
              step="1"
              value={maxActiveJobsPerDriver}
              onChange={(e) => setMaxActiveJobsPerDriver(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 mt-1">
            <div>
              <p className="text-xs font-medium text-slate-800">Auto-Dispatch Assignment</p>
              <p className="text-[11px] font-normal text-slate-500">
                Automatically ring closest online tow driver via geospatial proximity algorithm
              </p>
            </div>
            <ToggleSwitch
              checked={autoAssignment}
              onChange={setAutoAssignment}
              ariaLabel="Toggle auto dispatch"
            />
          </div>
        </Card>

        {/* Telemetry & API Endpoints */}
        <Card className="space-y-3">
          <CardHeader>
            <CardTitle>GPS Telemetry &amp; Connected Backend</CardTitle>
          </CardHeader>

          <div>
            <Input
              label="Live GPS Polling Interval (Seconds)"
              type="number"
              value={liveTrackingIntervalSec}
              onChange={(e) => setLiveTrackingIntervalSec(Number(e.target.value))}
            />
            <p className="text-[11px] font-normal text-slate-400 mt-1">
              Rate at which Towing Driver App emits live coordinates to backend dispatch queue
            </p>
          </div>

          <div>
            <Input
              label="REST API Base URL"
              defaultValue={APP_CONFIG.apiBaseUrl}
              readOnly
              className="bg-slate-50 font-mono text-xs text-slate-600"
            />
            <p className="text-[11px] font-normal text-slate-400 mt-1">
              Configured in environment via API_BASE_URL (Hosted Dart Backend)
            </p>
          </div>
        </Card>
      </form>
    </div>
  );
}
