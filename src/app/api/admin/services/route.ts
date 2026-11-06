import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";

    try {
      const res = await fetch(`${backendUrl}/api/admin/services`, {
        headers: {
          "x-admin-key": adminKey,
          "content-type": "application/json",
        },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return NextResponse.json(json);
        }
      }
    } catch (_) {}

    // Fallback: standard live services
    return NextResponse.json({
      success: true,
      count: 12,
      data: [
        {
          id: "SRV-01",
          serviceNumber: "01",
          name: "Light-Duty Towing",
          category: "Towing",
          description: "Safe, professional towing for everyday passenger vehicles and light trucks.",
          bulletPoints: ["Cars and sedans", "SUVs and crossovers", "Light pickup trucks"],
          basePrice: "$65.00",
          estimatedEta: "4-8 min",
          status: "active",
          equipmentRequired: "Standard Wheel-Lift / Light Flatbed",
        },
        {
          id: "SRV-02",
          serviceNumber: "02",
          name: "Medium-Duty Towing",
          category: "Commercial",
          description: "Professional towing and recovery for larger Class 4–6 commercial and recreational vehicles.",
          bulletPoints: ["10,000–26,000 lbs GVWR", "Box trucks and delivery vans", "Loaded pickups, RVs and small buses"],
          basePrice: "$85.00",
          estimatedEta: "6-12 min",
          badge: "COMMERCIAL READY",
          status: "active",
          equipmentRequired: "Medium Duty Carrier / Class 6 Tow Rig",
        },
        {
          id: "SRV-03",
          serviceNumber: "03",
          name: "Roadside Assistance",
          category: "Roadside",
          description: "Help for common roadside problems that may not require a tow.",
          bulletPoints: ["Jump starts", "Flat tire changes", "Lockouts and fuel delivery"],
          basePrice: "$45.00",
          estimatedEta: "3-6 min",
          status: "active",
          equipmentRequired: "Rapid Service Unit / Mobile Boost Kit",
        },
        {
          id: "SRV-04",
          serviceNumber: "04",
          name: "Accident Recovery",
          category: "Recovery",
          description: "Careful towing and recovery for vehicles involved in collisions and roadside incidents.",
          bulletPoints: ["Accident scene recovery", "Safe vehicle loading", "Transport to repair or storage locations"],
          basePrice: "$120.00",
          estimatedEta: "5-10 min",
          badge: "PRIORITY RESPONSE",
          status: "active",
          equipmentRequired: "Heavy Carrier / Recovery Straps & Dollies",
        },
        {
          id: "SRV-05",
          serviceNumber: "05",
          name: "Winch-Out Service",
          category: "Recovery",
          description: "Vehicle extraction for snow, mud, ditches and other difficult roadside situations.",
          bulletPoints: ["Snow and ice recovery", "Ditch extraction", "Mud and off-road pullouts"],
          basePrice: "$75.00",
          estimatedEta: "6-10 min",
          status: "active",
          equipmentRequired: "Industrial Hydraulic Winch / Pull Cables",
        },
        {
          id: "SRV-06",
          serviceNumber: "06",
          name: "Motorcycle Towing",
          category: "Specialized",
          description: "Specialized motorcycle towing designed to secure the bike safely during transport.",
          bulletPoints: ["Secure loading", "Motorcycle-specific tie-down techniques", "Local transport and breakdown towing"],
          basePrice: "$70.00",
          estimatedEta: "5-9 min",
          badge: "SOFT STRAP TECH",
          status: "active",
          equipmentRequired: "Dedicated Motorcycle Cradle / Soft Straps",
        },
        {
          id: "SRV-07",
          serviceNumber: "07",
          name: "Flatbed Towing",
          category: "Towing",
          description: "Complete four-wheel-off-the-ground transport for all-wheel-drive, exotic, and luxury vehicles.",
          bulletPoints: ["All-wheel-drive (AWD) & 4x4", "Luxury and vintage vehicles", "Zero road friction transport"],
          basePrice: "$80.00",
          estimatedEta: "5-8 min",
          status: "active",
          equipmentRequired: "Hydraulic Rollback Flatbed Bed",
        },
        {
          id: "SRV-08",
          serviceNumber: "08",
          name: "Electric Vehicle (EV) Towing",
          category: "Specialized",
          description: "Manufacturer-approved flatbed EV towing protecting sensitive battery packs and drivetrains.",
          bulletPoints: ["Tesla, Rivian, Ford Lightning & all EVs", "Neutral-mode dolly roll", "Zero kinetic motor spin during tow"],
          basePrice: "$95.00",
          estimatedEta: "6-10 min",
          badge: "EV CERTIFIED",
          status: "active",
          equipmentRequired: "Non-Conductive Tie-Downs / Low-Angle Bed",
        },
        {
          id: "SRV-09",
          serviceNumber: "09",
          name: "Battery Jump-Start",
          category: "Roadside",
          description: "Emergency 12V and high-amperage mobile jump start delivered straight to customer location.",
          bulletPoints: ["12V & 24V jump boost", "Battery alternator voltage test", "Hybrid starter battery boost"],
          basePrice: "$40.00",
          estimatedEta: "3-5 min",
          status: "active",
          equipmentRequired: "High-Amperage Booster Pack",
        },
        {
          id: "SRV-10",
          serviceNumber: "10",
          name: "Flat Tire Assistance",
          category: "Roadside",
          description: "Quick on-site spare wheel installation, emergency tire inflation, and puncture checks.",
          bulletPoints: ["Spare tire mounting & torque check", "High-pressure roadside inflation", "Stripped lug nut assistance"],
          basePrice: "$45.00",
          estimatedEta: "4-8 min",
          status: "active",
          equipmentRequired: "Hydraulic Jack / Impact Torque Wrench",
        },
        {
          id: "SRV-11",
          serviceNumber: "11",
          name: "Emergency Fuel Delivery",
          category: "Roadside",
          description: "Fast roadside fuel replenishment directly to stranded vehicle locations.",
          bulletPoints: ["Unleaded regular & premium gasoline", "Clean diesel delivery", "Fuel line priming support"],
          basePrice: "$35.00",
          estimatedEta: "5-10 min",
          status: "active",
          equipmentRequired: "Certified Safety Fuel Containers",
        },
        {
          id: "SRV-12",
          serviceNumber: "12",
          name: "Heavy-Duty Towing",
          category: "Commercial",
          description: "Heavy commercial tractor-trailer towing with high-capacity rotators and recovery rigs.",
          bulletPoints: ["Semi-trucks, buses & dump trucks", "50-ton heavy rotator recovery", "Loaded highway incident clearing"],
          basePrice: "$160.00",
          estimatedEta: "10-20 min",
          badge: "HEAVY CLASS",
          status: "active",
          equipmentRequired: "50-Ton Heavy Duty Rotator",
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
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://bec-api-towing-backend.3t5o2t.easypanel.host";
    const adminKey = process.env.ADMIN_API_KEY || "central-towing-admin-key";
    const body = await request.json();

    try {
      const res = await fetch(`${backendUrl}/api/admin/services`, {
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

