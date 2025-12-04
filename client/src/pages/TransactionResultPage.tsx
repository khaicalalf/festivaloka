import { useEffect, useState } from "react";
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

  // STEP 1: Extract ID (path > query)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryId = params.get("order_id");

    // If path ID missing but query ID exists → redirect to clean URL
    if (!pathId && queryId) {
      navigate(`/transaction/${queryId}`, { replace: true });
      return;
    }

    // If path exists but Midtrans appended params (query)
    if (pathId && queryId && pathId !== queryId) {
      navigate(`/transaction/${queryId}`, { replace: true });
      return;
    }

    // If path exists & url has query params → clean it
    if (pathId && location.search) {
      navigate(`/transaction/${pathId}`, { replace: true });
    }
  }, [pathId, location, navigate]);

  // STEP 2: Fetch data (after URL cleaned)
  useEffect(() => {
    if (!pathId) return;

    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const res = await fetchOrderResult(pathId);
        setOrder(res);
      } catch (e: unknown) {
        if (e instanceof Error) setError(e.message);
        else setError("Gagal memuat detail transaksi.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [pathId]);

  // --- Loading UI ---
  if (loading) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <p className="text-gray-500">Sedang memuat transaksi...</p>
      </div>
    );
  }

  // --- Error UI ---
  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto p-6 space-y-3">
        <p className="text-red-600 font-medium">
          Terjadi kesalahan: {error ?? "Tidak ada data"}
        </p>
        <Link to="/" className="underline text-sm">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  // --- STATUS COLORS ---
  const statusColor = {
    PAID: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    FAILED: "bg-red-100 text-red-700",
    CANCEL: "bg-gray-200 text-gray-700",
  }[order.status];

  const queueColor = {
    WAITING: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-yellow-100 text-yellow-800",
    FINISHED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  }[order.queueStatus ?? "WAITING"];

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      {/* --- Title --- */}
      <h1 className="text-xl font-bold">Detail Transaksi</h1>

      {/* --- Payment Status --- */}
      <div className={`p-4 rounded shadow-sm ${statusColor}`}>
        <p className="font-semibold text-lg">Status Pembayaran</p>
        <p className="text-sm">{order.status}</p>
      </div>

      {/* --- Queue Status --- */}
      {order.queueNumber && (
        <div className={`p-4 rounded shadow-sm ${queueColor}`}>
          <p className="font-semibold text-lg">Nomor Antrian</p>
          <p className="text-2xl font-bold">{order.queueNumber}</p>
          <p className="text-sm mt-1">Status: {order.queueStatus}</p>
        </div>
      )}

      {/* --- Tenant Info --- */}
      <div className="border rounded p-4 shadow-sm">
        <p className="font-semibold text-lg">{order.tenant.name}</p>
        {order.tenant.address && (
          <p className="text-sm text-gray-600">{order.tenant.address}</p>
        )}
      </div>

      {/* --- Order Summary --- */}
      <div className="border rounded p-4 shadow-sm">
        <p className="font-semibold text-lg mb-3">Pesanan</p>

        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm py-1">
            <p>
              {item.name} × {item.qty}
            </p>
            <p>Rp{(item.price * item.qty).toLocaleString("id-ID")}</p>
          </div>
        ))}

        <hr className="my-2" />

        <p className="font-semibold text-right text-lg">
          Total: Rp{order.totalAmount.toLocaleString("id-ID")}
        </p>
      </div>

      {/* --- Back button --- */}
      <Link
        to="/"
        className="block text-center bg-black text-white py-2 rounded shadow-sm"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
