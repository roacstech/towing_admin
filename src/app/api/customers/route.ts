import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";

    const res = await fetch(`${backendUrl}/api/users`, {
      method: "GET",
      headers: {
        "x-admin-key": adminKey,
        "content-type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { success: false, error: errText },
        { status: res.status }
      );
    }

    const json = await res.json();
    const allUsers = json.data || [];

    // Filter strictly for users whose role is customer
    const customerUsers = allUsers.filter(
      (u: { role?: string }) => (u.role || "").toLowerCase() === "customer"
    );

    return NextResponse.json({
      success: true,
      count: customerUsers.length,
      data: customerUsers,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch customers";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

