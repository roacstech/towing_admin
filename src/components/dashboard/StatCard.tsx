import React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: "up" | "down" | "neutral";
  color?: "blue" | "emerald" | "amber" | "purple";
}

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  trend = "neutral",
  color = "blue",
}: StatCardProps) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <Card className="flex items-center justify-between p-3.5">
      <div>
        <p className="text-xs font-normal text-slate-500">
          {title}
        </p>
        <p className="mt-1 text-base font-medium tracking-tight text-slate-800">
          {value}
        </p>
        {change && (
          <p
            className={cn(
              "mt-0.5 text-[10px] font-normal",
              trend === "up" && "text-emerald-600",
              trend === "down" && "text-rose-600",
              trend === "neutral" && "text-slate-400"
            )}
          >
            {change}
          </p>
        )}
      </div>
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg border", colorMap[color])}>
        <Icon className="h-4 w-4 stroke-[1.75]" />
      </div>
    </Card>
  );
}
