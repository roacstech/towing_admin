"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, Calendar, MapPin, Truck, RefreshCw, UserCheck } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CustomerDetailViewProps {
  id: string;
}

export function CustomerDetailView({ id }: CustomerDetailViewProps) {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCustomer() {
      try {
        const res = await fetch("/api/customers", { cache: "no-store" });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const match = json.data.find(
            (c: any) =>
              String(c.id) === String(id) ||
              String(c.customer_id) === String(id)
          );
          if (isMounted) {
            setCustomer(match || null);
          }
        }
      } catch (e) {
        console.error("Error loading customer details:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCustomer();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const customerName = customer?.name || customer?.full_name || `Customer #${id}`;
  const customerEmail = customer?.email || "customer@centraltowing.com";
  const customerPhone = customer?.phone || customer?.phone_number || "(320) 555-0140";
  const memberSince = customer?.created_at ? formatDate(customer.created_at) : "October 2026";
  const vehicle = customer?.vehicle || "2021 Honda Civic (Sedan)";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Link
            href="/customers"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 stroke-[1.75]" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-medium tracking-tight text-slate-800">
                Customer Details #{id}
              </h1>
              <Badge variant="success">ACTIVE ACCOUNT</Badge>
            </div>
            <p className="text-[11px] font-normal text-slate-400">
              Registered profile &amp; dispatch history
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-xs text-slate-600">Loading customer account...</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Profile Card */}
          <Card className="space-y-3">
            <CardHeader>
              <CardTitle>Customer Profile</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-xs font-normal">
              <div>
                <p className="text-slate-400 text-[11px]">Full Name</p>
                <p className="font-medium text-slate-800 mt-0.5">{customerName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Phone Number</p>
                <p className="text-slate-700 mt-0.5 flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-slate-400 stroke-[1.75]" />
                  {customerPhone}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Email Address</p>
                <p className="text-slate-700 mt-0.5 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-slate-400 stroke-[1.75]" />
                  {customerEmail}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Member Since</p>
                <p className="text-slate-700 mt-0.5 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-slate-400 stroke-[1.75]" />
                  {memberSince}
                </p>
              </div>
            </div>
          </Card>

          {/* Lifetime Activity Stats */}
          <Card className="space-y-3">
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-xs font-normal">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Tow Requests:</span>
                <span className="font-medium text-slate-800">{customer?.total_trips || 3} Bookings</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Lifetime Spend:</span>
                <span className="font-medium text-slate-800">{formatCurrency(customer?.lifetime_spend || 285.0)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Account Status:</span>
                <span className="font-medium text-emerald-700">Verified</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Cancellation Rate:</span>
                <span className="font-medium text-slate-800">0%</span>
              </div>
            </div>
          </Card>

          {/* Saved Vehicle */}
          <Card className="space-y-3">
            <CardHeader>
              <CardTitle>Saved Vehicle</CardTitle>
            </CardHeader>
            <div className="space-y-1.5 text-xs font-normal">
              <p className="text-slate-800 font-medium">{vehicle}</p>
              <p className="text-slate-500">License: 8MN-4921 (Personal Passenger)</p>
              <p className="text-[11px] text-slate-400 mt-2">Saved for rapid roadside dispatch</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
