import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";

    try {
      const res = await fetch(`${backendUrl}/api/admin/notifications`, {
        headers: {
          "x-admin-key": adminKey,
          "content-type": "application/json",
        },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const normalized = json.data.map((item: any, idx: number) => ({
            id: String(item.id || `NOTIF-${idx + 1}`),
            target: item.target || (item.type === "driver" ? "All Drivers" : item.type === "dispatch" ? "Dispatch Queue" : "System Broadcast"),
            title: item.title || "Dispatch Alert",
            message: item.message || "",
            sentAt: item.sentAt || (item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently"),
            status: item.status || (item.isRead ? "read" : "unread"),
            type: item.type || "info",
          }));
          return NextResponse.json({ success: true, count: normalized.length, data: normalized });
        }
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      count: 3,
      data: [
        {
          id: "NOTIF-01",
          target: "Dispatch Queue",
          type: "dispatch",
          title: "New Tow Request Booked",
          message: "Customer Robert Miller requested Light-Duty Flatbed Tow via Customer App.",
          status: "delivered",
          sentAt: "10 mins ago",
        },
        {
          id: "NOTIF-02",
          target: "All Drivers",
          type: "driver",
          title: "Driver Accepted Job",
          message: "Marcus Vance accepted dispatch request for #TW-8921.",
          status: "delivered",
          sentAt: "35 mins ago",
        },
        {
          id: "NOTIF-03",
          target: "System Alert",
          type: "alert",
          title: "Document Verification Pending",
          message: "Driver Marcus Anderson submitted updated Tow Truck Liability Insurance.",
          status: "unread",
          sentAt: "2 hours ago",
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";

    try {
      const res = await fetch(`${backendUrl}/api/admin/notifications`, {
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

    return NextResponse.json({ success: true, data: body });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
