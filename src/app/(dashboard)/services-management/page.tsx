"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Truck,
  Plus,
  CheckCircle2,
  Wrench,
  Search,
  Filter,
  Star,
  Clock,
  DollarSign,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  X,
  Shield,
  Layers,
  Car,
  Zap,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

export interface ServiceItem {
  id: string;
  serviceNumber: string;
  name: string;
  category: "Towing" | "Roadside" | "Recovery" | "Commercial" | "Specialized";
  description: string;
  bulletPoints: string[];
  basePrice: string;
  estimatedEta: string;
  badge?: string;
  status: "active" | "inactive";
  equipmentRequired?: string;
}

export default function ServiceManagementPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New service form state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<ServiceItem["category"]>("Towing");
  const [newPrice, setNewPrice] = useState("");
  const [newEta, setNewEta] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newBullets, setNewBullets] = useState("");

  // Edit service form state
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState<ServiceItem["category"]>("Towing");
  const [editPrice, setEditPrice] = useState("");
  const [editEta, setEditEta] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editBullets, setEditBullets] = useState("");
  const [editEquipment, setEditEquipment] = useState("");
  const [editBadge, setEditBadge] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");

  // Delete service confirmation state
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);

  const categories = ["All", "Towing", "Roadside", "Recovery", "Commercial", "Specialized"];

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setServices(json.data);
      }
    } catch (e) {
      console.error("Failed to load services:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Toggle active status via toggle switch and sync with backend
  const toggleServiceStatus = async (id: string) => {
    const target = services.find((s) => s.id === id);
    if (!target) return;
    const newStatus: "active" | "inactive" = target.status === "active" ? "inactive" : "active";
    const updated = { ...target, status: newStatus };

    setServices((prev) =>
      prev.map((s) => (s.id === id ? updated : s))
    );

    try {
      await fetch(`/api/admin/services/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error("Error updating service status:", err);
    }
  };

  // Open Edit Modal with current values
  const handleOpenEditModal = (srv: ServiceItem) => {
    setEditingService(srv);
    setEditName(srv.name);
    setEditCategory(srv.category);
    setEditPrice(srv.basePrice);
    setEditEta(srv.estimatedEta);
    setEditDesc(srv.description);
    setEditBullets((srv.bulletPoints || []).join(", "));
    setEditEquipment(srv.equipmentRequired || "");
    setEditBadge(srv.badge || "");
    setEditStatus(srv.status);
  };

  // Save changes from Edit Modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editName.trim() || !editPrice.trim()) return;

    const updated: ServiceItem = {
      ...editingService,
      name: editName.trim(),
      category: editCategory,
      basePrice: editPrice.startsWith("$") ? editPrice.trim() : `$${editPrice.trim()}`,
      estimatedEta: editEta.trim() || editingService.estimatedEta,
      description: editDesc.trim() || editingService.description,
      bulletPoints: editBullets
        ? editBullets.split(",").map((b) => b.trim()).filter(Boolean)
        : editingService.bulletPoints,
      equipmentRequired: editEquipment.trim() || editingService.equipmentRequired,
      badge: editBadge.trim() ? editBadge.trim() : undefined,
      status: editStatus,
    };

    setServices((prev) =>
      prev.map((s) => (s.id === editingService.id ? updated : s))
    );
    setEditingService(null);

    try {
      await fetch(`/api/admin/services/${encodeURIComponent(updated.id)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error("Error saving service edit:", err);
    }
  };

  // Confirm delete service
  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    const toDeleteId = serviceToDelete.id;
    setServices((prev) => prev.filter((s) => s.id !== toDeleteId));
    setServiceToDelete(null);

    try {
      await fetch(`/api/admin/services/${encodeURIComponent(toDeleteId)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  };

  // Add new service
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice.trim()) return;

    const nextNumber = String(services.length + 1).padStart(2, "0");
    const newService: ServiceItem = {
      id: `SRV-${nextNumber}`,
      serviceNumber: nextNumber,
      name: newName.trim(),
      category: newCategory,
      description: newDesc.trim() || "Roadside towing service",
      bulletPoints: newBullets
        ? newBullets.split(",").map((b) => b.trim()).filter(Boolean)
        : ["Everyday towing support"],
      basePrice: newPrice.startsWith("$") ? newPrice.trim() : `$${newPrice.trim()}`,
      estimatedEta: newEta.trim() || "5-10 min",
      status: "active",
      equipmentRequired: "Standard Tow Truck",
    };

    setServices((prev) => [newService, ...prev]);
    setIsModalOpen(false);
    setNewName("");
    setNewPrice("");
    setNewEta("");
    setNewDesc("");
    setNewBullets("");

    try {
      await fetch("/api/admin/services", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(newService),
      });
    } catch (err) {
      console.error("Error creating service:", err);
    }
  };

  const filteredServices = services.filter((srv) => {
    const matchesSearch =
      srv.name.toLowerCase().includes(search.toLowerCase()) ||
      srv.description.toLowerCase().includes(search.toLowerCase()) ||
      (srv.bulletPoints || []).some((bp) => bp.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || srv.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const activeCount = services.filter((s) => s.status === "active").length;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium tracking-tight text-slate-800">
              Services Management
            </h1>
          
          </div>
       
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchServices}
            disabled={loading}
            className="gap-1 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="gap-1 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 stroke-[1.75]" />
            <span>Add Service</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3.5">
          <p className="text-xs font-normal text-slate-500">Total Services Catalog</p>
          <p className="text-base font-medium text-slate-800 mt-1">{services.length} Services</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Customer App booking tiers</p>
        </Card>

        <Card className="p-3.5">
          <p className="text-xs font-normal text-slate-500">Active On-Demand</p>
          <p className="text-base font-medium text-emerald-700 mt-1">{activeCount} Enabled</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Visible to nearby customers</p>
        </Card>

        <Card className="p-3.5">
          <p className="text-xs font-normal text-slate-500">Categories Covered</p>
          <p className="text-base font-medium text-blue-600 mt-1">5 Core Specialties</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Towing, Roadside, Recovery &amp; Heavy</p>
        </Card>

        <Card className="p-3.5">
          <p className="text-xs font-normal text-slate-500">Avg Dispatch ETA</p>
          <p className="text-base font-medium text-slate-800 mt-1">4 - 10 min</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Dynamic driver GPS routing</p>
        </Card>
      </div>

      {/* Filter and View Mode Toolbar */}
      <Card className="p-3 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search service name, vehicle, or scope..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Table vs Card View Toggle Buttons */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span className="text-xs font-normal text-slate-500 mr-1 hidden sm:inline">
              Layout:
            </span>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`rounded-md px-2.5 py-1 text-xs font-normal transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-blue-50 text-blue-700 border border-blue-200 font-medium"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Table View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`rounded-md px-2.5 py-1 text-xs font-normal transition-colors cursor-pointer ${
                viewMode === "cards"
                  ? "bg-blue-50 text-blue-700 border border-blue-200 font-medium"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Card View
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-normal text-slate-400 mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-md px-2.5 py-1 text-xs font-normal transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#0060df] text-white font-medium shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Loading state */}
      {loading && services.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          </div>
          <p className="text-xs font-medium text-slate-700">Loading live services from backend...</p>
        </Card>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-700">
                  <th className="py-2.5 px-3 font-medium w-12 text-center">#</th>
                  <th className="py-2.5 px-3 font-medium">SERVICE NAME</th>
                  <th className="py-2.5 px-3 font-medium">CATEGORY</th>
                  <th className="py-2.5 px-3 font-medium">ELIGIBLE VEHICLES &amp; SCOPE</th>
                  <th className="py-2.5 px-3 font-medium">BASE FARE</th>
                  <th className="py-2.5 px-3 font-medium">DISPATCH ETA</th>
                  <th className="py-2.5 px-3 font-medium text-center">ACTIVE / DEACTIVE</th>
                  <th className="py-2.5 px-3 font-medium text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-slate-500">
                      No services found matching &quot;{search}&quot;.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((srv) => (
                    <tr
                      key={srv.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* # */}
                      <td className="py-2.5 px-3 text-center font-medium text-slate-500 text-xs">
                        {srv.serviceNumber}
                      </td>

                      {/* Name & Badge */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 text-xs sm:text-sm">
                            {srv.name}
                          </p>
                          {srv.badge && (
                            <span className="inline-flex items-center rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200">
                              {srv.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-normal text-slate-500 max-w-sm truncate mt-0.5">
                          {srv.description}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-normal text-slate-700">
                          {srv.category}
                        </span>
                      </td>

                      {/* Eligible Vehicles & Scope (Bullet points) */}
                      <td className="py-2.5 px-3 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {(srv.bulletPoints || []).map((bp, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 font-normal"
                            >
                              {bp}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Base Fare */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-900 text-xs">
                        {srv.basePrice}
                      </td>

                      {/* Dispatch ETA */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-normal text-slate-600 text-xs">
                        {srv.estimatedEta}
                      </td>

                      {/* Active / Deactive Toggle Button (Pill Switch) */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-center">
                        <div className="inline-flex items-center justify-center gap-2">
                          <ToggleSwitch
                            checked={srv.status === "active"}
                            onChange={() => toggleServiceStatus(srv.id)}
                            ariaLabel={`Toggle ${srv.name}`}
                          />
                          <span
                            className={`text-xs font-normal w-12 text-left ${
                              srv.status === "active"
                                ? "text-emerald-700 font-medium"
                                : "text-slate-400"
                            }`}
                          >
                            {srv.status === "active" ? "Active" : "Disabled"}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(srv)}
                            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-normal text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors cursor-pointer"
                            title="Edit Service"
                          >
                            <Pencil className="h-3 w-3 stroke-[1.75]" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setServiceToDelete(srv)}
                            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-normal text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                            title="Delete Service"
                          >
                            <Trash2 className="h-3 w-3 stroke-[1.75]" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredServices.map((srv) => (
            <Card
              key={srv.id}
              className="p-4 flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-3"
            >
              <div>
                {/* Header: Service Number, Title, Category & Top Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-medium text-blue-700 border border-blue-200/80">
                      {srv.serviceNumber}
                    </span>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 leading-tight">
                        {srv.name}
                      </h3>
                      <span className="text-[11px] font-normal text-slate-500 mt-0.5 inline-block">
                        {srv.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {srv.badge && (
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[9px] font-medium text-amber-700 border border-amber-200">
                        {srv.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Service Description */}
                <p className="text-xs font-normal text-slate-600 leading-relaxed mt-2.5">
                  {srv.description}
                </p>

                {/* Scope points / Eligible Coverage */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    Eligible Coverage:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(srv.bulletPoints || []).map((bp, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200/80 px-2 py-0.5 text-[11px] font-normal text-slate-700"
                      >
                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600 stroke-[2] shrink-0" />
                        <span>{bp}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rates & Dispatch ETA Box */}
                <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50/80 border border-slate-200/70 px-3 py-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-medium text-slate-400 block leading-tight">
                      Base Fare
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      {srv.basePrice}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-medium text-slate-400 block leading-tight">
                      Dispatch ETA
                    </span>
                    <span className="text-xs font-normal text-slate-700 flex items-center gap-1 justify-end">
                      <Clock className="h-3 w-3 text-slate-400 stroke-[1.75]" />
                      {srv.estimatedEta}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom footer: Toggle switch on Left & Edit/Delete Buttons on Right */}
              <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between text-xs">
                {/* Active/Inactive Toggle */}
                <div className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={srv.status === "active"}
                    onChange={() => toggleServiceStatus(srv.id)}
                    size="sm"
                    ariaLabel={`Toggle ${srv.name}`}
                  />
                  <span
                    className={`text-[11px] font-normal ${
                      srv.status === "active" ? "text-emerald-700 font-medium" : "text-slate-400"
                    }`}
                  >
                    {srv.status === "active" ? "Active" : "Disabled"}
                  </span>
                </div>

                {/* Edit and Delete Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(srv)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-normal text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors cursor-pointer"
                    title="Edit service details"
                  >
                    <Pencil className="h-3 w-3 stroke-[1.75]" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceToDelete(srv)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-normal text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                    title="Delete service"
                  >
                    <Trash2 className="h-3 w-3 stroke-[1.75]" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ADD SERVICE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-medium text-slate-800">
                Add New Tow / Roadside Service
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-3">
              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winch-Out Special Extraction"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-normal text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ServiceItem["category"])}
                    className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="Towing">Towing</option>
                    <option value="Roadside">Roadside</option>
                    <option value="Recovery">Recovery</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Specialized">Specialized</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-normal text-slate-700 mb-1">
                    Base Fare *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="$65.00"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">
                  Estimated Arrival Time (ETA)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5-10 min"
                  value={newEta}
                  onChange={(e) => setNewEta(e.target.value)}
                  className="w-full rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the service scope..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">
                  Eligible Vehicles / Scope (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cars, SUVs, Light Trucks"
                  value={newBullets}
                  onChange={(e) => setNewBullets(e.target.value)}
                  className="w-full rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="cursor-pointer text-xs"
                >
                  Save Service
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SERVICE MODAL */}
      {editingService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <Pencil className="h-4 w-4 stroke-[1.75]" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-slate-800">
                    Edit Service Details
                  </h2>
                  <p className="text-[11px] font-normal text-slate-400">
                    Service #{editingService.serviceNumber} &bull; {editingService.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-normal text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as ServiceItem["category"])}
                    className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="Towing">Towing</option>
                    <option value="Roadside">Roadside</option>
                    <option value="Recovery">Recovery</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Specialized">Specialized</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-normal text-slate-700 mb-1">
                    Base Fare *
                  </label>
                  <input
                    type="text"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-normal text-slate-700 mb-1">
                    Estimated Arrival Time (ETA)
                  </label>
                  <input
                    type="text"
                    value={editEta}
                    onChange={(e) => setEditEta(e.target.value)}
                    className="w-full rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal text-slate-700 mb-1">
                    Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. COMMERCIAL READY"
                    value={editBadge}
                    onChange={(e) => setEditBadge(e.target.value)}
                    className="w-full rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">
                  Required Equipment
                </label>
                <input
                  type="text"
                  placeholder="e.g. Standard Wheel-Lift / Class 6 Tow Rig"
                  value={editEquipment}
                  onChange={(e) => setEditEquipment(e.target.value)}
                  className="w-full rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1">
                  Eligible Vehicles / Scope (comma separated)
                </label>
                <input
                  type="text"
                  value={editBullets}
                  onChange={(e) => setEditBullets(e.target.value)}
                  className="w-full rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Status Toggle in Edit Modal */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <div>
                  <p className="text-xs font-medium text-slate-800">Service Status</p>
                  <p className="text-[11px] font-normal text-slate-500">
                    Enable or disable this service across customer booking app
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={editStatus === "active"}
                    onChange={(checked) => setEditStatus(checked ? "active" : "inactive")}
                    ariaLabel="Toggle service status"
                  />
                  <span className="text-xs font-normal text-slate-700">
                    {editStatus === "active" ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingService(null)}
                  className="cursor-pointer text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="cursor-pointer text-xs"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                  <Trash2 className="h-4 w-4 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-800">
                    Delete Service
                  </h3>
                  <p className="text-[11px] font-normal text-slate-400">
                    {serviceToDelete.serviceNumber} - {serviceToDelete.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-1 text-xs font-normal text-slate-600 leading-relaxed">
              Are you sure you want to delete <span className="font-medium text-slate-900">&quot;{serviceToDelete.name}&quot;</span>? This will permanently remove this towing option from the dispatch catalog and mobile app requests.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setServiceToDelete(null)}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-normal text-white hover:bg-rose-700 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 stroke-[1.75]" />
                <span>Delete Service</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
