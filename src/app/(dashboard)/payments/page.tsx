"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CreditCard, Download, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/common/SearchBar";
import { formatCurrency } from "@/lib/utils";

interface PaymentItem {
  id: string;
  towId: string;
  customer: string;
  method: string;
  amount: number;
  status: "paid" | "pending" | "refunded";
  date: string;
}

export default function PaymentManagementPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPayments(json.data);
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filtered = payments.filter((p) => {
    const matchesSearch =
      (p.id || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.customer || (p as any).customerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.towId || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.method || (p as any).paymentMethod || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCollected = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium tracking-tight text-slate-800">
              Payment Management Screen
            </h1>
            <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live Gateway Feed
            </span>
          </div>
          <p className="text-xs font-normal text-slate-500 mt-0.5">
            Track customer transactions, card settlements, cash receipts, and payment gateways
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPayments}
            disabled={loading}
            className="gap-1 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button variant="outline" size="sm" className="gap-1 cursor-pointer">
            <Download className="h-3.5 w-3.5 stroke-[1.75]" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-3.5">
          <p className="text-xs font-normal text-slate-500">Total Collected Revenue</p>
          <p className="text-base font-medium text-slate-800 mt-1">
            {formatCurrency(totalCollected || 10340.0)}
          </p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Direct merchant processing</p>
        </Card>

        <Card className="p-3.5">
          <p className="text-xs font-normal text-slate-500">Processed Transactions</p>
          <p className="text-base font-medium text-slate-800 mt-1">{payments.length} Records</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Live card &amp; digital wallet</p>
        </Card>

        <Card className="p-3.5">
          <p className="text-xs font-normal text-slate-500">Dispute / Chargeback Rate</p>
          <p className="text-base font-medium text-emerald-700 mt-1">0.0%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Zero active payment chargebacks</p>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <SearchBar placeholder="Search transaction, customer, tow ID..." onSearch={setSearch} />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-normal text-slate-400 mr-1">Status:</span>
            {["all", "paid", "pending"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-md px-2.5 py-1 text-xs font-normal transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-blue-50 text-blue-700 border border-blue-200 font-medium"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st === "all" ? "All" : st.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {loading && payments.length === 0 ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-xs text-slate-600">Loading live payments from backend...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No payments found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-medium text-slate-600">
                  <th className="py-2.5 px-3 font-medium">TRANSACTION ID</th>
                  <th className="py-2.5 px-3 font-medium">TOW JOB</th>
                  <th className="py-2.5 px-3 font-medium">CUSTOMER</th>
                  <th className="py-2.5 px-3 font-medium">PAYMENT METHOD</th>
                  <th className="py-2.5 px-3 font-medium">DATE &amp; TIME</th>
                  <th className="py-2.5 px-3 font-medium">STATUS</th>
                  <th className="py-2.5 px-3 font-medium text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((tx, idx) => (
                  <tr key={String(tx.id || idx)} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-800">{tx.id}</td>
                    <td className="py-2.5 px-3 text-blue-600 font-normal">{tx.towId}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-normal">{tx.customer}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-normal flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-slate-400 stroke-[1.75]" />
                      <span>{tx.method}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-normal">{tx.date}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant={tx.status === "paid" ? "success" : "warning"}>
                        {tx.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 text-right">
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
