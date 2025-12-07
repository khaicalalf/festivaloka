import { apiClient } from "./client";
import type { QueueItem } from "../types";

export async function getQueueDashboard(
  tenantId: number | string
): Promise<QueueItem[]> {
  return apiClient.request(`/api/queues/dashboard/${tenantId}`);
}

export async function updateQueueStatus(
  queueId: number,
  status: "CALLED" | "WAITING" | "DONE"
) {
  return apiClient.request(`/api/queues/${queueId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
