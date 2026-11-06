export const APP_CONFIG = {
  name: "Towing Admin Portal",
  version: "1.0.0",
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://bec-api-towing-backend.3t5o2t.easypanel.host",
};

export const TOW_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  ASSIGNED: "assigned",
  EN_ROUTE: "en_route",
  ARRIVED: "arrived",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type TowStatus = (typeof TOW_STATUS)[keyof typeof TOW_STATUS];

export const DRIVER_STATUS = {
  ONLINE: "online",
  OFFLINE: "offline",
  BUSY: "busy",
  SUSPENDED: "suspended",
} as const;

export type DriverStatus = (typeof DRIVER_STATUS)[keyof typeof DRIVER_STATUS];

export const NAV_ITEMS = [
  {
    title: "Overview",
    href: "/",
    icon: "LayoutDashboard",
  },
  {
    title: "Tow Requests",
    href: "/tows",
    icon: "Truck",
  },
  {
    title: "Live Fleet Tracking",
    href: "/live-map",
    icon: "MapPin",
  },
  {
    title: "Drivers",
    href: "/drivers",
    icon: "Users",
  },
  {
    title: "Customers",
    href: "/customers",
    icon: "UserCheck",
  },
  {
    title: "Vehicles",
    href: "/vehicles",
    icon: "Car",
  },
  {
    title: "Pricing & Rates",
    href: "/pricing",
    icon: "DollarSign",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "Settings",
  },
] as const;

