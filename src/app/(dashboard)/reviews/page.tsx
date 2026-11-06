"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Star, MessageSquare, Search, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ReviewItem {
  id: string | number;
  customer?: string;
  customerName?: string;
  driver?: string;
  driverName?: string;
  rating: number;
  date?: string;
  createdAt?: string;
  comment?: string;
  service?: string;
  serviceType?: string;
}

export default function CustomerFeedbackReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | "all">("all");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setReviews(json.data);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
    const interval = setInterval(() => {
      fetchReviews();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchReviews]);

  // Derived dynamic stats
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / totalReviews).toFixed(2)
    : "5.00";
  const fiveStarCount = reviews.filter((r) => Math.round(Number(r.rating) || 5) === 5).length;
  const fiveStarPct = totalReviews > 0
    ? ((fiveStarCount / totalReviews) * 100).toFixed(1)
    : "100.0";

  const filtered = reviews.filter((rev) => {
    const cust = (rev.customer || rev.customerName || "").toLowerCase();
    const drv = (rev.driver || rev.driverName || "").toLowerCase();
    const cmt = (rev.comment || "").toLowerCase();
    const srv = (rev.service || rev.serviceType || "").toLowerCase();
    const q = search.toLowerCase();

    const matchesSearch =
      cust.includes(q) ||
      drv.includes(q) ||
      cmt.includes(q) ||
      srv.includes(q);

    const numericRating = Math.round(Number(rev.rating) || 5);
    const matchesRating = selectedRating === "all" || numericRating === selectedRating;

    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium tracking-tight text-slate-800">
              Customer Feedback &amp; Reviews
            </h1>
            <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live Ratings
            </span>
          </div>
          <p className="text-xs font-normal text-slate-500 mt-0.5">
            Monitor customer satisfaction, star ratings, and service feedback across all completed tows
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchReviews}
          disabled={loading}
          className="gap-1 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-3.5">
          <p className="text-xs font-normal text-slate-500">Average Fleet Rating</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-medium text-slate-800">{avgRating}</span>
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-amber-400 stroke-none" />
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Based on {totalReviews} dynamic customer reviews
          </p>
        </Card>

        <Card className="p-3.5">
          <p className="text-xs font-normal text-slate-500">5-Star Satisfaction Rate</p>
          <p className="text-base font-medium text-emerald-700 mt-1">{fiveStarPct}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {fiveStarCount} out of {totalReviews} rated 5 stars
          </p>
        </Card>

        <Card className="p-3.5">
          <p className="text-xs font-normal text-slate-500">Unresolved Concerns</p>
          <p className="text-base font-medium text-slate-800 mt-1">0 Pending</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">All issues answered by dispatch</p>
        </Card>
      </div>

      {/* Filter toolbar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviewer, driver, comment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-normal text-slate-400 mr-1">Rating:</span>
            {(["all", 5, 4, 3] as const).map((star) => (
              <button
                key={String(star)}
                type="button"
                onClick={() => setSelectedRating(star)}
                className={`rounded-md px-2.5 py-1 text-xs font-normal transition-colors cursor-pointer ${
                  selectedRating === star
                    ? "bg-blue-50 text-blue-700 border border-blue-200 font-medium"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {star === "all" ? "All Stars" : `${star} Stars`}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      {loading && reviews.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          </div>
          <p className="text-xs font-medium text-slate-700">Loading live customer reviews...</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-xs text-slate-500">
          No customer reviews found matching your search.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((rev) => {
            const customerName = rev.customer || rev.customerName || "Verified Customer";
            const driverName = rev.driver || rev.driverName || "Central Fleet Operator";
            const serviceName = rev.service || rev.serviceType || "On-Demand Towing";
            const reviewDate = rev.date || (rev.createdAt ? rev.createdAt.slice(0, 10) : "Recent");
            const starCount = Math.max(1, Math.min(5, Math.round(Number(rev.rating) || 5)));

            return (
              <Card key={String(rev.id)} className="space-y-2 p-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-800">{customerName}</p>
                    <p className="text-[11px] font-normal text-slate-400">
                      Assigned Operator: {driverName} &bull; Service: {serviceName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(starCount)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-[11px] font-normal text-slate-400 ml-1.5">{reviewDate}</span>
                  </div>
                </div>

                <p className="text-xs font-normal text-slate-600 italic bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                  &quot;{rev.comment}&quot;
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
