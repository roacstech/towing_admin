import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center",
        className
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2.5">
        {icon || <FolderOpen className="h-4 w-4 stroke-[1.75]" />}
      </div>
      <h3 className="text-xs font-medium text-slate-800">
        {title}
      </h3>
      {description && (
        <p className="mt-0.5 max-w-sm text-[11px] font-normal text-slate-400">
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
