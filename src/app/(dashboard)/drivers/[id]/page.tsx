import React, { Suspense } from "react";
import { DriverDetailView } from "./DriverDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DriverDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center text-xs font-normal text-slate-400">
          Loading driver details...
        </div>
      }
    >
      <DriverDetailView id={resolvedParams.id} />
    </Suspense>
  );
}

