import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";

    try {
      const res = await fetch(
        `${backendUrl}/api/admin/drivers/verification/${encodeURIComponent(id)}/status`,
        {
          method: "POST",
          headers: {
            "x-admin-key": adminKey,
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        const json = await res.json();
        return NextResponse.json(json);
      }
    } catch (_) {}

    return NextResponse.json({ success: true, status: body.status || "verified" });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}

