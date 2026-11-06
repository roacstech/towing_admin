export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  totalOrders: number;
  totalSpent: number;
  rating?: number;
  registeredVehiclesCount: number;
  createdAt: string;
  status: "active" | "blocked";
}

