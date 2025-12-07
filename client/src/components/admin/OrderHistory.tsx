import { useEffect, useState, useCallback } from "react";
import { getQueueDashboard, updateQueueStatus } from "../../api/queue";
import type { QueueItem } from "../../types";

export function OrderHistory({ tenantId }: { tenantId: number | string }) {
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getQueueDashboard(tenantId);
      setQueues(data);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCall = async (queueId: number) => {
    setProcessingId(queueId);
    try {
      await updateQueueStatus(queueId, "CALLED");
      await loadData();
    } catch (e) {
      console.error(e);
      alert("Gagal mengupdate status.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 border-b pb-3 mb-4">
        Riwayat Order / Antrian Tenant
      </h3>

      {loading ? (
        <p className="text-gray-500 animate-pulse">Memuat data…</p>
      ) : queues.length === 0 ? (
        <p className="text-gray-500">Belum ada transaksi.</p>
      ) : (
        <div className="space-y-4">
          {queues.map((q) => (
            <div
              key={q.id}
              className="p-4 bg-gray-50 rounded-lg border shadow-sm"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">
                    Antrian: {q.number}
                  </p>
                  <p className="text-xs text-gray-500">Order ID: {q.orderId}</p>
                </div>

                <span
                  className={`px-2 py-1 text-xs rounded-full font-semibold ${
                    q.status === "WAITING"
                      ? "bg-yellow-100 text-yellow-800"
                      : q.status === "CALLED"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {q.status}
                </span>
              </div>

              {/* Items */}
              <div className="mt-3 space-y-1 text-sm text-gray-700">
                {q.order.items.map((item, i) => (
                  <p key={i}>
                    {item.qty}× {item.name} — Rp{item.price.toLocaleString()}
                  </p>
                ))}
              </div>

              {/* Total */}
              <p className="font-semibold text-indigo-600 mt-2">
                Total: Rp{q.order.totalAmount.toLocaleString("id-ID")}
              </p>

              {/* Customer */}
              <p className="text-xs text-gray-500 mt-1">
                Email: {q.order.customer.email}
              </p>

              {/* Action */}
              {q.status === "WAITING" && (
                <button
                  onClick={() => handleCall(q.id)}
                  disabled={processingId === q.id}
                  className="mt-3 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {processingId === q.id ? "Memproses..." : "Panggil"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
