import { DriverStatus } from "@/lib/constants";
import { Coordinates } from "./index";

export interface DriverVerification {
  isVerified: boolean;
  licenseNumber: string;
  licenseExpiry?: string;
  insuranceNumber?: string;
  idCardUrl?: string;
  licenseUrl?: string;
}

export interface DriverTowTruck {
  id: string;
  model: string;
  licensePlate: string;
  truckType: "flatbed" | "wheel_lift" | "hook_and_chain" | "heavy_duty";
  capacityTons: number;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  status: DriverStatus;
  currentLocation?: Coordinates;
  verification: DriverVerification;
  truck?: DriverTowTruck;
  rating: number;
  totalTrips: number;
  earnings: {
    total: number;
    pendingPayout: number;
  };
  createdAt: string;
}

