import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { DriverStatus } from "@/lib/constants";
import { Driver } from "@/types/driver";
import { PaginatedResult, PaginationParams } from "@/types";

export const driversService = {
  async getDrivers(
    params?: PaginationParams & { status?: DriverStatus; verified?: boolean }
  ): Promise<PaginatedResult<Driver>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (typeof params?.verified === "boolean") {
      searchParams.set("verified", params.verified.toString());
    }

    const query = searchParams.toString();
    const url = `${API_ENDPOINTS.drivers.list}${query ? `?${query}` : ""}`;

    return apiClient<PaginatedResult<Driver>>(url);
  },

  async getDriverById(id: string): Promise<Driver> {
    return apiClient<Driver>(API_ENDPOINTS.drivers.detail(id));
  },

  async verifyDriver(id: string, approved: boolean): Promise<Driver> {
    return apiClient<Driver>(API_ENDPOINTS.drivers.verify(id), {
      method: "POST",
      body: JSON.stringify({ approved }),
    });
  },

  async updateDriverStatus(id: string, status: DriverStatus): Promise<Driver> {
    return apiClient<Driver>(API_ENDPOINTS.drivers.status(id), {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};

