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
    // Auto refresh dashboard queues every 5 seconds for a dynamic live experience
    const interval = setInterval(() => loadData(), 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleCall = async (queueId: number) => {
    setProcessingId(queueId);
    try {
      await updateQueueStatus(queueId, "CALLED");
      await loadData();
    } catch (e) {
      console.error(e);
      alert("Gagal memanggil antrean.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-5">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          Antrean Order Live Stan
        </h3>
        <button 
          onClick={loadData}
          className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300"
        >
          🔄 Refresh
        </button>
      </div>

      {loading && queues.length === 0 ? (
        <p className="text-sm text-slate-500 animate-pulse text-center py-6">Memuat antrean aktif...</p>
      ) : queues.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl bg-slate-950/30">
          <p className="text-4xl mb-2">🧑‍🍳</p>
          <h4 className="text-xs font-bold text-slate-400">Belum Ada Antrean Masuk</h4>
          <p className="text-[10px] text-slate-650 mt-0.5">Transaksi pelanggan baru akan otomatis muncul di sini</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {queues.map((q) => (
            <div
              key={q.id}
              className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl space-y-3 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-200">
                    Antrian: <span className="text-rose-500 font-mono text-base font-black">#{q.number}</span>
                  </p>
                  <p className="text-[10px] text-slate-550 font-mono mt-0.5">ID: {q.orderId}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${
                    q.status === "WAITING"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                  }`}
                >
                  {q.status === "WAITING" ? "Antre Masak" : "Sudah Dipanggil"}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-1.5 text-xs text-slate-400 border-t border-b border-slate-900 py-3">
                {q.order.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>
                      {item.name} <span className="text-slate-600 font-mono text-[10px]">x {item.qty}</span>
                    </span>
                    <span className="font-mono text-slate-300">Rp {(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Footer Total */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-500">Total Transaksi:</p>
                  <p className="text-sm font-bold text-emerald-400 font-mono">
                    Rp {q.order.totalAmount.toLocaleString("id-ID")}
                  </p>
                </div>
                
                {/* Actions */}
                {q.status === "WAITING" ? (
                  <button
                    onClick={() => handleCall(q.id)}
                    disabled={processingId === q.id}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-950/20"
                  >
                    {processingId === q.id ? "Memproses..." : "Panggil Pelanggan"}
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500 italic">Antrean Siap Diambil</span>
                )}
              </div>

              {/* Customer Contact */}
              <div className="text-[10px] text-slate-600 pt-1">
                Pelanggan: {q.order.customer.email} {q.order.customer.phone && `(${q.order.customer.phone})`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
