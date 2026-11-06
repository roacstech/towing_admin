import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Customer } from "@/types/customer";
import { PaginatedResult, PaginationParams } from "@/types";

export const customersService = {
  async getCustomers(
    params?: PaginationParams
  ): Promise<PaginatedResult<Customer>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    const url = `${API_ENDPOINTS.users.list}${query ? `?${query}` : ""}`;

    return apiClient<PaginatedResult<Customer>>(url);
  },

  async getCustomerById(id: string): Promise<Customer> {
    return apiClient<Customer>(API_ENDPOINTS.users.detail(id));
  },
};

