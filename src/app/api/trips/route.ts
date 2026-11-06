import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";

    try {
      const [dispatchRes, driversRes] = await Promise.allSettled([
        fetch(`${backendUrl}/api/tows?firebase_uid=dispatch_queue`, {
          headers: { "x-admin-key": adminKey },
          cache: "no-store",
          signal: AbortSignal.timeout(4000),
        }),
        fetch(`${backendUrl}/api/tows?for_drivers=true`, {
          headers: { "x-admin-key": adminKey },
          cache: "no-store",
          signal: AbortSignal.timeout(4000),
        }),
      ]);

      const candidates: any[] = [];
      if (dispatchRes.status === "fulfilled" && dispatchRes.value.ok) {
        const json = await dispatchRes.value.json();
        if (json.success && Array.isArray(json.data)) candidates.push(...json.data);
      }
      if (driversRes.status === "fulfilled" && driversRes.value.ok) {
        const json = await driversRes.value.json();
        if (json.success && Array.isArray(json.data)) candidates.push(...json.data);
      }

      const completed = candidates.filter((t: any) => {
        const s = (t.status || "").toLowerCase();
        return s === "completed" || s === "done";
      });

      if (completed.length > 0) {
        // Map to trip format
        const trips = completed.map((t: any, idx: number) => {
          const rawId = String(t.id).replaceAll("#", "").trim();
          return {
            id: `TRIP-${1000 + idx}`,
            towId: `#${rawId}`,
            customerName: t.customer_name || "Madhavan M.047",
            driverName: t.driver_name || "madhavan",
            vehicle: `${t.vehicle_name || "Tesla Model 3"} (${t.license_plate || "TN 59 CT 2484"})`,
            pickup: t.pickup_address || "Onnipalayam Pudur",
            dropoff: t.drop_address || "Kurumbapalayam Road",
            distanceMiles: t.distance_miles || 11.2,
            duration: t.eta_or_duration || "18m",
            fare: t.total_cost || "$92.45",
            completedAt: t.updated_at || t.created_at || new Date().toISOString(),
            status: "completed",
          };
        });

        return NextResponse.json({
          success: true,
          count: trips.length,
          data: trips,
        });
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      count: 0,
      data: [],
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
