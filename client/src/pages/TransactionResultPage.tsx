import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { fetchOrderResult } from "../api/orders";
import type { OrderResult } from "../types";

export function TransactionResultPage() {
  const { id: pathId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState<OrderResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* CLEAN REDIRECT LOGIC */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryId = params.get("order_id");

    if (!pathId && queryId) {
      navigate(`/transaction/${queryId}`, { replace: true });
      return;
    }

    if (pathId && queryId && pathId !== queryId) {
      navigate(`/transaction/${queryId}`, { replace: true });
      return;
    }

    if (pathId && location.search) {
      navigate(`/transaction/${pathId}`, { replace: true });
    }
  }, [pathId, location, navigate]);

  /* Fetch wrapper */
  const loadOrder = useCallback(async () => {
    if (!pathId) return;
    try {
      const data = await fetchOrderResult(pathId);
      setOrder(data);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError("Gagal memuat detail transaksi.");
    } finally {
      setLoading(false);
    }
  }, [pathId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  /* Auto Refresh Pending */
  useEffect(() => {
    if (!order) return;

    const stillPending =
      order.status === "PENDING" ||
      order.queueStatus === "WAITING" ||
      order.queueStatus === "PROCESSING";

    if (!stillPending) return;

    const t = setTimeout(() => loadOrder(), 2000);
    return () => clearTimeout(t);
  }, [order, loadOrder]);

  /* Loading Skeleton */
  if (loading) {
    return (
      <div className="max-w-lg mx-auto p-6 space-y-6">
        <div className="h-8 w-52 rounded-xl shimmer"></div>
        <div className="h-24 rounded-xl shimmer"></div>
        <div className="h-24 rounded-xl shimmer"></div>
        <div className="h-32 rounded-xl shimmer"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto p-6 space-y-4 animate-fade-in">
        <p className="text-red-600 font-medium text-lg">
          Terjadi kesalahan: {error}
        </p>
        <Link to="/" className="text-blue-600 underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  /* Premium Colors */
  const statusMap = {
    PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
    CANCEL: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6 animate-fade-in premium-container">
      {/* HEADER */}
      <h1 className="text-2xl font-semibold tracking-tight animate-slide-up">
        Ringkasan Transaksi
      </h1>

      {/* PAYMENT STATUS */}

      <div
        className={`rounded-xl border p-5 shadow-sm animate-slide-up ${
          statusMap[order.status]
        }`}
      >
        <p className="font-semibold text-lg flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-current"></span>
          Status Pembayaran
        </p>

        <p className="text-sm mt-1">{order.status}</p>

        {order.status === "PENDING" && (
          <p className="text-xs mt-1 opacity-80 animate-pulse-slow">
            Menunggu konfirmasi pembayaran...
          </p>
        )}
      </div>

      {/* QUEUE STATUS */}
      {order.queueNumber && (
        <div className="rounded-xl border p-5 shadow-sm animate-slide-up">
          <p className="font-semibold text-lg">Nomor Antrian</p>

          <p className="text-4xl font-bold tracking-tight mt-1">
            {order.queueNumber}
          </p>

          <p className="text-sm mt-1 opacity-90">Status: {order.queueStatus}</p>
        </div>
      )}

      {/* TENANT INFO */}
      <div className="rounded-xl border p-5 shadow-inner-sm animate-slide-up bg-white/70 backdrop-blur">
        <p className="font-semibold text-lg">{order.tenant.name}</p>
        {order.tenant.address && (
          <p className="text-sm mt-0.5 opacity-70">{order.tenant.address}</p>
        )}
      </div>

      {/* ORDER ITEMS */}
      <div className="rounded-xl border p-5 shadow-inner-sm animate-slide-up bg-white/70 backdrop-blur">
        <p className="font-semibold text-lg mb-3">Detail Pesanan</p>

        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <p className="opacity-80">
                {item.name} × {item.qty}
              </p>
              <p>Rp{(item.price * item.qty).toLocaleString("id-ID")}</p>
            </div>
          ))}
        </div>

        <hr className="my-3" />

        <p className="font-semibold text-right text-xl">
          Rp{order.totalAmount.toLocaleString("id-ID")}
        </p>
      </div>

      {/* BACK BUTTON */}
      <Link
        to="/"
        className="block text-center bg-black text-white py-3 rounded-xl shadow-md hover:bg-neutral-900 transition-all duration-200 animate-slide-up"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
