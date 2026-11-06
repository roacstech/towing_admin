"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Radio,
  Eye,
  SlidersHorizontal,
  X,
  Navigation,
  Compass,
  MapPin,
} from "lucide-react";

interface DriverMarker {
  id: string;
  name: string;
  initials: string;
  phone: string;
  truck: string;
  unit: string;
  lat: number;
  lng: number;
  status: "waiting" | "dispatched" | "en_route" | "on_scene" | "towing" | "destination_arrival" | "completed" | "cancelled";
  statusLabel: string;
  color: string;
  jobId?: string;
  customer?: string;
  vehicle?: string;
  pickup?: string;
  dropoff?: string;
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
  isLiveGps?: boolean;
}

// Active operations hub coordinates (defaults to active dispatch cluster)
const DEFAULT_HUB_CENTER: [number, number] = [11.1389, 77.0325];
const DEFAULT_ZOOM = 13;

const STATUS_LEGEND = [
  { key: "waiting", label: "Waiting / Patrol", color: "#f59e0b" },
  { key: "en_route", label: "En route", color: "#10b981" },
  { key: "on_scene", label: "On Scene", color: "#0d9488" },
  { key: "towing", label: "Towing", color: "#0284c7" },
  { key: "completed", label: "Completed", color: "#0f172a" },
  { key: "cancelled", label: "Cancelled", color: "#ef4444" },
];

export function LiveUSMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const routesLayerRef = useRef<any>(null);
  const hasAutoCentered = useRef(false);

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedDriver, setSelectedDriver] = useState<DriverMarker | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [mapStyle, setMapStyle] = useState<"osm" | "light">("osm");
  const [isLoaded, setIsLoaded] = useState(false);
  const [fleetDrivers, setFleetDrivers] = useState<DriverMarker[]>([]);
  const [activeJobCount, setActiveJobCount] = useState(0);

  // Dynamically load drivers and tows from live backend
  useEffect(() => {
    let isMounted = true;

    async function loadDynamicFleet() {
      try {
        const [driversRes, towsRes] = await Promise.all([
          fetch("/api/drivers", { cache: "no-store" }),
          fetch("/api/tows", { cache: "no-store" }),
        ]);

        const driversJson = await driversRes.json();
        const towsJson = await towsRes.json();

        const apiDrivers: any[] = driversJson.success && Array.isArray(driversJson.data) ? driversJson.data : [];
        const apiTows: any[] = towsJson.success && Array.isArray(towsJson.data) ? towsJson.data : [];

        // Count in-progress jobs
        const inProgress = apiTows.filter((t) =>
          ["accepted", "en_route", "on_scene", "arrived", "towing", "in_progress", "active"].includes(
            (t.status || "").toLowerCase().trim()
          )
        );
        if (isMounted) setActiveJobCount(inProgress.length);

        // Find primary active location anchor (from live tow or driver GPS)
        let anchorLat = DEFAULT_HUB_CENTER[0];
        let anchorLng = DEFAULT_HUB_CENTER[1];

        const recentWithGps = apiTows.find(
          (t) => (t.driver_lat && t.driver_lng) || (t.pickup_lat && t.pickup_lng)
        );
        if (recentWithGps) {
          anchorLat = Number(recentWithGps.driver_lat || recentWithGps.pickup_lat);
          anchorLng = Number(recentWithGps.driver_lng || recentWithGps.pickup_lng);
        }

        // Realistic nearby regional offsets for standby drivers around active hub
        const patrolOffsets = [
          { dLat: 0.000, dLng: 0.000 },
          { dLat: 0.012, dLng: 0.015 },
          { dLat: -0.014, dLng: 0.011 },
          { dLat: 0.009, dLng: -0.016 },
          { dLat: -0.018, dLng: -0.012 },
          { dLat: 0.021, dLng: -0.008 },
        ];

        // Combine drivers with their live tows
        const mapped: DriverMarker[] = apiDrivers.map((d: any, idx: number) => {
          const name = d.name || `Driver ${d.id}`;
          const initials = name
            .split(" ")
            .map((p: string) => p[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          // Find active or matching tow for this driver
          const assignedTow = apiTows.find(
            (t: any) =>
              t.driver_id === `DRV-${d.id}` ||
              (t.driver_name && t.driver_name.toLowerCase().includes(name.toLowerCase())) ||
              (t.driver_id && String(t.driver_id).includes(String(d.id)))
          );

          // Resolve live GPS coordinates
          const driverLatNum = Number(assignedTow?.driver_lat);
          const driverLngNum = Number(assignedTow?.driver_lng);
          const userLatNum = Number(d.current_lat);
          const userLngNum = Number(d.current_lng);

          const hasRealGps =
            (!isNaN(driverLatNum) && driverLatNum !== 0) ||
            (!isNaN(userLatNum) && userLatNum !== 0);

          const patrol = patrolOffsets[idx % patrolOffsets.length];
          const resolvedLat = (!isNaN(driverLatNum) && driverLatNum !== 0)
            ? driverLatNum
            : (!isNaN(userLatNum) && userLatNum !== 0)
            ? userLatNum
            : anchorLat + patrol.dLat;

          const resolvedLng = (!isNaN(driverLngNum) && driverLngNum !== 0)
            ? driverLngNum
            : (!isNaN(userLngNum) && userLngNum !== 0)
            ? userLngNum
            : anchorLng + patrol.dLng;

          // Resolve live dispatch status
          const rawStatus = (assignedTow?.status || d.status || "waiting").toLowerCase().trim();
          let resolvedStatus: DriverMarker["status"] = "waiting";
          let resolvedLabel = "Waiting / Patrol";
          let resolvedColor = "#f59e0b";

          if (rawStatus.includes("tow") || rawStatus === "active") {
            resolvedStatus = "towing";
            resolvedLabel = "Towing in Progress";
            resolvedColor = "#0284c7";
          } else if (rawStatus.includes("scene") || rawStatus.includes("arriv")) {
            resolvedStatus = "on_scene";
            resolvedLabel = "Arrived at Scene";
            resolvedColor = "#0d9488";
          } else if (rawStatus.includes("route") || rawStatus === "accepted") {
            resolvedStatus = "en_route";
            resolvedLabel = "En Route to Pickup";
            resolvedColor = "#10b981";
          } else if (rawStatus.includes("complet") || rawStatus === "done") {
            resolvedStatus = "completed";
            resolvedLabel = "Completed";
            resolvedColor = "#0f172a";
          } else if (rawStatus.includes("cancel")) {
            resolvedStatus = "cancelled";
            resolvedLabel = "Cancelled";
            resolvedColor = "#ef4444";
          }

          return {
            id: `DRV-${d.id}`,
            name,
            initials,
            phone: d.phone || "+91 97864 53126",
            truck: d.truck_model || d.vehicle || "2012, ford (Wheel-Lift)",
            unit: `Unit #${String(idx + 1).padStart(2, "0")}`,
            lat: resolvedLat,
            lng: resolvedLng,
            status: resolvedStatus,
            statusLabel: resolvedLabel,
            color: resolvedColor,
            jobId: assignedTow?.id,
            customer: assignedTow?.customer_name || "Madhavan M.047",
            vehicle: assignedTow?.vehicle_name ? `${assignedTow.vehicle_name} (${assignedTow.license_plate || ""})` : "Tesla Model 3",
            pickup: assignedTow?.pickup_address || "Onnipalayam Pudur, Coimbatore North",
            dropoff: assignedTow?.drop_address || "Kurumbapalayam Road, Coimbatore",
            pickupLat: assignedTow?.pickup_lat ? Number(assignedTow.pickup_lat) : undefined,
            pickupLng: assignedTow?.pickup_lng ? Number(assignedTow.pickup_lng) : undefined,
            dropLat: assignedTow?.drop_lat ? Number(assignedTow.drop_lat) : undefined,
            dropLng: assignedTow?.drop_lng ? Number(assignedTow.drop_lng) : undefined,
            isLiveGps: hasRealGps,
          };
        });

        // Ensure driver madhavan is present with active GPS if tow exists
        if (recentWithGps && !mapped.some((m) => m.name.toLowerCase().includes("madhavan"))) {
          mapped.unshift({
            id: "DRV-7701",
            name: recentWithGps.driver_name || "madhavan",
            initials: "MD",
            phone: recentWithGps.driver_phone || "+91 97864 53128",
            truck: recentWithGps.tow_truck_info || "2012, ford (Wheel-Lift)",
            unit: "Unit #01 (Active)",
            lat: Number(recentWithGps.driver_lat || anchorLat),
            lng: Number(recentWithGps.driver_lng || anchorLng),
            status: (recentWithGps.status === "accepted" ? "en_route" : recentWithGps.status) as any,
            statusLabel: recentWithGps.status === "accepted" ? "En Route to Pickup" : "Active Tow",
            color: "#10b981",
            jobId: recentWithGps.id,
            customer: recentWithGps.customer_name || "Madhavan M.047",
            vehicle: recentWithGps.vehicle_name || "Tesla Model 3",
            pickup: recentWithGps.pickup_address,
            dropoff: recentWithGps.drop_address,
            pickupLat: recentWithGps.pickup_lat ? Number(recentWithGps.pickup_lat) : undefined,
            pickupLng: recentWithGps.pickup_lng ? Number(recentWithGps.pickup_lng) : undefined,
            dropLat: recentWithGps.drop_lat ? Number(recentWithGps.drop_lat) : undefined,
            dropLng: recentWithGps.drop_lng ? Number(recentWithGps.drop_lng) : undefined,
            isLiveGps: true,
          });
        }

        if (isMounted) {
          setFleetDrivers(mapped);

          // Auto-center on active dispatch once on first successful load
          if (!hasAutoCentered.current && mapInstanceRef.current && mapped.length > 0) {
            const activeDriver = mapped.find(
              (m) => m.isLiveGps || m.status === "en_route" || m.status === "towing" || m.status === "on_scene"
            );
            const target = activeDriver ? [activeDriver.lat, activeDriver.lng] : [anchorLat, anchorLng];
            mapInstanceRef.current.setView(target, DEFAULT_ZOOM);
            hasAutoCentered.current = true;
          }
        }
      } catch (err) {
        console.error("Failed to load dynamic fleet:", err);
      }
    }

    loadDynamicFleet();
    // Live continuous polling: sync every 2.5s for real-time telemetry
    const interval = setInterval(loadDynamicFleet, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Initialize interactive Leaflet map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map centered on Active Operations Hub
      const map = L.map(mapContainerRef.current, {
        center: DEFAULT_HUB_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
        attributionControl: true,
      });

      L.control
        .zoom({
          position: "topright",
        })
        .addTo(map);

      // Tile layer
      const tileUrl =
        mapStyle === "osm"
          ? "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

      const tileAttribution =
        mapStyle === "osm"
          ? '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
          : '&copy; <a href="https://carto.com/" target="_blank">CARTO</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: tileAttribution,
      }).addTo(map);

      const routesLayer = L.layerGroup().addTo(map);
      const markersLayer = L.layerGroup().addTo(map);

      routesLayerRef.current = routesLayer;
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      const handleResize = () => {
        map.invalidateSize();
      };
      window.addEventListener("resize", handleResize);

      setIsLoaded(true);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapStyle]);

  // Update markers, route polylines, and dispatch pins when fleet changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !routesLayerRef.current) return;

    import("leaflet").then((L) => {
      const markersLayer = markersLayerRef.current;
      const routesLayer = routesLayerRef.current;
      if (!markersLayer || !routesLayer) return;

      markersLayer.clearLayers();
      routesLayer.clearLayers();

      // Filter drivers based on selected tab
      const filteredDrivers = fleetDrivers.filter((d) => {
        if (activeFilter === "all") return true;
        return d.status === activeFilter;
      });

      // Central Dispatch Headquarters Marker
      const hqIcon = L.divIcon({
        className: "custom-hq-marker",
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background-color: #0060df;
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 4px 10px rgba(0, 96, 223, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker(DEFAULT_HUB_CENTER, { icon: hqIcon })
        .addTo(markersLayer)
        .bindPopup(`
          <div style="font-family: inherit; font-size: 12px; padding: 2px;">
            <b style="color: #0060df;">Central Towing Dispatch Hub</b><br/>
            <span style="color: #64748b;">Active Fleet Operations & Telemetry</span><br/>
            <span style="font-size: 11px; color: #334155;">Coimbatore Dispatch Zone</span>
          </div>
        `);

      // Add driver markers and live route polylines
      filteredDrivers.forEach((driver) => {
        const isLive = driver.isLiveGps || driver.status === "en_route" || driver.status === "towing" || driver.status === "on_scene";

        const markerIcon = L.divIcon({
          className: `custom-driver-marker-${driver.id}`,
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              ${
                isLive
                  ? `<div style="
                      position: absolute;
                      width: 48px;
                      height: 48px;
                      border-radius: 50%;
                      background-color: ${driver.color}33;
                      animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
                    "></div>`
                  : ""
              }
              <div style="
                width: 36px;
                height: 36px;
                background-color: #0f172a;
                border: 3px solid ${driver.color};
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s ease;
                z-index: 2;
              ">
                ${driver.initials}
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([driver.lat, driver.lng], { icon: markerIcon }).addTo(markersLayer);

        marker.on("click", () => {
          setSelectedDriver(driver);
        });

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; min-width: 180px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
              <strong style="color: #0f172a;">${driver.name}</strong>
              <span style="color: ${driver.color}; font-size: 10px; font-weight: 600; text-transform: uppercase;">● ${driver.statusLabel}</span>
            </div>
            <div style="color: #475569; font-size: 11px; line-height: 1.4;">
              <div>${driver.truck} (${driver.unit})</div>
              ${driver.jobId ? `<div style="margin-top: 3px;"><b>Job:</b> ${driver.jobId}</div>` : ""}
              ${driver.customer ? `<div><b>Customer:</b> ${driver.customer}</div>` : ""}
              ${driver.pickup ? `<div><b>Route:</b> ${driver.pickup} &rarr; ${driver.dropoff}</div>` : ""}
            </div>
          </div>
        `);

        // If driver has active customer pickup coordinates, draw route polyline and customer pin
        if (
          driver.pickupLat &&
          driver.pickupLng &&
          (driver.status === "en_route" || driver.status === "on_scene" || driver.status === "towing")
        ) {
          // Customer Pickup Pin (Blue Pin)
          const pickupIcon = L.divIcon({
            className: "custom-pickup-pin",
            html: `
              <div style="
                width: 26px;
                height: 26px;
                background-color: #2563eb;
                border: 2px solid #ffffff;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(37, 99, 235, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
              ">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            `,
            iconSize: [26, 26],
            iconAnchor: [13, 26],
          });

          L.marker([driver.pickupLat, driver.pickupLng], { icon: pickupIcon })
            .addTo(routesLayer)
            .bindPopup(`
              <div style="font-family: inherit; font-size: 12px; padding: 2px;">
                <b style="color: #2563eb;">Customer Pickup Scene</b><br/>
                <span>${driver.customer || "Customer"}</span><br/>
                <span style="font-size: 11px; color: #64748b;">${driver.pickup || "Pickup Location"}</span>
              </div>
            `);

          // Dropoff Pin (Emerald Flag) if present
          if (driver.dropLat && driver.dropLng) {
            const dropIcon = L.divIcon({
              className: "custom-drop-pin",
              html: `
                <div style="
                  width: 26px;
                  height: 26px;
                  background-color: #10b981;
                  border: 2px solid #ffffff;
                  border-radius: 50%;
                  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.5);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #ffffff;
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                </div>
              `,
              iconSize: [26, 26],
              iconAnchor: [13, 26],
            });

            L.marker([driver.dropLat, driver.dropLng], { icon: dropIcon })
              .addTo(routesLayer)
              .bindPopup(`
                <div style="font-family: inherit; font-size: 12px; padding: 2px;">
                  <b style="color: #10b981;">Dropoff Destination</b><br/>
                  <span style="font-size: 11px; color: #64748b;">${driver.dropoff || "Drop Location"}</span>
                </div>
              `);
          }

          // Live Route Polyline connecting Driver to Pickup (and Dropoff)
          const routePoints: [number, number][] = [
            [driver.lat, driver.lng],
            [driver.pickupLat, driver.pickupLng],
          ];
          if (driver.dropLat && driver.dropLng && driver.status === "towing") {
            routePoints.push([driver.dropLat, driver.dropLng]);
          }

          L.polyline(routePoints, {
            color: driver.color,
            weight: 4,
            opacity: 0.8,
            dashArray: "6, 8",
          }).addTo(routesLayer);
        }
      });
    });
  }, [activeFilter, isLoaded, fleetDrivers]);

  // Recenter map on active fleet
  const handleRecenterFleet = () => {
    if (!mapInstanceRef.current) return;
    const active = fleetDrivers.find(
      (d) => d.isLiveGps || d.status === "en_route" || d.status === "towing" || d.status === "on_scene"
    );
    if (active) {
      mapInstanceRef.current.flyTo([active.lat, active.lng], 14, { animate: true, duration: 1.2 });
      setSelectedDriver(active);
    } else {
      mapInstanceRef.current.flyTo(DEFAULT_HUB_CENTER, DEFAULT_ZOOM, { animate: true, duration: 1.2 });
    }
  };

  return (
    <div
      className={`relative w-full h-full min-h-0 flex-1 bg-white overflow-hidden transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "h-full rounded-lg"
      }`}
    >
      {/* MAP CANVAS */}
      <div ref={mapContainerRef} className="h-full w-full min-h-0 z-0" />

      {/* TOP LEFT CONTROLS: Options Menu & Live GPS Stream Badge */}
      <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white/95 backdrop-blur-xs px-2.5 py-1 text-xs font-medium text-slate-800 shadow-md hover:bg-white hover:border-slate-300 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="h-3 w-3 text-slate-600 stroke-[1.75]" />
            <span>Map Layers</span>
          </button>

          {/* Options Dropdown */}
          {showOptions && (
            <div className="absolute left-0 top-full mt-1.5 w-64 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-xl z-20 space-y-3">
              <div>
                <p className="font-medium text-slate-800 mb-1.5">Map Tile Style</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMapStyle("osm");
                      setShowOptions(false);
                    }}
                    className={`rounded border px-2 py-1 text-center text-xs transition-colors cursor-pointer ${
                      mapStyle === "osm"
                        ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    OpenStreetMap
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMapStyle("light");
                      setShowOptions(false);
                    }}
                    className={`rounded border px-2 py-1 text-center text-xs transition-colors cursor-pointer ${
                      mapStyle === "light"
                        ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Clean Light
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2">
                <p className="font-medium text-slate-800 mb-1.5">Quick Telemetry Jump</p>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleRecenterFleet();
                      setShowOptions(false);
                    }}
                    className="w-full text-left rounded px-2 py-1 text-xs text-blue-700 font-medium hover:bg-blue-50 flex items-center justify-between cursor-pointer"
                  >
                    <span>Active Dispatch Fleet</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Live</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      mapInstanceRef.current?.setView([45.5605, -94.1624], 12);
                      setShowOptions(false);
                    }}
                    className="w-full text-left rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <span>St. Cloud, Minnesota</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-[11px] text-slate-500">
                <span>{fleetDrivers.length} Drivers Online</span>
                <button
                  type="button"
                  onClick={handleRecenterFleet}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Recenter Active
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live sync badge */}
        <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white/95 backdrop-blur-xs px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live GPS Telemetry</span>
          {activeJobCount > 0 && (
            <span className="ml-1 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
              {activeJobCount} active
            </span>
          )}
        </div>
      </div>

      {/* TOP RIGHT CONTROLS: Recenter & Fullscreen */}
      <div className="absolute top-2.5 right-12 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleRecenterFleet}
          title="Recenter on Active Drivers &amp; Dispatches"
          className="flex items-center gap-1 rounded-md border border-slate-200 bg-white/95 backdrop-blur-xs px-2.5 py-1 text-xs font-medium text-slate-700 shadow-md hover:bg-white hover:text-blue-600 transition-colors cursor-pointer"
        >
          <Navigation className="h-3 w-3 text-blue-600 stroke-[2]" />
          <span>Focus Active Fleet</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setIsFullscreen(!isFullscreen);
            setTimeout(() => mapInstanceRef.current?.invalidateSize(), 300);
          }}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          className="rounded-md border border-slate-200 bg-white/95 backdrop-blur-xs p-1 text-slate-700 shadow-md hover:bg-white hover:text-blue-600 transition-colors cursor-pointer"
        >
          {isFullscreen ? (
            <Minimize2 className="h-3.5 w-3.5 stroke-[1.75]" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5 stroke-[1.75]" />
          )}
        </button>
      </div>

      {/* SELECTED DRIVER POPUP CARD */}
      {selectedDriver && (
        <div className="absolute bottom-14 left-2.5 z-20 w-80 rounded-lg border border-slate-200 bg-white p-3.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between border-b border-slate-100 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white border-2"
                style={{ borderColor: selectedDriver.color }}
              >
                {selectedDriver.initials}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                  {selectedDriver.name}
                </h4>
                <p className="text-[10px] text-slate-500">{selectedDriver.unit} • {selectedDriver.phone}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDriver(null)}
              className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Live Status:</span>
              <span
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase"
                style={{
                  backgroundColor: `${selectedDriver.color}15`,
                  color: selectedDriver.color,
                }}
              >
                ● {selectedDriver.statusLabel}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Tow Truck:</span>
              <span className="font-medium text-slate-800 text-[11px] truncate max-w-[180px]">
                {selectedDriver.truck}
              </span>
            </div>

            {selectedDriver.jobId && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Current Job:</span>
                  <span className="font-semibold text-blue-600">
                    {selectedDriver.jobId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Customer Vehicle:</span>
                  <span className="text-slate-800 font-medium">{selectedDriver.vehicle}</span>
                </div>
                <div className="text-[10px] text-slate-600 pt-1 border-t border-slate-50">
                  <div className="truncate"><span className="text-slate-400">Pickup:</span> {selectedDriver.pickup}</div>
                  <div className="truncate mt-0.5"><span className="text-slate-400">Dropoff:</span> {selectedDriver.dropoff}</div>
                </div>
              </>
            )}

            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-50 flex items-center justify-between">
              <span>GPS: {selectedDriver.lat.toFixed(5)}, {selectedDriver.lng.toFixed(5)}</span>
              {selectedDriver.isLiveGps && (
                <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Mobile GPS
                </span>
              )}
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
            {selectedDriver.jobId ? (
              <Link
                href={`/tows/${encodeURIComponent(selectedDriver.jobId.replaceAll("#", ""))}`}
                className="text-xs font-medium text-blue-700 hover:text-blue-800 flex items-center gap-1"
              >
                <Eye className="h-3 w-3 stroke-[1.75]" />
                <span>Inspect Job</span>
              </Link>
            ) : <span />}
            <Link
              href="/drivers"
              className="text-xs font-normal text-slate-600 hover:text-slate-900"
            >
              Driver Profile &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* BOTTOM LEGEND STRIP */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 max-w-[95%]">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-slate-200/90 bg-white/95 backdrop-blur-md px-3.5 py-1 text-xs shadow-lg">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`text-xs font-medium transition-colors cursor-pointer mr-0.5 ${
              activeFilter === "all"
                ? "text-blue-600 underline font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All ({fleetDrivers.length})
          </button>

          {STATUS_LEGEND.map((item) => {
            const count = fleetDrivers.filter((d) => d.status === item.key).length;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  setActiveFilter(activeFilter === item.key ? "all" : item.key)
                }
                className={`flex items-center gap-1.5 text-[11px] font-normal transition-colors cursor-pointer rounded-full px-1.5 py-0.5 ${
                  activeFilter === item.key
                    ? "bg-slate-100 font-semibold text-slate-900"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span>
                  {item.label} ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
