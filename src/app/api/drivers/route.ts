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

      // Find any ACTIVE tow currently assigned and in progress for this driver
      const activeTow = allTows.find((t: any) => {
        const towDriverName = (t.driver_name || "").toLowerCase().trim();
        const towDriverId = String(t.driver_id || "").toLowerCase();
        const matchesDriver =
          (towDriverName && (towDriverName.includes(driverName) || driverName.includes(towDriverName))) ||
          towDriverId === `drv-${d.id}` ||
          towDriverId.includes(String(d.id));

        if (!matchesDriver) return false;
        const s = (t.status || "").toLowerCase().trim();
        return ["accepted", "en_route", "on_scene", "arrived", "towing", "in_progress", "active", "arrived_dropoff"].includes(s);
      });

      // Also find the latest tow for historical stats (completed tows, truck model)
      const latestTow = allTows.find((t: any) => {
        const towDriverName = (t.driver_name || "").toLowerCase().trim();
        const towDriverId = String(t.driver_id || "").toLowerCase();
        return (
          (towDriverName && (towDriverName.includes(driverName) || driverName.includes(towDriverName))) ||
          towDriverId === `drv-${d.id}` ||
          towDriverId.includes(String(d.id))
        );
      });

      const isTowActive = Boolean(activeTow);

      // LIVE DATA: A driver is online if:
      // 1. Manually toggled online by admin via admin portal override, OR
      // 2. Currently has an active live tow job in progress (on_trip), OR
      // 3. Telemetry/presence recently updated by Driver App (heartbeat/session within last 15 minutes)
      const userUpdatedAt = d.updated_at ? new Date(d.updated_at).getTime() : 0;
      const isRecentlyActive = userUpdatedAt > 0 && (now - userUpdatedAt) < 1000 * 60 * 15;

      const hasOverride = driverStatusOverrides.has(d.id);
      const isOnline = hasOverride
        ? driverStatusOverrides.get(d.id)!
        : Boolean(isTowActive || isRecentlyActive);

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
        completed_tows: completedCount > 0 ? completedCount : (d.completed_tows || 0),
        is_online: isOnline,
        online_status: onlineStatus,
        active_tow_id: isTowActive ? activeTow?.id : null,
        active_tow_status: isTowActive ? activeTow?.status : null,
        truck_model: activeTow?.tow_truck_info || latestTow?.tow_truck_info || d.truck_model || "2012, ford (Wheel-Lift)",
        current_lat: isTowActive ? (activeTow?.driver_lat || null) : null,
        current_lng: isTowActive ? (activeTow?.driver_lng || null) : null,
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
