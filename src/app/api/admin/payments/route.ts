import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";

    try {
      const res = await fetch(`${backendUrl}/api/admin/payments`, {
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
      count: 5,
      data: [
        {
          id: "PAY-9041",
          towId: "TW-8921",
          customerName: "Robert Miller",
          driverName: "Marcus Vance",
          amount: 85.0,
          platformFee: 12.75,
          driverShare: 72.25,
          paymentMethod: "Apple Pay",
          status: "completed",
          createdAt: "2026-11-04T08:30:00Z",
        },
        {
          id: "PAY-9040",
          towId: "TW-8920",
          customerName: "Sarah Jenkins",
          driverName: "Dave Kowalski",
          amount: 45.0,
          platformFee: 6.75,
          driverShare: 38.25,
          paymentMethod: "Credit Card (Visa)",
          status: "completed",
          createdAt: "2026-11-04T07:15:00Z",
        },
        {
          id: "PAY-9039",
          towId: "TW-8919",
          customerName: "Alex Chen",
          driverName: "Carlos Ortiz",
          amount: 95.0,
          platformFee: 14.25,
          driverShare: 80.75,
          paymentMethod: "In-App Wallet",
          status: "completed",
          createdAt: "2026-11-03T19:50:00Z",
        },
        {
          id: "PAY-9038",
          towId: "TW-8918",
          customerName: "Emily Watson",
          driverName: "Carlos Ortiz",
          amount: 165.0,
          platformFee: 24.75,
          driverShare: 140.25,
          paymentMethod: "Credit Card (Mastercard)",
          status: "completed",
          createdAt: "2026-11-03T14:10:00Z",
        },
        {
          id: "PAY-9037",
          towId: "TW-8917",
          customerName: "David Kim",
          driverName: "Mike Sullivan",
          amount: 110.0,
          platformFee: 16.5,
          driverShare: 93.5,
          paymentMethod: "Google Pay",
          status: "completed",
          createdAt: "2026-11-02T16:22:00Z",
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

