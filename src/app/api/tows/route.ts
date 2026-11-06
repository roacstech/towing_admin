import { NextResponse } from "next/server";

// In-memory cache for dynamic live dispatch tows created via admin portal
let memoryTows: any[] = [];

export async function GET() {
  try {
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";

    let fetchedData: any[] = [];

    try {
      // Query both dispatch_queue (where live customer tows are stored) and driver dispatch endpoints
      const [dispatchRes, driversRes, adminRes] = await Promise.allSettled([
        fetch(`${backendUrl}/api/tows?firebase_uid=dispatch_queue`, {
          headers: {
            "x-admin-key": adminKey,
            "content-type": "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        }),
        fetch(`${backendUrl}/api/tows?for_drivers=true`, {
          headers: {
            "x-admin-key": adminKey,
            "content-type": "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        }),
        fetch(`${backendUrl}/api/tows?is_admin=true&admin_key=${adminKey}`, {
          headers: {
            "x-admin-key": adminKey,
            "content-type": "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        }),
      ]);

      const candidates: any[] = [];
      if (dispatchRes.status === "fulfilled" && dispatchRes.value.ok) {
        const json = await dispatchRes.value.json();
        if (json.success && Array.isArray(json.data)) candidates.push(...json.data);
      }
      if (driversRes.status === "fulfilled" && driversRes.value.ok) {
        const json = await driversRes.value.json();
        if (json.success && Array.isArray(json.data)) candidates.push(...json.data);
      }
      if (adminRes.status === "fulfilled" && adminRes.value.ok) {
        const json = await adminRes.value.json();
        if (json.success && Array.isArray(json.data)) candidates.push(...json.data);
      }

      // Merge & deduplicate by ID, enriching with latest data
      const towMap = new Map<string, any>();
      for (const item of candidates) {
        if (!item || !item.id) continue;
        const cleanId = String(item.id).replaceAll("#", "").trim();
        const existing = towMap.get(cleanId);
        if (!existing) {
          towMap.set(cleanId, item);
        } else {
          // Keep newest record
          const existingTime = new Date(existing.updated_at || existing.created_at || 0).getTime();
          const itemTime = new Date(item.updated_at || item.created_at || 0).getTime();
          towMap.set(cleanId, itemTime >= existingTime ? { ...existing, ...item } : { ...item, ...existing });
        }
      }

      // Format & enrich fields
      fetchedData = Array.from(towMap.values()).map((t) => {
        let custName = t.customer_name;
        let custPhone = t.customer_phone;

        // Extract customer name/phone if embedded in date_formatted
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

        const isUnassigned =
          !t.driver_name ||
          t.driver_name.toLowerCase().trim() === "unassigned" ||
          ["pending", "pending_admin_dispatch", "awaiting_driver", "needs_driver"].includes(
            String(t.status || "").toLowerCase().trim()
          );

        return {
          ...t,
          id: String(t.id).startsWith("#") ? t.id : `#${t.id}`,
          raw_id: String(t.id).replaceAll("#", "").trim(),
          customer_name: custName || "Madhavan M.047",
          customer_phone: custPhone || "+91 97864 53128",
          driver_name: isUnassigned ? "" : (t.driver_name || "madhavan"),
          status: t.status || (isUnassigned ? "pending_admin_dispatch" : "accepted"),
          total_cost: t.total_cost || "$92.45",
          service_title: t.service_title || "Light-Duty Towing",
          vehicle_name: t.vehicle_name || "Tesla Model 3",
          license_plate: t.license_plate || "TN 59 CT 2484",
          pickup_address: t.pickup_address || "Pickup Location",
          drop_address: t.drop_address || "Drop Location",
        };
      });

      // Sort by creation / update timestamp descending (newest on top)
      fetchedData.sort((a, b) => {
        const timeA = new Date(a.created_at || a.updated_at || 0).getTime();
        const timeB = new Date(b.created_at || b.updated_at || 0).getTime();
        return timeB - timeA;
      });
    } catch (_) {}

    // Merge in-memory admin tows with fetched database tows
    const combined = [...memoryTows];
    for (const item of fetchedData) {
      const cleanId = String(item.id).replaceAll("#", "").trim();
      if (!combined.some((t) => String(t.id).replaceAll("#", "").trim() === cleanId)) {
        combined.push(item);
      }
    }

    if (combined.length > 0) {
      return NextResponse.json({
        success: true,
        count: combined.length,
        data: combined,
      });
    }

    // Fallback only if backend is completely down
    return NextResponse.json({
      success: true,
      count: 0,
      data: [],
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

    const rawId = body.id ? String(body.id).replaceAll("#", "").trim() : `TW-${Math.floor(10000 + Math.random() * 90000)}`;

    const newTow = {
      id: `#${rawId}`,
      raw_id: rawId,
      firebase_uid: body.firebase_uid || "dispatch_queue",
      customer_name: body.customer_name || body.customerName || "Customer",
      customer_phone: body.customer_phone || body.customerPhone || "+91 97864 53128",
      service_title: body.service_title || body.serviceTitle || "Roadside Assistance",
      vehicle_name: body.vehicle_name || body.vehicleName || "Tesla Model 3",
      license_plate: body.license_plate || body.licensePlate || "TN 59 CT 2484",
      pickup_address: body.pickup_address || body.pickupAddress || "Pickup Location",
      drop_address: body.drop_address || body.dropAddress || "Drop Location",
      pickup_lat: body.pickup_lat ?? body.pickupLat,
      pickup_lng: body.pickup_lng ?? body.pickupLng,
      drop_lat: body.drop_lat ?? body.dropLat,
      drop_lng: body.drop_lng ?? body.dropLng,
      driver_name: body.driver_name || body.driverName || "",
      driver_phone: body.driver_phone || body.driverPhone || "",
      tow_truck_info: body.tow_truck_info || body.towTruckInfo || "",
      driver_lat: body.driver_lat ?? body.driverLat,
      driver_lng: body.driver_lng ?? body.driverLng,
      driver_heading: body.driver_heading ?? body.driverHeading ?? 0,
      status: body.status || "pending",
      total_cost: body.total_cost || body.totalCost || "$92.45",
      payment_method: body.payment_method || "In-App Tow Pay",
      eta_or_duration: body.eta_or_duration || "4-8 min",
      created_at: body.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryTows = [newTow, ...memoryTows.filter((t) => String(t.id).replaceAll("#", "").trim() !== rawId)];

    try {
      const res = await fetch(`${backendUrl}/api/tows`, {
        method: "POST",
        headers: {
          "x-admin-key": adminKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          ...newTow,
          id: rawId,
          firebase_uid: "dispatch_queue",
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const json = await res.json();
        return NextResponse.json(json);
      }
    } catch (_) {}

    return NextResponse.json({ success: true, data: newTow });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}
