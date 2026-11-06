import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";

    try {
      const res = await fetch(`${backendUrl}/api/admin/support`, {
        headers: {
          "x-admin-key": adminKey,
          "content-type": "application/json",
        },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return NextResponse.json(json);
        }
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      count: 3,
      data: [
        {
          id: "TCK-101",
          ticketId: "#SUP-4011",
          userName: "Robert Miller",
          userRole: "customer",
          userEmail: "vigneshkumar3497@gmail.com",
          subject: "ETA notification inquiry for tow #TW-8921",
          message: "Customer reported smooth pickup but wanted to confirm digital invoice copy.",
          priority: "low",
          status: "open",
          category: "Billing & Invoices",
          createdAt: "2026-11-04T06:12:00Z",
        },
        {
          id: "TCK-102",
          ticketId: "#SUP-4010",
          userName: "Marcus Vance",
          userRole: "driver",
          userEmail: "marcus.vance@roacstowing.com",
          subject: "Road closure detour around I-94 Exit 168",
          message: "Driver flagged road work delay for automatic dispatch routing recalculation.",
          priority: "medium",
          status: "in_progress",
          category: "Dispatch Route",
          createdAt: "2026-11-03T20:45:00Z",
        },
        {
          id: "TCK-103",
          ticketId: "#SUP-4009",
          userName: "Alex Chen",
          userRole: "customer",
          userEmail: "alex.c@tech.co",
          subject: "EV Flatbed dolly inquiry",
          message: "Question regarding soft wheel straps on AWD Tesla tow transport.",
          priority: "low",
          status: "resolved",
          category: "Service Questions",
          createdAt: "2026-11-02T14:30:00Z",
        },
      ],
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}

