import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { fetchOrderResult } from "../api/orders";
import type { OrderResult } from "../types";

export function TransactionResultPage() {
  const { id: pathId } = useParams<{ id: string }>();
  const location = useLocation();

  const [order, setOrder] = useState<OrderResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getOrderId = () => {
    const params = new URLSearchParams(location.search);
    const queryId = params.get("order_id");

    if (pathId) return pathId;
    if (queryId) return queryId;

    return null;
  };

  const finalOrderId = getOrderId();

  const loadOrder = useCallback(async () => {
    if (!finalOrderId) {
      setError("ID transaksi tidak ditemukan.");
      setLoading(false);
      return;
    }

    try {
      const data = await fetchOrderResult(finalOrderId);
      setOrder(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat transaksi.");
    } finally {
      setLoading(false);
    }
  }, [finalOrderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Auto refresh for pending orders
  useEffect(() => {
    if (!order) return;

    const pending =
      order.status === "PENDING" ||
      order.queueStatus === "WAITING" ||
      order.queueStatus === "PROCESSING";

    if (!pending) return;

    const t = setTimeout(() => loadOrder(), 2000);
    return () => clearTimeout(t);
  }, [order, loadOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FF385C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Memuat transaksi...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900">
            Transaksi Tidak Ditemukan
          </h1>
          <p className="text-gray-600">{error}</p>
          <Link
            to="/"
            className="
              inline-flex items-center gap-2
              bg-[#FF385C] text-white px-6 py-3 rounded-lg font-semibold
              shadow-lg hover:bg-[#E31C5F] hover:shadow-xl
              transition-all transform hover:-translate-y-0.5
            "
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PAID":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-700",
          icon: (
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
      case "PENDING":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-700",
          icon: (
            <svg
              className="w-12 h-12"
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
          ),
        };
      case "FAILED":
      case "CANCEL":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-700",
          icon: (
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-700",
          icon: null,
        };
    }
  };

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ringkasan Transaksi
          </h1>
          <p className="text-gray-600">Detail pesanan Anda</p>
        </div>

        {/* Status Card */}
        <div
          className={`rounded-2xl border-2 ${statusConfig.border} ${statusConfig.bg} p-6 text-center`}
        >
          <div className={`${statusConfig.text} mb-3 flex justify-center`}>
            {statusConfig.icon}
          </div>
          <h2 className={`text-xl font-bold ${statusConfig.text} mb-2`}>
            Status Pembayaran
          </h2>
          <p className={`text-lg font-semibold ${statusConfig.text}`}>
            {order.status}
          </p>
          {order.status === "PENDING" && (
            <p className="text-sm mt-2 opacity-80 animate-pulse">
              Menunggu konfirmasi pembayaran...
            </p>
          )}
        </div>

        {/* Queue Number */}
        {order.queueNumber && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg
                className="w-6 h-6 text-gray-700"
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
              <h3 className="text-lg font-bold text-gray-900">Nomor Antrian</h3>
            </div>
            <p className="text-5xl font-bold text-[#FF385C] mb-2">
              #{order.queueNumber}
            </p>
            <p className="text-sm text-gray-600">
              Status: <span className="font-semibold">{order.queueStatus}</span>
            </p>
          </div>
        )}

        {/* Tenant Info */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-gray-700 flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {order.tenant.name}
              </h3>
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
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5"
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
            Detail Pesanan
          </h3>

          <div className="space-y-3 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <p className="text-gray-700">
                  {item.name}{" "}
                  <span className="text-gray-500">× {item.qty}</span>
                </p>
                <p className="font-semibold text-gray-900">
                  Rp {(item.price * item.qty).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <p className="text-lg font-bold text-gray-900">Total</p>
              <p className="text-2xl font-bold text-[#FF385C]">
                Rp {order.totalAmount.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <Link
          to="/"
          className="
            block text-center
            bg-[#FF385C] text-white px-6 py-4 rounded-xl font-semibold
            shadow-lg hover:bg-[#E31C5F] hover:shadow-xl
            transition-all transform hover:-translate-y-0.5
            flex items-center justify-center gap-2
          "
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
