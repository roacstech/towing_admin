import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { TowStatus } from "@/lib/constants";
import { TowRequest, TowFilterOptions } from "@/types/tow";
import { PaginatedResult, PaginationParams } from "@/types";

export const towsService = {
  async getTows(
    params?: PaginationParams & TowFilterOptions
  ): Promise<PaginatedResult<TowRequest>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status && params.status !== "all") {
      searchParams.set("status", params.status);
    }
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    const url = `${API_ENDPOINTS.tows.list}${query ? `?${query}` : ""}`;

    return apiClient<PaginatedResult<TowRequest>>(url);
  },

  async getTowById(id: string): Promise<TowRequest> {
    return apiClient<TowRequest>(API_ENDPOINTS.tows.detail(id));
  },

  async updateStatus(id: string, status: TowStatus): Promise<TowRequest> {
    return apiClient<TowRequest>(API_ENDPOINTS.tows.updateStatus(id), {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async assignDriver(id: string, driverId: string): Promise<TowRequest> {
    return apiClient<TowRequest>(API_ENDPOINTS.tows.assignDriver(id), {
      method: "POST",
      body: JSON.stringify({ driverId }),
    });
  },
};

