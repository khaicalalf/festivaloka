import type { OrderHistoryItemType } from "../../hooks/useOrderHistory";

export function OrderHistoryItem({ order }: { order: OrderHistoryItemType }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700 border-green-200";
      case "PENDING":
      case "UNPAID":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "WAITING":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "CALLED":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const queueStatus = order.queue?.status || order.status;

  return (
    <div className="border-2 border-gray-200 rounded-xl p-5 bg-white hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900">{order.tenant.name}</h3>
            {order.queueNumber && (
              <span className="bg-[#FF385C] text-white text-xs px-2 py-1 rounded-lg font-bold">
                #{order.queueNumber}
              </span>
            )}
          </div>
          {order.tenant.address && (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {order.tenant.address}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">Order ID: {order.id}</p>
        </div>

        <div
          className={`text-xs px-3 py-1.5 rounded-lg font-semibold border ${getStatusColor(
            queueStatus
          )}`}
        >
          {queueStatus}
        </div>
      </div>

      {/* Items */}
      <div className="border-t border-gray-200 pt-3 mb-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Items
        </h4>
        <div className="space-y-1.5">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-gray-700">
                {item.name} <span className="text-gray-500">× {item.qty}</span>
              </span>
              <span className="font-medium text-gray-900">
                Rp {item.price.toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500">Total Pembayaran</p>
          <p className="text-lg font-bold text-gray-900">
            Rp {order.totalAmount.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
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
