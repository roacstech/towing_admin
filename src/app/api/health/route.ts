import { NextResponse } from "next/server";
import { APP_CONFIG } from "@/lib/constants";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: APP_CONFIG.name,
    version: APP_CONFIG.version,
    backendUrl: APP_CONFIG.apiBaseUrl,
    timestamp: new Date().toISOString(),
  });
}

