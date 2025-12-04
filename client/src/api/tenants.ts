import { apiClient } from "./client";
import type { Tenant } from "../types";

export async function fetchTenants(): Promise<Tenant[]> {
  return apiClient.request<Tenant[]>("/api/tenants");
}

export async function fetchTenantMenu(tenantId: string): Promise<Tenant> {
  return apiClient.request(`/api/tenants/${tenantId}`);
}

export async function checkoutOrder(payload: {
  email: string;
  phone: string;
  tenantId: number;
  totalAmount: number;
  items: { name: string; price: number; qty: number }[];
}): Promise<{ snapToken: string; orderId: string }> {
  return apiClient.request(`/api/orders/checkout`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
