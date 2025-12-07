import { apiClient } from "./client";
import type { Tenant } from "../types";

export async function fetchTenants(): Promise<Tenant[]> {
  return apiClient.request<Tenant[]>("/api/tenants");
}

export async function getTenantsByAI(ref: string | null): Promise<Tenant[]> {
  const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  return apiClient.request<Tenant[]>(`/api/kolosal-ai/tenantsByAI${query}`, {
    method: "GET",
  });
}

export async function postTenant(payload: {
  name: string;
  category: string;
  description: string;
  address: string;
  imageUrl?: string;
}): Promise<{
  id: number;
  name: string;
  category: string;
  description: string;
  address: string;
  imageUrl?: string;
  isViral: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}> {
  // Ambil token dari localStorage
  const raw = localStorage.getItem("admin_auth");
  const adminData = raw ? JSON.parse(raw) : null;
  const token = adminData?.access_token;

  if (!token) throw new Error("Access token tidak ditemukan.");

  return apiClient.request(`/api/tenants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
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
