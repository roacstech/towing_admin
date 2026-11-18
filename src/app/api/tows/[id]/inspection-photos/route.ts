import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "inspection_photos.json");

function loadStoredInspectionPhotos(): Record<string, any> {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return {};
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}

function saveInspectionPhotos(data: Record<string, any>) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (_) {}
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).replaceAll("#", "").trim();
    const stored = loadStoredInspectionPhotos();
    const record = stored[cleanId] || null;

    return NextResponse.json({
      success: true,
      job_id: cleanId,
      data: record,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).replaceAll("#", "").trim();
    const body = await request.json();

    const stored = loadStoredInspectionPhotos();
    const existing = stored[cleanId] || {};

    const updated = {
      ...existing,
      job_id: cleanId,
      inspection_photos: {
        ...(existing.inspection_photos || {}),
        ...(body.inspection_photos || {}),
      },
      uploaded_at: body.uploaded_at || new Date().toISOString(),
      is_complete: Boolean(
        body.is_complete ??
          (body.inspection_photos?.front &&
            body.inspection_photos?.back &&
            body.inspection_photos?.left &&
            body.inspection_photos?.right)
      ),
    };

    stored[cleanId] = updated;
    saveInspectionPhotos(stored);

    // Also persist to Cloud Backend PostgreSQL vehicles table so it is accessible everywhere
    try {
      const backendUrl =
        process.env.API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "https://bec-api-towing-backend.3t5o2t.easypanel.host";
      const photos = updated.inspection_photos || {};
      await fetch(`${backendUrl}/api/vehicles`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firebase_uid: `INSP_${cleanId}`,
          make: "Pre-Tow Inspection",
          model: cleanId,
          year: 2026,
          license_plate: cleanId,
          photo_url: photos.front || "",
          plate_image_url: photos.back || photos.rear || "",
          asset_path: photos.left || "",
          nickname: photos.right || "",
        }),
        signal: AbortSignal.timeout(3500),
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: "Inspection photos saved successfully",
      data: updated,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
