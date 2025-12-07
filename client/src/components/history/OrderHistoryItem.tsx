// src/components/history/OrderHistoryItem.tsx
import type { OrderHistoryItemType } from "../../hooks/useOrderHistory";

export function OrderHistoryItem({ order }: { order: OrderHistoryItemType }) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{order.id}</p>
          <p className="font-semibold">{order.tenant.name}</p>
          {order.tenant.address && (
            <p className="text-xs text-gray-500">{order.tenant.address}</p>
          )}
        </div>

        <div
          className={`text-xs px-2 py-1 rounded 
               text-green-700"
          `}
        >
          {/* Queue */}
          {order.queueNumber && (
            <p className="text-sm mt-2">
              Nomor Antrian: <b>{order.queueNumber}</b>
            </p>
          )}

          {order.queue?.status && (
            <p className="text-xs text-gray-500">
              Status antrian: {order.queue.status}
            </p>
          )}
        </div>
      </div>

      <div className="mt-2 space-y-1 text-sm">
        {order.items.map((i, idx) => (
          <p key={idx}>
            {i.name} × {i.qty} — Rp{i.price.toLocaleString("id-ID")}
          </p>
        ))}
      </div>

      <div className="flex justify-between items-center mt-3 text-sm">
        <span className="font-medium">
          Total: Rp{order.totalAmount.toLocaleString("id-ID")} |{" "}
          <span
            className={`text-xs px-2 py-1 rounded ${
              order.status === "PAID" ? " text-green-700" : " text-yellow-700"
            }`}
          >
            {order.status}
          </span>
        </span>
        <span className="text-gray-500">
          {new Date(order.createdAt).toLocaleString("id-ID", {
            hour12: false,
          })}
        </span>
      </div>
    </div>
  );
}
