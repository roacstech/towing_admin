import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
}

export function Badge({
  className,
  variant = "neutral",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    neutral:
      "bg-slate-100 text-slate-600 border-slate-200/80",
    success:
      "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    warning:
      "bg-amber-50 text-amber-700 border-amber-200/80",
    danger:
      "bg-rose-50 text-rose-700 border-rose-200/80",
    info: "bg-blue-50 text-blue-700 border-blue-200/80",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-normal tracking-normal",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
