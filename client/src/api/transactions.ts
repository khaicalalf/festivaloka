import { apiClient } from "./client";
import type { CartItem, FoodPreference, TransactionDetail } from "../types";

type CreateTransactionPayload = {
  tenantId: string;
  items: { menuItemId: string; quantity: number }[];
  email?: string;
  phone?: string;
  preferences: FoodPreference;
};

type CreateTransactionResponse = {
  uuid: string;
  redirectUrl: string; // ke Midtrans
};

export async function createTransaction(
  payload: CreateTransactionPayload
): Promise<CreateTransactionResponse> {
  return apiClient.request<CreateTransactionResponse>("/transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getTransactionDetail(
  uuid: string
): Promise<TransactionDetail> {
  return apiClient.request<TransactionDetail>(`/transactions/${uuid}`);
}

// helper convert cart
export function mapCartToPayloadItems(cart: CartItem[]) {
  return cart.map((c) => ({
    menuItemId: c.menuItem.id,
    quantity: c.quantity,
  }));
}
