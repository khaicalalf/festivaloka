import { apiClient } from "./client";
import type { LoginResponse } from "../types";

export async function loginAdmin(email: string, password: string) {
  return apiClient.request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export type RegisterAdminPayload = {
  email: string;
  password: string;
  role: "TENANT_ADMIN" | "karyawan";
  tenantId: number | null;
};

export async function registerAdmin(payload: RegisterAdminPayload) {
  return apiClient.request<LoginResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
