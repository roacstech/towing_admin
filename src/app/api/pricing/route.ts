import { NextRequest, NextResponse } from "next/server";

export interface ServiceRateItem {
  id: string;
  name: string;
  category: string;
  chargeTax: boolean;
  preventFuelSurcharges: boolean;
  defaultRate: number;
  lightRate: number;
  mediumRate: number;
  heavyRate: number;
  motorcycleRate: number;
  trailerRate: number;
  tractorRate: number;
  otherRate: number;
  equipmentRate: number;
  containerRate: number;
  materialRate: number;
  freeMiles: number;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// In-memory persistent cache for on-demand towing rates
let memoryRates: ServiceRateItem[] = [
  {
    id: "RATE-01",
    name: "Loaded/Hooked Mileage",
    category: "Mileage",
    chargeTax: false,
    preventFuelSurcharges: false,
    defaultRate: 4.5,
    lightRate: 4.5,
    mediumRate: 6.5,
    heavyRate: 9.5,
    motorcycleRate: 4.0,
    trailerRate: 5.5,
    tractorRate: 11.0,
    otherRate: 5.0,
    equipmentRate: 7.5,
    containerRate: 8.5,
    materialRate: 6.0,
    freeMiles: 5.0,
    isDeleted: false,
  },
  {
    id: "RATE-02",
    name: "Unloaded/Enroute Mileage",
    category: "Mileage",
    chargeTax: false,
    preventFuelSurcharges: false,
    defaultRate: 3.5,
    lightRate: 3.5,
    mediumRate: 5.0,
    heavyRate: 7.5,
    motorcycleRate: 3.0,
    trailerRate: 4.0,
    tractorRate: 8.5,
    otherRate: 4.0,
    equipmentRate: 5.5,
    containerRate: 6.5,
    materialRate: 5.0,
    freeMiles: 10.0,
    isDeleted: false,
  },
  {
    id: "RATE-03",
    name: "Tow Hookup Base Fee",
    category: "Towing",
    chargeTax: true,
    preventFuelSurcharges: false,
    defaultRate: 65.0,
    lightRate: 65.0,
    mediumRate: 95.0,
    heavyRate: 175.0,
    motorcycleRate: 75.0,
    trailerRate: 85.0,
    tractorRate: 220.0,
    otherRate: 70.0,
    equipmentRate: 130.0,
    containerRate: 150.0,
    materialRate: 90.0,
    freeMiles: 0,
    isDeleted: false,
  },
  {
    id: "RATE-04",
    name: "Winch-Out & Off-Road Recovery",
    category: "Recovery",
    chargeTax: true,
    preventFuelSurcharges: false,
    defaultRate: 75.0,
    lightRate: 75.0,
    mediumRate: 120.0,
    heavyRate: 250.0,
    motorcycleRate: 65.0,
    trailerRate: 95.0,
    tractorRate: 300.0,
    otherRate: 80.0,
    equipmentRate: 160.0,
    containerRate: 180.0,
    materialRate: 100.0,
    freeMiles: 0,
    isDeleted: false,
  },
  {
    id: "RATE-05",
    name: "Battery Jump-Start Service",
    category: "Roadside",
    chargeTax: false,
    preventFuelSurcharges: false,
    defaultRate: 45.0,
    lightRate: 45.0,
    mediumRate: 55.0,
    heavyRate: 75.0,
    motorcycleRate: 40.0,
    trailerRate: 0.0,
    tractorRate: 95.0,
    otherRate: 45.0,
    equipmentRate: 60.0,
    containerRate: 0.0,
    materialRate: 0.0,
    freeMiles: 0,
    isDeleted: false,
  },
  {
    id: "RATE-06",
    name: "Flat Tire Change / Spare Installation",
    category: "Roadside",
    chargeTax: false,
    preventFuelSurcharges: false,
    defaultRate: 50.0,
    lightRate: 50.0,
    mediumRate: 65.0,
    heavyRate: 110.0,
    motorcycleRate: 45.0,
    trailerRate: 60.0,
    tractorRate: 130.0,
    otherRate: 50.0,
    equipmentRate: 80.0,
    containerRate: 0.0,
    materialRate: 0.0,
    freeMiles: 0,
    isDeleted: false,
  },
  {
    id: "RATE-07",
    name: "Emergency Fuel Delivery Service",
    category: "Roadside",
    chargeTax: false,
    preventFuelSurcharges: false,
    defaultRate: 40.0,
    lightRate: 40.0,
    mediumRate: 45.0,
    heavyRate: 60.0,
    motorcycleRate: 35.0,
    trailerRate: 0.0,
    tractorRate: 75.0,
    otherRate: 40.0,
    equipmentRate: 50.0,
    containerRate: 0.0,
    materialRate: 0.0,
    freeMiles: 0,
    isDeleted: false,
  },
  {
    id: "RATE-08",
    name: "Vehicle Lockout Service",
    category: "Roadside",
    chargeTax: false,
    preventFuelSurcharges: false,
    defaultRate: 50.0,
    lightRate: 50.0,
    mediumRate: 60.0,
    heavyRate: 80.0,
    motorcycleRate: 0.0,
    trailerRate: 0.0,
    tractorRate: 90.0,
    otherRate: 50.0,
    equipmentRate: 60.0,
    containerRate: 0.0,
    materialRate: 0.0,
    freeMiles: 0,
    isDeleted: false,
  },
  {
    id: "RATE-09",
    name: "After-Hours / Night Emergency Surcharge",
    category: "Surcharge",
    chargeTax: false,
    preventFuelSurcharges: true,
    defaultRate: 35.0,
    lightRate: 35.0,
    mediumRate: 45.0,
    heavyRate: 75.0,
    motorcycleRate: 35.0,
    trailerRate: 40.0,
    tractorRate: 90.0,
    otherRate: 35.0,
    equipmentRate: 50.0,
    containerRate: 50.0,
    materialRate: 35.0,
    freeMiles: 0,
    isDeleted: false,
  },
  {
    id: "RATE-10",
    name: "Dollies & GoJaks Usage Fee",
    category: "Towing",
    chargeTax: false,
    preventFuelSurcharges: false,
    defaultRate: 35.0,
    lightRate: 35.0,
    mediumRate: 45.0,
    heavyRate: 0.0,
    motorcycleRate: 0.0,
    trailerRate: 0.0,
    tractorRate: 0.0,
    otherRate: 35.0,
    equipmentRate: 45.0,
    containerRate: 0.0,
    materialRate: 0.0,
    freeMiles: 0,
    isDeleted: false,
  },
  {
    id: "RATE-11",
    name: "Accident Scene Clearing & Debris Disposal",
    category: "Recovery",
    chargeTax: true,
    preventFuelSurcharges: false,
    defaultRate: 60.0,
    lightRate: 60.0,
    mediumRate: 85.0,
    heavyRate: 150.0,
    motorcycleRate: 50.0,
    trailerRate: 70.0,
    tractorRate: 200.0,
    otherRate: 60.0,
    equipmentRate: 90.0,
    containerRate: 90.0,
    materialRate: 60.0,
    freeMiles: 0,
    isDeleted: false,
  },
  {
    id: "RATE-12",
    name: "GOA (Gone On Arrival) Cancellation Fee",
    category: "Admin",
    chargeTax: false,
    preventFuelSurcharges: true,
    defaultRate: 40.0,
    lightRate: 40.0,
    mediumRate: 50.0,
    heavyRate: 80.0,
    motorcycleRate: 35.0,
    trailerRate: 45.0,
    tractorRate: 100.0,
    otherRate: 40.0,
    equipmentRate: 55.0,
    containerRate: 60.0,
    materialRate: 40.0,
    freeMiles: 0,
    isDeleted: false,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";

    try {
      const res = await fetch(
        `${backendUrl}/api/admin/service-rates?includeDeleted=${includeDeleted}`,
        {
          headers: { "x-admin-key": adminKey },
          cache: "no-store",
          signal: AbortSignal.timeout(2000),
        }
      );

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return NextResponse.json({
            success: true,
            count: json.data.length,
            data: json.data,
          });
        }
      }
    } catch (_) {
      // Backend request fallback to memoryRates
    }

    const filtered = includeDeleted
      ? memoryRates
      : memoryRates.filter((r) => !r.isDeleted);

    return NextResponse.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";

    // Attempt sync with backend
    try {
      const res = await fetch(`${backendUrl}/api/admin/service-rates`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(2000),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          // Update memory cache
          const existingIdx = memoryRates.findIndex((r) => r.id === json.data.id);
          if (existingIdx >= 0) {
            memoryRates[existingIdx] = json.data;
          } else {
            memoryRates.push(json.data);
          }
          return NextResponse.json({ success: true, data: json.data });
        }
      }
    } catch (_) {
      // Backend save failed, handle memory fallback
    }

    const id = body.id || `RATE-${Date.now().toString().slice(-5)}`;
    const savedItem: ServiceRateItem = {
      id,
      name: body.name || "Untitled Service",
      category: body.category || "Towing",
      chargeTax: Boolean(body.chargeTax),
      preventFuelSurcharges: Boolean(body.preventFuelSurcharges),
      defaultRate: Number(body.defaultRate) || 0,
      lightRate: Number(body.lightRate) || 0,
      mediumRate: Number(body.mediumRate) || 0,
      heavyRate: Number(body.heavyRate) || 0,
      motorcycleRate: Number(body.motorcycleRate) || 0,
      trailerRate: Number(body.trailerRate) || 0,
      tractorRate: Number(body.tractorRate) || 0,
      otherRate: Number(body.otherRate) || 0,
      equipmentRate: Number(body.equipmentRate) || 0,
      containerRate: Number(body.containerRate) || 0,
      materialRate: Number(body.materialRate) || 0,
      freeMiles: Number(body.freeMiles) || 0,
      isDeleted: Boolean(body.isDeleted),
      updatedAt: new Date().toISOString(),
    };

    const existingIdx = memoryRates.findIndex((r) => r.id === id);
    if (existingIdx >= 0) {
      memoryRates[existingIdx] = savedItem;
    } else {
      memoryRates.push(savedItem);
    }

    return NextResponse.json({ success: true, data: savedItem });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}

// Global export for internal deletion support
export function deleteFromMemory(id: string) {
  const item = memoryRates.find((r) => r.id === id);
  if (item) {
    item.isDeleted = true;
    item.updatedAt = new Date().toISOString();
  }
}
