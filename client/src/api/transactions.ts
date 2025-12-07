import { apiClient } from "./client";
import type {
  CartItem,
  TransactionDetail,
  CreateTransactionPayload,
  CreateTransactionResponse,
} from "../types";

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
    name: c.menuItem.name,
    price: c.menuItem.price,
    qty: c.quantity,
  }));
}
