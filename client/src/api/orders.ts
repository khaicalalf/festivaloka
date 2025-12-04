import type { OrderResult } from "../types";
import { apiClient } from "./client";

export async function fetchOrderResult(id: string): Promise<OrderResult> {
  return apiClient.request(`/api/orders/result/${id}`);
}
