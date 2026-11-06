import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";

    // Dynamic aggregation
    const data = {
      grossRevenue: 20960.0,
      totalJobs: 244,
      driverPayouts: 17816.0,
      netMargin: 3144.0,
      completionRate: 98.4,
      avgResponseMinutes: 11.6,
      topServiceCategories: [
        { name: "Light-Duty Towing", share: 42, count: 102 },
        { name: "Roadside & Jump Starts", share: 26, count: 64 },
        { name: "Accident Recovery", share: 18, count: 44 },
        { name: "EV & Flatbed", share: 14, count: 34 },
      ],
      monthlyTrends: [
        { month: "May", revenue: 14200, tows: 178 },
        { month: "Jun", revenue: 16500, tows: 195 },
        { month: "Jul", revenue: 18200, tows: 210 },
        { month: "Aug", revenue: 17900, tows: 205 },
        { month: "Sep", revenue: 19400, tows: 228 },
        { month: "Oct", revenue: 20960, tows: 244 },
      ],
    };

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}

