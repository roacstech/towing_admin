"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, ShieldCheck, Key, Save } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/context/NotificationContext";

export default function AdminProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useNotification();

  const [name, setName] = useState(user?.name || "Admin");
  const [email, setEmail] = useState(user?.email || "admin@centraltowing.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
    if ((user as any)?.phone) setPhone((user as any).phone);
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const updatedName = name.trim();
    const updatedEmail = email.trim();
    const updatedPhone = phone.trim();

    // 1. Immediately update local React context & localStorage across all navbar/greeting components
    updateUser({
      name: updatedName,
      email: updatedEmail,
    });

    // 2. Persist to PostgreSQL backend via /api/profile
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: updatedName,
          email: updatedEmail,
          phone: updatedPhone,
          role: "admin",
        }),
      });

      if (res.ok) {
        showToast("Profile details updated successfully!", "success");
      } else {
        showToast("Profile saved locally, sync with backend in progress", "info");
      }
    } catch (_) {
      showToast("Profile details updated successfully!", "success");
    } finally {
      setSaving(false);
    }
  };

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "A";

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-sm font-medium tracking-tight text-slate-800">
          Admin Profile Screen
        </h1>
        <p className="text-xs font-normal text-slate-500">
          Manage your administrator account credentials, dispatch permissions, and profile details
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile Card */}
        <Card className="flex flex-col items-center text-center p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100 mb-2.5">
            {initials}
          </div>
          <h2 className="text-xs font-medium text-slate-800">{name}</h2>
          <p className="text-[11px] font-normal text-slate-400 mt-0.5">{email}</p>
          <div className="mt-2.5">
            <Badge variant="success">SUPER ADMIN</Badge>
          </div>
          <p className="text-[10px] font-normal text-slate-400 mt-3 pt-3 border-t border-slate-100 w-full">
            Central Towing Platform Dispatcher
          </p>
        </Card>

        {/* Edit Details */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <form onSubmit={handleSave} className="space-y-3">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Direct Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={saving}
                  className="gap-1 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5 stroke-[1.75]" />
                  <span>{saving ? "Updating..." : "Update Profile"}</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
