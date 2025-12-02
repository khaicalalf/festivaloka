import { apiClient } from "./client";
import type { Tenant } from "../types";

export async function fetchTenants(): Promise<Tenant[]> {
  return apiClient.request<Tenant[]>("/api/tenants");
}

export async function fetchTenantMenu(tenantId: string): Promise<Tenant> {
  return apiClient.request(`/api/tenants/${tenantId}`);
}
