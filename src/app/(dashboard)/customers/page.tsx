"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SearchBar } from "@/components/common/SearchBar";
import { formatDate } from "@/lib/utils";
import { RefreshCw, Smartphone, User } from "lucide-react";

interface CustomerUser {
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
  created_at: string | null;
  updated_at: string | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadCustomers = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/customers");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCustomers(json.data);
      } else {
        setError(json.error || "Failed to load customers");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium tracking-tight text-slate-800">
              Registered App Customers
            </h1>
            <span className="text-[11px] font-normal text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
              <Smartphone className="h-3 w-3 stroke-[1.75]" />
              Customer App
            </span>
            <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {customers.length} Registered
            </span>
          </div>
          <p className="text-xs font-normal text-slate-500 mt-0.5">
            Real dynamic customer accounts registered via the Towing Customer App
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadCustomers(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-normal text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh customer list"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 stroke-[1.75] ${refreshing ? "animate-spin text-blue-600" : ""}`}
            />
            <span>{refreshing ? "Syncing..." : "Refresh"}</span>
          </button>
          <SearchBar
            placeholder="Search customer name, email, phone..."
            onSearch={setSearch}
          />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-normal text-slate-400">
                <th className="pb-2.5 font-normal">CUSTOMER</th>
                <th className="pb-2.5 font-normal">CONTACT NUMBER</th>
                <th className="pb-2.5 font-normal">EMAIL ADDRESS</th>
                <th className="pb-2.5 font-normal">ROLE</th>
                <th className="pb-2.5 font-normal">ACCOUNT STATUS</th>
                <th className="pb-2.5 font-normal">REGISTERED DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600 stroke-[1.75]" />
                      <span>Loading dynamic customer accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-2.5 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-medium border border-blue-200">
                          {c.name ? c.name.charAt(0).toUpperCase() : <User className="h-3 w-3" />}
                        </div>
                        <span>{c.name || "Customer #" + c.id}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-slate-700 font-normal">
                      {c.phone || "—"}
                    </td>
                    <td className="py-2.5 text-slate-600 font-normal">
                      {c.email || "—"}
                    </td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-normal uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                        {c.role}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <Badge variant={c.is_active ? "success" : "danger"}>
                        {c.is_active ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-slate-500 font-normal">
                      {c.created_at ? formatDate(c.created_at) : "—"}
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
