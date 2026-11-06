"use client";

import React, { useState, useEffect, useCallback } from "react";
import { HelpCircle, MessageSquare, AlertCircle, CheckCircle2, RefreshCw, Filter, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/common/SearchBar";

interface SupportTicket {
  id: string;
  requester: string;
  subject: string;
  category: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
}

export default function SupportComplaintsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/support", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTickets(json.data);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateTicketStatus = async (id: string, newStatus: "resolved" | "in_progress" | "open") => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch(`/api/admin/support/${encodeURIComponent(id)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update ticket status:", err);
    }
  };

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      (t.id || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.requester || (t as any).customerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.subject || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.category || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium tracking-tight text-slate-800">
              Support &amp; Complaints Screen
            </h1>
            <span className="text-[11px] font-normal text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Live Inquiries
            </span>
          </div>
          <p className="text-xs font-normal text-slate-500 mt-0.5">
            Handle roadside incident inquiries, customer support requests, and driver communication
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchTickets}
          disabled={loading}
          className="gap-1 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-3.5">
          <p className="text-xs font-normal text-slate-500">Open Tickets</p>
          <p className="text-base font-medium text-amber-700 mt-1">{openCount} Needs Response</p>
          <p className="text-[10px] text-amber-600 mt-0.5">Customer &amp; driver inquiries</p>
        </Card>

        <Card className="p-3.5">
          <p className="text-xs font-normal text-slate-500">In Progress</p>
          <p className="text-base font-medium text-blue-600 mt-1">{inProgressCount} Investigating</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Assigned to dispatch leads</p>
        </Card>

        <Card className="p-3.5">
          <p className="text-xs font-normal text-slate-500">Resolved</p>
          <p className="text-base font-medium text-emerald-700 mt-1">{resolvedCount} Completed</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Resolved with customer confirmation</p>
        </Card>
      </div>

      {/* Filter toolbar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <SearchBar placeholder="Search tickets, customers, drivers..." onSearch={setSearch} />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-normal text-slate-400 mr-1">Status:</span>
            {["all", "open", "in_progress", "resolved"].map((st) => (
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
                {st === "all" ? "All" : st.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {loading && tickets.length === 0 ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-xs text-slate-600">Loading support tickets...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No support tickets found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-medium text-slate-600">
                  <th className="py-2.5 px-3 font-medium">TICKET ID</th>
                  <th className="py-2.5 px-3 font-medium">REQUESTER</th>
                  <th className="py-2.5 px-3 font-medium">SUBJECT</th>
                  <th className="py-2.5 px-3 font-medium">CATEGORY</th>
                  <th className="py-2.5 px-3 font-medium">CREATED</th>
                  <th className="py-2.5 px-3 font-medium">STATUS</th>
                  <th className="py-2.5 px-3 font-medium text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((t, idx) => (
                  <tr key={String(t.id || idx)} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-800">{t.id}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-normal">{t.requester}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-normal max-w-xs truncate">
                      {t.subject}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-normal">{t.category}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-normal">{t.createdAt}</td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant={
                          t.status === "open"
                            ? "warning"
                            : t.status === "in_progress"
                            ? "info"
                            : "success"
                        }
                      >
                        {t.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {t.status !== "resolved" ? (
                          <button
                            type="button"
                            onClick={() => updateTicketStatus(t.id, "resolved")}
                            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-normal text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer"
                          >
                            <Check className="h-3 w-3 stroke-[2]" />
                            <span>Resolve</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateTicketStatus(t.id, "open")}
                            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-normal text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <span>Reopen</span>
                          </button>
                        )}
                      </div>
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
