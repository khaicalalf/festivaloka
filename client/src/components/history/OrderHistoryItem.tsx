import type { OrderHistoryItemType } from "../../hooks/useOrderHistory";

export function OrderHistoryItem({ order }: { order: OrderHistoryItemType }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200/50";
      case "PENDING":
      case "UNPAID":
        return "bg-amber-500/10 text-amber-600 border-amber-200/50";
      case "WAITING":
        return "bg-orange-500/10 text-orange-600 border-orange-200/50";
      case "CALLED":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-200/50";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const queueStatus = order.queue?.status || order.status;

  return (
    <div className="border border-slate-200/80 rounded-2xl p-5 bg-white hover:border-amber-300 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="font-bold text-slate-800 text-sm truncate">{order.tenant.name}</h3>
            {order.queueNumber && (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black font-mono px-2 py-0.5 rounded-lg shadow-sm">
                #{order.queueNumber}
              </span>
            )}
          </div>
          {order.tenant.address && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <svg
                className="w-3.5 h-3.5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Stand {order.tenant.address}
            </p>
          )}
          <p className="text-[10px] text-slate-450 font-mono mt-1">ID: {order.id}</p>
        </div>

        <div
          className={`text-[10px] px-3 py-1 rounded-xl font-bold uppercase tracking-wider border flex-shrink-0 ${getStatusColor(
            queueStatus
          )}`}
        >
          {queueStatus === "WAITING" ? "Antre" : queueStatus === "CALLED" ? "Dipanggil" : queueStatus}
        </div>
      </div>

      {/* Items */}
      <div className="border-t border-slate-100 pt-3.5 mb-3.5">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          🛒 Rincian Belanja
        </h4>
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center text-xs text-slate-700"
            >
              <span>
                {item.name} <span className="text-slate-450 font-mono text-[10px]">x {item.qty}</span>
              </span>
              <span className="font-bold text-slate-800 font-mono">
                Rp {item.price.toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-3.5 border-t border-slate-100">
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Transaksi</p>
          <p className="text-base font-black text-slate-800 font-mono mt-0.5">
            Rp {order.totalAmount.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 justify-end">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {new Date(order.createdAt).toLocaleString("id-ID", {
              hour12: false,
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
