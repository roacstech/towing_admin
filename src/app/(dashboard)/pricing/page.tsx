"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Check, ChevronDown, Trash2, ArrowLeft, RotateCcw, AlertCircle, Info } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";
import { ServiceRateItem } from "@/app/api/pricing/route";

const CATEGORIES = [
  "Towing",
  "Mileage",
  "Roadside",
  "Recovery",
  "Commercial",
  "Surcharge",
  "Admin",
  "Specialized",
];

interface ColumnDef {
  key: keyof Omit<
    ServiceRateItem,
    | "id"
    | "name"
    | "category"
    | "chargeTax"
    | "preventFuelSurcharges"
    | "freeMiles"
    | "isDeleted"
    | "createdAt"
    | "updatedAt"
  >;
  label: string;
  hasDropdown?: boolean;
}

const COLUMNS: ColumnDef[] = [
  { key: "defaultRate", label: "Default" },
  { key: "lightRate", label: "Light" },
  { key: "mediumRate", label: "Medium" },
  { key: "heavyRate", label: "Heavy" },
  { key: "motorcycleRate", label: "Motorcycle" },
  { key: "trailerRate", label: "Trailer" },
  { key: "tractorRate", label: "Tractor" },
  { key: "otherRate", label: "Other" },
  { key: "equipmentRate", label: "Equipment", hasDropdown: true },
  { key: "containerRate", label: "Container" },
  { key: "materialRate", label: "Material" },
];

export default function ServiceRatesMatrixPage() {
  const { showToast } = useNotification();
  const [rates, setRates] = useState<ServiceRateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);

  // View mode: 'matrix' (Image 1) or 'modify' (Image 2)
  const [viewMode, setViewMode] = useState<"matrix" | "modify">("matrix");
  const [editingRate, setEditingRate] = useState<ServiceRateItem | null>(null);
  const [isNewRate, setIsNewRate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAccountsInfo, setShowAccountsInfo] = useState(false);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pricing?includeDeleted=${showDeleted}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRates(json.data);
      }
    } catch (err) {
      console.error("Failed to load service rates:", err);
      showToast("Error loading service rates matrix", "error");
    } finally {
      setLoading(false);
    }
  }, [showDeleted, showToast]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleAddNew = () => {
    const blank: ServiceRateItem = {
      id: "",
      name: "",
      category: "Towing",
      chargeTax: false,
      preventFuelSurcharges: false,
      defaultRate: 0,
      lightRate: 0,
      mediumRate: 0,
      heavyRate: 0,
      motorcycleRate: 0,
      trailerRate: 0,
      tractorRate: 0,
      otherRate: 0,
      equipmentRate: 0,
      containerRate: 0,
      materialRate: 0,
      freeMiles: 0,
      isDeleted: false,
    };
    setEditingRate(blank);
    setIsNewRate(true);
    setViewMode("modify");
  };

  const handleRowClick = (rate: ServiceRateItem) => {
    setEditingRate({ ...rate });
    setIsNewRate(false);
    setViewMode("modify");
  };

  const handleCancel = () => {
    setEditingRate(null);
    setIsNewRate(false);
    setViewMode("matrix");
  };

  const handleSave = async () => {
    if (!editingRate) return;
    if (!editingRate.name.trim()) {
      showToast("Please enter a service name", "warning");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(editingRate),
      });

      const json = await res.json();
      if (json.success) {
        showToast(
          isNewRate
            ? `Service rate "${editingRate.name}" created successfully`
            : `Service rate "${editingRate.name}" updated successfully`,
          "success"
        );
        setViewMode("matrix");
        setEditingRate(null);
        fetchRates();
      } else {
        showToast(json.error || "Failed to save rate", "error");
      }
    } catch (err) {
      showToast("Network error saving service rate", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingRate) return;
    if (!editingRate.id) {
      setViewMode("matrix");
      setEditingRate(null);
      return;
    }

    if (!confirm(`Are you sure you want to delete rate "${editingRate.name}"?`)) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/pricing/${editingRate.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Rate "${editingRate.name}" has been deleted`, "success");
        setViewMode("matrix");
        setEditingRate(null);
        fetchRates();
      } else {
        showToast(json.error || "Failed to delete rate", "error");
      }
    } catch (err) {
      showToast("Network error deleting service rate", "error");
    } finally {
      setSaving(false);
    }
  };

  const formatRateValue = (val: number | undefined) => {
    if (val === undefined || val === null || val === 0) {
      return "-";
    }
    return `$${val.toFixed(2)}`;
  };

  const updateField = (field: keyof ServiceRateItem, value: any) => {
    if (!editingRate) return;
    setEditingRate({
      ...editingRate,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* ============================================================== */}
      {/* 1. MATRIX TABLE VIEW (Image 1 - Towbook Service & Storage Rates) */}
      {/* ============================================================== */}
      {viewMode === "matrix" && (
        <div className="space-y-3">
          {/* Header & Subtext */}
          <div>
            <h1 className="text-xl font-normal text-slate-800 tracking-tight">
              Service &amp; Storage Rates
            </h1>
            <p className="text-xs font-normal text-slate-500 mt-1">
              To modify an existing rate, click on the service in the list below. To add a new service, simply click the green Add a new Service Rate button.
            </p>
          </div>

          {/* Action Bar: Green Add Button + Show Deleted Checkbox */}
          <div className="flex items-center gap-4 pt-1">
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#248046] hover:bg-[#1e6f3d] text-white text-xs font-medium rounded transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add a new Service Rate
            </button>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-normal">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
                className="w-3.5 h-3.5 text-[#248046] border-slate-300 rounded focus:ring-0 cursor-pointer"
              />
              Show Deleted Service Rates
            </label>
          </div>

          {/* Rate Matrix Table */}
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="py-2.5 px-3.5 text-xs font-medium text-slate-900 w-[240px]">
                    Service Item
                  </th>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className="py-2.5 px-2 text-center text-xs font-medium text-slate-900 whitespace-nowrap min-w-[70px]"
                    >
                      <span className="inline-flex items-center justify-center gap-1">
                        {col.label}
                        {col.hasDropdown && (
                          <ChevronDown className="w-3 h-3 text-slate-600" />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={COLUMNS.length + 1}
                      className="py-12 text-center text-xs text-slate-400 font-normal"
                    >
                      Loading dispatch service rates...
                    </td>
                  </tr>
                ) : rates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLUMNS.length + 1}
                      className="py-12 text-center text-xs text-slate-400 font-normal"
                    >
                      No service rates found. Click &quot;Add a new Service Rate&quot; to begin.
                    </td>
                  </tr>
                ) : (
                  rates.map((rate) => {
                    const isDel = rate.isDeleted;
                    return (
                      <tr
                        key={rate.id}
                        onClick={() => handleRowClick(rate)}
                        className={`group cursor-pointer transition-colors ${
                          isDel
                            ? "bg-slate-50/60 opacity-60 hover:bg-slate-100"
                            : "hover:bg-slate-100/70"
                        }`}
                      >
                        <td className="py-2.5 px-3.5 text-xs text-slate-800 font-normal whitespace-nowrap">
                          <span
                            className={
                              isDel ? "line-through text-slate-400" : "group-hover:text-blue-700"
                            }
                          >
                            {rate.name}
                          </span>
                          {isDel && (
                            <span className="ml-2 text-[10px] text-red-600 bg-red-50 border border-red-200 px-1 py-0.2 rounded font-normal">
                              Deleted
                            </span>
                          )}
                        </td>

                        {COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            className="py-2.5 px-2 text-center text-xs text-slate-600 font-normal whitespace-nowrap"
                          >
                            {formatRateValue(rate[col.key as keyof ServiceRateItem] as number)}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MODIFY / ADD VIEW (Image 2 - Modify Service Rate Screen)   */}
      {/* ============================================================== */}
      {viewMode === "modify" && editingRate && (
        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden animate-in fade-in duration-150">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-normal mb-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Service Rates
              </button>
              <h1 className="text-xl font-normal text-slate-800 tracking-tight">
                {isNewRate ? "Add a new Service Rate" : `Modify ${editingRate.name}`}
              </h1>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* 1. Name Input */}
            <div className="max-w-xl">
              <label className="block text-sm font-normal text-slate-500 mb-1">
                Name
              </label>
              <input
                type="text"
                value={editingRate.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Loaded/Hooked Mileage"
                className="w-full text-xs font-normal text-slate-800 px-3 py-2 border border-slate-300 rounded focus:border-[#248046] focus:ring-1 focus:ring-[#248046] outline-none"
              />
            </div>

            {/* 2. Category Dropdown */}
            <div className="max-w-xs">
              <label className="block text-sm font-normal text-slate-500 mb-1">
                Category
              </label>
              <div className="relative">
                <select
                  value={editingRate.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full appearance-none text-xs font-normal text-slate-800 bg-white px-3 py-2 border border-slate-300 rounded focus:border-[#248046] focus:ring-1 focus:ring-[#248046] outline-none pr-8 cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. Toggle Pills: Charge Tax & Prevent Fuel Surcharges */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => updateField("chargeTax", !editingRate.chargeTax)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-normal border rounded transition-colors select-none ${
                  editingRate.chargeTax
                    ? "bg-emerald-50 border-[#248046] text-[#248046]"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="w-3.5 h-3.5 flex items-center justify-center border border-current rounded-sm text-[10px]">
                  {editingRate.chargeTax ? "✓" : "-"}
                </span>
                Charge Tax
              </button>

              <button
                type="button"
                onClick={() =>
                  updateField(
                    "preventFuelSurcharges",
                    !editingRate.preventFuelSurcharges
                  )
                }
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-normal border rounded transition-colors select-none ${
                  editingRate.preventFuelSurcharges
                    ? "bg-emerald-50 border-[#248046] text-[#248046]"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="w-3.5 h-3.5 flex items-center justify-center border border-current rounded-sm text-[10px]">
                  {editingRate.preventFuelSurcharges ? "✓" : "-"}
                </span>
                Prevent Fuel Surcharges
              </button>
            </div>

            {/* 4. Price Matrix Table / Inputs */}
            <div className="pt-2 space-y-3">
              <label className="block text-sm font-normal text-slate-600">
                Price
              </label>

              <div className="border border-slate-200 rounded overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-white">
                      <th className="py-2 px-3 text-xs font-normal text-slate-500 w-[120px]"></th>
                      {COLUMNS.map((col) => (
                        <th
                          key={col.key}
                          className="py-2 px-2 text-center text-xs font-normal text-slate-600 whitespace-nowrap min-w-[65px]"
                        >
                          {col.label}
                        </th>
                      ))}
                      <th className="py-2 px-2 text-center text-xs font-normal text-slate-600 whitespace-nowrap min-w-[65px]">
                        Free miles
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-slate-50/70">
                      {/* Left Header label: Standard Rate */}
                      <td className="py-2 px-3 text-xs font-normal text-slate-700 whitespace-nowrap border-r border-slate-200">
                        Standard Rate
                      </td>

                      {/* Inputs for each column */}
                      {COLUMNS.map((col) => {
                        const val = editingRate[
                          col.key as keyof ServiceRateItem
                        ] as number;
                        return (
                          <td
                            key={col.key}
                            className="py-1.5 px-1.5 text-center border-r border-slate-100"
                          >
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={val === 0 ? "" : val}
                              onChange={(e) =>
                                updateField(
                                  col.key as keyof ServiceRateItem,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="0.00"
                              className="w-full text-center text-xs font-normal text-slate-800 bg-white py-1 px-1 border border-slate-300 rounded focus:border-[#248046] focus:ring-1 focus:ring-[#248046] outline-none"
                            />
                          </td>
                        );
                      })}

                      {/* Free miles Input */}
                      <td className="py-1.5 px-1.5 text-center">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={
                            editingRate.freeMiles === 0
                              ? ""
                              : editingRate.freeMiles
                          }
                          onChange={(e) =>
                            updateField(
                              "freeMiles",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          className="w-full text-center text-xs font-normal text-slate-800 bg-white py-1 px-1 border border-slate-300 rounded focus:border-[#248046] focus:ring-1 focus:ring-[#248046] outline-none"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Choose Accounts Button & Tip */}
              <div className="pt-2 space-y-1.5">
                <button
                  type="button"
                  onClick={() => setShowAccountsInfo(!showAccountsInfo)}
                  className="px-3 py-1.5 bg-[#248046] hover:bg-[#1e6f3d] text-white text-xs font-medium rounded transition-colors shadow-sm"
                >
                  Choose Accounts
                </button>

                {showAccountsInfo && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 font-normal flex items-start gap-2 max-w-xl">
                    <Info className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-emerald-900 mb-0.5">
                        Account-Specific Pricing
                      </p>
                      Standard rates currently apply to all registered accounts (Retail Tow Customers, AAA / Motor Clubs, Insurance Carriers, and Commercial Fleet Dispatches). Custom tier overrides can be toggled per account.
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-500 font-normal italic">
                  Tip: You can set unique prices for each of your accounts if you charge an amount different than the standard rate entered.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar (Save, Cancel, Delete in green Towbook layout) */}
          <div className="border-t border-slate-200 bg-slate-50 p-3 sm:px-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="px-6 py-2 bg-[#248046] hover:bg-[#1e6f3d] disabled:opacity-50 text-white text-xs font-medium rounded transition-colors shadow-sm"
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-[#248046] hover:bg-[#1e6f3d] text-white text-xs font-medium rounded transition-colors shadow-sm"
              >
                Cancel
              </button>
            </div>

            {!isNewRate && (
              <button
                type="button"
                disabled={saving}
                onClick={handleDelete}
                className="px-6 py-2 bg-[#248046] hover:bg-red-600 disabled:opacity-50 text-white text-xs font-medium rounded transition-colors shadow-sm"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
