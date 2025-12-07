import { apiClient } from "./client";
import type { MenuItem } from "../types";

export async function createMenu(
  tenantId: string | number,
  data: { name: string; description: string; price: number; imageUrl?: string }
): Promise<{
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  isAvailable: boolean;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
}> {
  // Ambil token dari localStorage
  const raw = localStorage.getItem("admin_auth");
  const adminData = raw ? JSON.parse(raw) : null;
  const token = adminData?.access_token;

  if (!token) throw new Error("Access token tidak ditemukan.");
  return apiClient.request(`/api/tenants/${tenantId}/menus`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateMenu(id: string, data: Partial<MenuItem>) {
  const raw = localStorage.getItem("admin_auth");
  const adminData = raw ? JSON.parse(raw) : null;
  const token = adminData?.access_token;

  if (!token) throw new Error("Access token tidak ditemukan.");
  return apiClient.request<MenuItem>(`/api/tenants/menus/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function deleteMenuApi(id: string | number) {
  const raw = localStorage.getItem("admin_auth");
  const adminData = raw ? JSON.parse(raw) : null;
  const token = adminData?.access_token;

  if (!token) throw new Error("Access token tidak ditemukan.");
  return apiClient.request(`/api/tenants/menus/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}
