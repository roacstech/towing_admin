import React from "react";
import { Badge } from "@/components/ui/Badge";
import { TowStatus, TOW_STATUS } from "@/lib/constants";

interface TowStatusBadgeProps {
  status: TowStatus | string;
}

export function TowStatusBadge({ status }: TowStatusBadgeProps) {
  const s = (status || "").toLowerCase().trim();

  if (
    s === "pending_admin_dispatch" ||
    s === "needs_admin_dispatch" ||
    s.includes("admin_dispatch") ||
    s.includes("manual_dispatch")
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-300 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 shadow-2xs">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
        Needs Admin Assign
      </span>
    );
  }

  if (s === TOW_STATUS.COMPLETED || s === "completed" || s === "done") {
    return <Badge variant="success">Completed</Badge>;
  }

  if (s === TOW_STATUS.PENDING || s === "pending" || s === "waiting" || s === "awaiting_driver") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        Awaiting Driver
      </span>
    );
  }

  if (
    s === TOW_STATUS.ACCEPTED ||
    s === "accepted" ||
    s === TOW_STATUS.EN_ROUTE ||
    s === "en_route" ||
    s === "en route" ||
    s === "en route to pickup"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        En Route to Pickup
      </span>
    );
  }

  if (s === TOW_STATUS.ARRIVED || s === "arrived" || s === "on_scene" || s === "on scene") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
        Arrived at Scene
      </span>
    );
  }

  if (
    s === TOW_STATUS.IN_PROGRESS ||
    s === "towing" ||
    s === "in_progress" ||
    s === "in transit" ||
    s === "active"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
        <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
        Towing in Progress
      </span>
    );
  }

  if (s === TOW_STATUS.CANCELLED || s === "cancelled" || s === "canceled") {
    return <Badge variant="danger">Cancelled</Badge>;
  }

  return <Badge variant="neutral">{status}</Badge>;
}
