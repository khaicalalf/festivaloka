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

  /* --------------------------------------------
      Kakek bikin fungsi buat ambil ID yang valid
     -------------------------------------------- */
  const getOrderId = () => {
    const params = new URLSearchParams(location.search);
    const queryId = params.get("order_id");

    // Prioritas: pathId > queryId
    if (pathId) return pathId;
    if (queryId) return queryId;

    return null;
  };

  const finalOrderId = getOrderId();

  /* --------------------------------------------
      Fetch order tanpa redirect
     -------------------------------------------- */
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

  /* --------------------------------------------
      Auto Refresh kalau masih pending
     -------------------------------------------- */
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

  /* --------------------------------------------
      UI STATE
     -------------------------------------------- */

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
        <p className="text-red-600 font-medium text-lg">{error}</p>
        <Link to="/" className="text-blue-600 underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const statusMap = {
    PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
    CANCEL: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold">Ringkasan Transaksi</h1>

      <div
        className={`rounded-xl border p-5 shadow-sm ${statusMap[order.status]}`}
      >
        <p className="font-semibold text-lg">Status Pembayaran</p>
        <p className="text-sm mt-1">{order.status}</p>

        {order.status === "PENDING" && (
          <p className="text-xs mt-1 opacity-80 animate-pulse-slow">
            Menunggu konfirmasi pembayaran...
          </p>
        )}
      </div>

      {/* ANTRIAN */}
      {order.queueNumber && (
        <div className="rounded-xl border p-5 shadow-sm">
          <p className="font-semibold text-lg">Nomor Antrian</p>
          <p className="text-4xl font-bold mt-1">{order.queueNumber}</p>
          <p className="text-sm mt-1">Status: {order.queueStatus}</p>
        </div>
      )}

      {/* TENANT */}
      <div className="rounded-xl border p-5 shadow-sm bg-white/70 backdrop-blur">
        <p className="font-semibold text-lg">{order.tenant.name}</p>
        {order.tenant.address && (
          <p className="text-sm opacity-70">{order.tenant.address}</p>
        )}
      </div>

      {/* ITEMS */}
      <div className="rounded-xl border p-5 shadow-sm bg-white/70 backdrop-blur">
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

      <Link
        to="/"
        className="block text-center bg-black text-white py-3 rounded-xl shadow-md"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
