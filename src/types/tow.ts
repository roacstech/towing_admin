import { TowStatus } from "@/lib/constants";
import { Coordinates } from "./index";

export interface TowVehicleInfo {
  make: string;
  model: string;
  year?: number;
  licensePlate: string;
  color?: string;
  imageUrl?: string;
}

export interface TowRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  status: TowStatus;
  pickupLocation: Coordinates;
  dropoffLocation: Coordinates;
  distanceKm: number;
  vehicle: TowVehicleInfo;
  serviceType: "standard" | "flatbed" | "heavy_duty" | "motorcycle";
  fare: {
    baseFare: number;
    distanceFare: number;
    total: number;
    currency: string;
    paid: boolean;
    paymentMethod?: "card" | "cash" | "wallet";
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TowFilterOptions {
  status?: TowStatus | "all";
  serviceType?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

