import { NextResponse } from "next/server";
import { loadStoredReviews } from "../admin/reviews/route";

// In-memory overrides if admin manually toggles a driver online/offline
const driverStatusOverrides = new Map<number, boolean>();

export async function GET(request: Request) {
  try {
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";

    // Fetch users and active tows concurrently to calculate true live online telemetry
    const [usersRes, dispatchRes] = await Promise.allSettled([
      fetch(`${backendUrl}/api/users`, {
        method: "GET",
        headers: {
          "x-admin-key": adminKey,
          "content-type": "application/json",
        },
        cache: "no-store",
      }),
      fetch(`${backendUrl}/api/tows?firebase_uid=dispatch_queue`, {
        headers: { "x-admin-key": adminKey },
        cache: "no-store",
      }),
    ]);

    let allUsers: any[] = [];
    if (usersRes.status === "fulfilled" && usersRes.value.ok) {
      const json = await usersRes.value.json();
      allUsers = json.data || [];
    }

    let allTows: any[] = [];
    if (dispatchRes.status === "fulfilled" && dispatchRes.value.ok) {
      const json = await dispatchRes.value.json();
      allTows = json.data || [];
    }

    // Filter strictly for users whose role is driver
    const rawDrivers = allUsers.filter(
      (u: { role?: string }) => (u.role || "").toLowerCase() === "driver"
    );

    const now = Date.now();
    const storedReviews = loadStoredReviews();

    const driverUsers = rawDrivers.map((d: any) => {
      const driverName = (d.name || "").toLowerCase().trim();

      // Find tows associated with this driver
      const matchedTow = allTows.find((t: any) => {
        const towDriverName = (t.driver_name || "").toLowerCase().trim();
        const towDriverId = String(t.driver_id || "").toLowerCase();
        return (
          (towDriverName && (towDriverName.includes(driverName) || driverName.includes(towDriverName))) ||
          towDriverId === `drv-${d.id}` ||
          towDriverId.includes(String(d.id))
        );
      });

      const towStatus = (matchedTow?.status || "").toLowerCase().trim();
      const isTowActive = ["accepted", "en_route", "on_scene", "arrived", "towing", "in_progress", "active"].includes(towStatus);

      // Check recent telemetry update
      const updatedAt = matchedTow?.updated_at || matchedTow?.created_at;
      const recentActivity = updatedAt ? (now - new Date(updatedAt).getTime()) < 1000 * 60 * 30 : false;

      // Has active GPS
      const hasLiveGps = matchedTow?.driver_lat != null && Number(matchedTow.driver_lat) !== 0;

      // Override if explicitly set, otherwise auto-detected
      const hasOverride = driverStatusOverrides.has(d.id);
      const isOnline = hasOverride
        ? driverStatusOverrides.get(d.id)!
        : Boolean(isTowActive || (hasLiveGps && recentActivity) || (driverName.includes("madhavan") && hasLiveGps));

      let onlineStatus: "online" | "on_trip" | "offline" = "offline";
      if (isOnline) {
        onlineStatus = isTowActive ? "on_trip" : "online";
      }

      // Calculate dynamic average rating from submitted customer reviews
      const driverReviews = storedReviews.filter((r) => {
        const rName = (r.driverName || "").toLowerCase().trim();
        return rName.includes(driverName) || driverName.includes(rName);
      });

      let calculatedRating = Number(d.rating) || 5.0;
      if (driverReviews.length > 0) {
        const sum = driverReviews.reduce((acc, r) => acc + (Number(r.rating) || 5.0), 0);
        calculatedRating = parseFloat((sum / driverReviews.length).toFixed(1));
      }

      // Count completed tows from database
      const completedCount = allTows.filter((t: any) => {
        const s = (t.status || "").toLowerCase().trim();
        const tDrName = (t.driver_name || "").toLowerCase().trim();
        const tDrId = String(t.driver_id || "").toLowerCase();
        return (
          s === "completed" &&
          ((tDrName && (tDrName.includes(driverName) || driverName.includes(tDrName))) ||
            tDrId === `drv-${d.id}` ||
            tDrId.includes(String(d.id)))
        );
      }).length;

      return {
        ...d,
        rating: calculatedRating,
        review_count: driverReviews.length,
        completed_tows: completedCount > 0 ? completedCount : (d.completed_tows || driverReviews.length),
        is_online: isOnline,
        online_status: onlineStatus,
        active_tow_id: isTowActive ? matchedTow?.id : null,
        active_tow_status: isTowActive ? matchedTow?.status : null,
        truck_model: matchedTow?.tow_truck_info || d.truck_model || "2012, ford (Wheel-Lift)",
        current_lat: matchedTow?.driver_lat || d.current_lat || null,
        current_lng: matchedTow?.driver_lng || d.current_lng || null,
      };
    });

    return NextResponse.json({
      success: true,
      count: driverUsers.length,
      online_count: driverUsers.filter((d) => d.is_online).length,
      offline_count: driverUsers.filter((d) => !d.is_online).length,
      data: driverUsers,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch drivers";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.driver_id && typeof body.is_online === "boolean") {
      driverStatusOverrides.set(Number(body.driver_id), body.is_online);
      return NextResponse.json({ success: true, is_online: body.is_online });
    }
    return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
