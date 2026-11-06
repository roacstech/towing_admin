import React, { Suspense } from "react";
import { CustomerDetailView } from "./CustomerDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center text-xs font-normal text-slate-400">
          Loading customer profile...
        </div>
      }
    >
      <CustomerDetailView id={resolvedParams.id} />
    </Suspense>
  );
}

