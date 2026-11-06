import { NextRequest, NextResponse } from "next/server";
import { deleteFromMemory } from "../route";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get("hard") === "true";

    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";

    try {
      await fetch(`${backendUrl}/api/admin/service-rates/${id}?hard=${hard}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey },
      });
    } catch (_) {}

    deleteFromMemory(id);

    return NextResponse.json({
      success: true,
      message: "Service rate marked as deleted",
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}

