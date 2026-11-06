import React, { Suspense } from "react";
import { TowDetailView } from "./TowDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TowDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-xs text-slate-400">
          Loading dispatch details...
        </div>
      }
    >
      <TowDetailView id={resolvedParams.id} />
    </Suspense>
  );
}
