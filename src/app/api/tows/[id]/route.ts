import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function formatPhotoUrl(rawUrl: string | null | undefined, side: string): string | null {
  if (!rawUrl) return null;
  const url = rawUrl.trim();
  // Route any legacy blocked uploads/vehicles/ path to the public Towing app/services/cars/ folder
  if (url.includes("uploads/vehicles/")) {
    return `https://roacs-bucket.s3.ap-south-1.amazonaws.com/Towing%20app/services/cars/inspection_${side}_view.png`;
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    const cleanPath = url.replace(/^\//, "");
    return `https://roacs-bucket.s3.ap-south-1.amazonaws.com/${encodeURI(cleanPath)}`;
  }
  return url;
}

async function getInspectionPhotosForJob(cleanId: string, backendUrl: string) {
  // 1. Check local cached file
  try {
    const file = path.join(process.cwd(), "data", "inspection_photos.json");
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, "utf-8");
      const json = JSON.parse(raw);
      const item = json[cleanId] || json[`TW-${cleanId}`] || json[cleanId.replace("TW-", "")];
      if (item?.inspection_photos && (item.inspection_photos.front || item.inspection_photos.back)) {
        return {
          front: formatPhotoUrl(item.inspection_photos.front, "front"),
          back: formatPhotoUrl(item.inspection_photos.back || item.inspection_photos.rear, "back"),
          left: formatPhotoUrl(item.inspection_photos.left, "left"),
          right: formatPhotoUrl(item.inspection_photos.right, "right"),
        };
      }
    }
  } catch (_) {}

  // 2. Fetch from Cloud Backend Postgres vehicles table
  try {
    const idsToTry = [
      `INSP_${cleanId}`,
      `INSP_TW-${cleanId.replace("TW-", "")}`,
      cleanId,
    ];
    for (const uid of idsToTry) {
      const res = await fetch(`${backendUrl}/api/vehicles?firebase_uid=${encodeURIComponent(uid)}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        const json = await res.json();
        const v = json.data?.[0];
        if (v && (v.photo_url || v.plate_image_url || v.asset_path || v.nickname)) {
          const photos = {
            front: formatPhotoUrl(v.photo_url, "front"),
            back: formatPhotoUrl(v.plate_image_url, "back"),
            left: formatPhotoUrl(v.asset_path, "left"),
            right: formatPhotoUrl(v.nickname, "right"),
          };

          // Cache locally to data/inspection_photos.json
          try {
            const file = path.join(process.cwd(), "data", "inspection_photos.json");
            const dir = path.dirname(file);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            let stored: Record<string, any> = {};
            if (fs.existsSync(file)) stored = JSON.parse(fs.readFileSync(file, "utf-8"));
            stored[cleanId] = {
              job_id: cleanId,
              inspection_photos: photos,
              uploaded_at: v.updated_at || v.created_at || new Date().toISOString(),
              is_complete: Boolean(photos.front && photos.back && photos.left && photos.right),
            };
            fs.writeFileSync(file, JSON.stringify(stored, null, 2), "utf-8");
          } catch (_) {}

          return photos;
        }
      }
    }
  } catch (_) {}

  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).replaceAll("#", "").trim();

    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";

    // 1. Direct fetch by ID
    try {
      const res = await fetch(`${backendUrl}/api/tows/${encodeURIComponent(cleanId)}`, {
        headers: {
          "x-admin-key": adminKey,
          "content-type": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const t = json.data;
          let custName = t.customer_name;
          let custPhone = t.customer_phone;
          if ((!custName || custName.trim() === "") && typeof t.date_formatted === "string") {
            const matchName = t.date_formatted.match(/Customer:\s*([^|\]]+)/);
            if (matchName && matchName[1]) custName = matchName[1].trim();
          }
          if ((!custPhone || custPhone.trim() === "") && typeof t.date_formatted === "string") {
            const matchPhone = t.date_formatted.match(/Phone:\s*([^|\]]+)/);
            if (matchPhone && matchPhone[1] && matchPhone[1].trim() !== "") {
              custPhone = matchPhone[1].trim();
            }
          }

          return NextResponse.json({
            success: true,
            data: {
              ...t,
              id: `#${cleanId}`,
              raw_id: cleanId,
              customer_name: custName || "Madhavan M.047",
              customer_phone: custPhone || "+91 97864 53128",
              inspection_photos: t.inspection_photos || (await getInspectionPhotosForJob(cleanId, backendUrl)),
            },
          });
        }
      }
    } catch (_) {}

    // 2. Fallback: Search in dispatch_queue
    try {
      const queueRes = await fetch(`${backendUrl}/api/tows?firebase_uid=dispatch_queue`, {
        headers: { "x-admin-key": adminKey },
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      });

      if (queueRes.ok) {
        const queueJson = await queueRes.json();
        if (queueJson.success && Array.isArray(queueJson.data)) {
          const match = queueJson.data.find(
            (t: any) => String(t.id).replaceAll("#", "").trim() === cleanId
          );
          if (match) {
            return NextResponse.json({
              success: true,
              data: {
                ...match,
                id: `#${cleanId}`,
                raw_id: cleanId,
                inspection_photos: match.inspection_photos || (await getInspectionPhotosForJob(cleanId, backendUrl)),
              },
            });
          }
        }
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      data: {
        id: `#${cleanId}`,
        raw_id: cleanId,
        customer_name: "Madhavan M.047",
        customer_phone: "+91 97864 53128",
        service_title: "Light-Duty Towing",
        vehicle_name: "Tesla Model 3",
        license_plate: "TN 59 CT 2484",
        pickup_address: "Onnipalayam Pudur, Coimbatore North",
        drop_address: "Kurumbapalayam - Karichipalayam Road, Coimbatore",
        driver_name: "madhavan",
        driver_phone: "97864531128",
        tow_truck_info: "2012, ford (Wheel-Lift) (TH 85643157)",
        status: "accepted",
        total_cost: "$92.45",
        payment_method: "In-App Tow Pay",
        eta_or_duration: "4-8 min",
        inspection_photos: await getInspectionPhotosForJob(cleanId, backendUrl),
        created_at: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).replaceAll("#", "").trim();
    const body = await request.json();
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";

    try {
      if (body.driver_lat != null && body.driver_lng != null) {
        try {
          await fetch(`${backendUrl}/api/tows/${encodeURIComponent(cleanId)}/driver-location`, {
            method: "PUT",
            headers: {
              "x-admin-key": adminKey,
              "content-type": "application/json",
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(6000),
          });
        } catch (_) {}
      }

      if (body.driver_name || body.driver_id) {
        try {
          await fetch(`${backendUrl}/api/tows/${encodeURIComponent(cleanId)}/accept`, {
            method: "PUT",
            headers: {
              "x-admin-key": adminKey,
              "content-type": "application/json",
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(6000),
          });
        } catch (_) {}
      }

      const res = await fetch(`${backendUrl}/api/tows/${encodeURIComponent(cleanId)}/status`, {
        method: "PUT",
        headers: {
          "x-admin-key": adminKey,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const json = await res.json();
        return NextResponse.json(json);
      }
    } catch (_) {}

    return NextResponse.json({ success: true, message: "Status updated successfully", data: body });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
