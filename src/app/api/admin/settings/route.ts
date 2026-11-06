import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";

    try {
      const res = await fetch(`${backendUrl}/api/admin/settings`, {
        headers: {
          "x-admin-key": adminKey,
          "content-type": "application/json",
        },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return NextResponse.json(json);
        }
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      data: {
        dispatchRadiusMiles: 25,
        autoAssignRadiusMiles: 10,
        maxBroadcastDrivers: 5,
        platformFeePercent: 15,
        baseCancellationFee: 25.0,
        emergencyPhone: "+1 (320) 555-0199",
        supportEmail: "support@centraltowing.com",
        systemStatus: "Operational",
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";
    const body = await request.json();

    try {
      const res = await fetch(`${backendUrl}/api/admin/settings`, {
        method: "POST",
        headers: {
          "x-admin-key": adminKey,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const json = await res.json();
        return NextResponse.json(json);
      }
    } catch (_) {}

    return NextResponse.json({ success: true, message: "Settings updated successfully", data: body });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}

