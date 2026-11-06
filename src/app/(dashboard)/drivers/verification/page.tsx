"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, FileText, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/common/SearchBar";
import { useNotification } from "@/context/NotificationContext";
import { formatDate } from "@/lib/utils";

interface VerificationDoc {
  id: number;
  driverId: number;
  driverName: string;
  driverPhone: string;
  documentType: string;
  documentNumber: string;
  status: string;
  expiryDate?: string;
  submittedAt: string;
}

export default function DriverDocumentVerificationPage() {
  const { showToast } = useNotification();
  const [docs, setDocs] = useState<VerificationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const loadDocs = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/admin/verification");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDocs(json.data);
      }
    } catch (_) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const handleUpdateStatus = async (id: number, name: string, status: "verified" | "rejected") => {
    try {
      const res = await fetch(`/api/admin/verification/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setDocs((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status } : d))
        );
        showToast(
          status === "verified"
            ? `Documents for ${name} have been approved!`
            : `Verification for ${name} rejected.`,
          status === "verified" ? "success" : "warning"
        );
      }
    } catch (_) {
      showToast("Failed to update document status.", "error");
    }
  };

  const filtered = docs.filter(
    (d) =>
      d.driverName.toLowerCase().includes(search.toLowerCase()) ||
      d.documentType.toLowerCase().includes(search.toLowerCase()) ||
      d.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.driverPhone.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium tracking-tight text-slate-800">
              Driver Document Verification Screen
            </h1>
            <span className="text-[11px] font-normal text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 stroke-[1.75]" />
              {docs.filter((d) => d.status === "pending").length} Pending Review
            </span>
          </div>
          <p className="text-xs font-normal text-slate-500 mt-0.5">
            Audit commercial driver licenses, tow truck insurance policies, and compliance records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadDocs(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-normal text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh verification list"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 stroke-[1.75] ${refreshing ? "animate-spin text-blue-600" : ""}`}
            />
            <span>{refreshing ? "Syncing..." : "Refresh"}</span>
          </button>
          <SearchBar placeholder="Search driver, doc type, license..." onSearch={setSearch} />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-normal text-slate-400">
                <th className="pb-2.5 font-normal">DRIVER NAME</th>
                <th className="pb-2.5 font-normal">PHONE NUMBER</th>
                <th className="pb-2.5 font-normal">DOCUMENT TYPE</th>
                <th className="pb-2.5 font-normal">DOC NUMBER / EXPIRY</th>
                <th className="pb-2.5 font-normal">SUBMITTED DATE</th>
                <th className="pb-2.5 font-normal">STATUS</th>
                <th className="pb-2.5 font-normal text-center">VERIFICATION ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600 stroke-[1.75]" />
                      <span>Loading dynamic verification records...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-500">
                    No verification records found.
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-2.5 font-medium text-slate-800">
                      {doc.driverName}
                    </td>
                    <td className="py-2.5 text-slate-700 font-normal">
                      {doc.driverPhone}
                    </td>
                    <td className="py-2.5 text-slate-800 font-normal">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-slate-400 stroke-[1.75]" />
                        <span>{doc.documentType}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-slate-600 font-normal">
                      <div>{doc.documentNumber}</div>
                      {doc.expiryDate && (
                        <div className="text-[10px] text-slate-400">Expires: {doc.expiryDate}</div>
                      )}
                    </td>
                    <td className="py-2.5 text-slate-500 font-normal">
                      {formatDate(doc.submittedAt)}
                    </td>
                    <td className="py-2.5">
                      <Badge
                        variant={
                          doc.status === "verified" || doc.status === "approved"
                            ? "success"
                            : doc.status === "pending"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {doc.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-center">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(doc.id, doc.driverName, "verified")}
                          className="h-7 text-[11px] gap-1 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 cursor-pointer"
                        >
                          <CheckCircle2 className="h-3 w-3 stroke-[1.75]" />
                          <span>Approve</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(doc.id, doc.driverName, "rejected")}
                          className="h-7 text-[11px] gap-1 text-rose-700 hover:bg-rose-50 hover:border-rose-200 cursor-pointer"
                        >
                          <XCircle className="h-3 w-3 stroke-[1.75]" />
                          <span>Reject</span>
                        </Button>
                      </div>
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
