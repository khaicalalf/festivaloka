import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { fetchOrderResult } from "../api/orders";
import type { OrderResult } from "../types";
import { getIsMockMode } from "../api/client";

export function TransactionResultPage() {
  const { id: pathId } = useParams<{ id: string }>();
  const location = useLocation();

  const [order, setOrder] = useState<OrderResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOffline = getIsMockMode();

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

  // Auto refresh for pending orders or processing queue
  useEffect(() => {
    if (!order) return;

    const pending =
      order.status === "PENDING" ||
      order.queueStatus === "WAITING" ||
      order.queueStatus === "PROCESSING";

    if (!pending) return;

    const t = setTimeout(() => loadOrder(), 2500);
    return () => clearTimeout(t);
  }, [order, loadOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium text-slate-400 animate-pulse">Menghubungkan Transaksi...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full text-center space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-6xl mb-4 animate-bounce">❌</div>
          <h1 className="text-2xl font-black text-white">
            Transaksi Tidak Ditemukan
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">{error || "Silakan periksa kembali tautan transaksi Anda."}</p>
          <Link
            to="/"
            className="
              inline-flex items-center justify-center gap-2 w-full
              bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700
              text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-rose-950/20
              transition-all duration-300 transform hover:-translate-y-0.5
            "
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PAID":
      case "SUCCESS":
        return {
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          text: "text-emerald-400",
          glow: "shadow-emerald-950/20",
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
                strokeWidth={2.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
      case "PENDING":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
          text: "text-amber-400",
          glow: "shadow-amber-950/20",
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
                strokeWidth={2.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
      case "FAILED":
      case "CANCEL":
        return {
          bg: "bg-rose-500/10",
          border: "border-rose-500/20",
          text: "text-rose-400",
          glow: "shadow-rose-950/20",
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
                strokeWidth={2.5}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
      default:
        return {
          bg: "bg-slate-800/40",
          border: "border-slate-850",
          text: "text-slate-400",
          glow: "",
          icon: null,
        };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const queueStep = order.queueStatus || "WAITING"; // WAITING, PROCESSING, FINISHED, CANCELLED

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 selection:bg-rose-500/30">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        
        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Ringkasan Transaksi
            </h1>
            {isOffline && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                Simulasi Offline
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">ID: {order.id}</p>
        </div>

        {/* Status Card with Glowing Color */}
        <div
          className={`rounded-3xl border ${statusConfig.border} ${statusConfig.bg} p-6 text-center shadow-xl ${statusConfig.glow}`}
        >
          <div className={`${statusConfig.text} mb-3 flex justify-center`}>
            {statusConfig.icon}
          </div>
          <h2 className={`text-lg font-bold ${statusConfig.text} mb-1`}>
            Status Pembayaran
          </h2>
          <p className="text-2xl font-black tracking-widest text-white uppercase">
            {order.status === "PAID" ? "SUCCESS" : order.status}
          </p>
          {order.status === "PENDING" && (
            <p className="text-xs mt-2 text-amber-400/80 animate-pulse">
              Menunggu konfirmasi pembayaran otomatis (silakan selesaikan pembayaran)...
            </p>
          )}
        </div>

        {/* Queue Progression Timeline (Interactive Stepper) */}
        {order.queueNumber && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Nomor Antrian Anda</span>
              <p className="text-5xl font-black text-rose-500 font-mono tracking-tight select-all">
                #{order.queueNumber}
              </p>
            </div>

            {/* Stepper visualization */}
            <div className="pt-4 pb-2">
              <div className="flex items-center justify-between relative">
                {/* Horizontal progress track */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 z-0"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-700 z-0"
                  style={{
                    width: queueStep === "FINISHED" ? "100%" : queueStep === "PROCESSING" ? "50%" : "0%"
                  }}
                ></div>

                {/* Step 1: Antre (WAITING) */}
                <div className="flex flex-col items-center z-10 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    queueStep === "WAITING" || queueStep === "PROCESSING" || queueStep === "FINISHED"
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-950/30 ring-4 ring-rose-500/10"
                      : "bg-slate-800 text-slate-400"
                  }`}>
                    1
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-300 mt-2">Menunggu</span>
                </div>

                {/* Step 2: Diproses (PROCESSING) */}
                <div className="flex flex-col items-center z-10 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    queueStep === "PROCESSING" || queueStep === "FINISHED"
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-950/30 ring-4 ring-rose-500/10"
                      : "bg-slate-800 text-slate-400"
                  }`}>
                    2
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-300 mt-2">Diproses</span>
                </div>

                {/* Step 3: Siap Diambil (FINISHED) */}
                <div className="flex flex-col items-center z-10 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    queueStep === "FINISHED"
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-950/30 ring-4 ring-rose-500/10"
                      : "bg-slate-800 text-slate-400"
                  }`}>
                    3
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-300 mt-2">Siap Diambil</span>
                </div>
              </div>

              {/* Status explanation alert */}
              <div className="mt-6 p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-center text-xs text-slate-400">
                {queueStep === "WAITING" && "Pesanan Anda sedang masuk antrean masak. Mohon menunggu giliran."}
                {queueStep === "PROCESSING" && "Chef sedang menyiapkan masakan Anda. Pesanan akan segera siap."}
                {queueStep === "FINISHED" && "🎉 Hore! Pesanan Anda telah matang dan siap diambil di meja stan!"}
                {queueStep === "CANCELLED" && "Pesanan dibatalkan oleh pihak stan."}
              </div>
            </div>
          </div>
        )}

        {/* Tenant Info Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-rose-500 flex-shrink-0">
              <svg
                className="w-6 h-6"
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
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Dipesan Dari Stan</span>
              <h3 className="text-lg font-bold text-white truncate mt-0.5">
                {order.tenant.name}
              </h3>
              {order.tenant.address && (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-slate-500"
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
                  Lokasi Stan: {order.tenant.address}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Itemized Receipt */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <h3 className="text-sm font-bold text-slate-300 mb-4 tracking-wider uppercase flex items-center gap-2">
            <svg
              className="w-5 h-5 text-rose-500"
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
            Detail Rincian Belanja
          </h3>

          {/* Dotted lines border style */}
          <div className="space-y-3.5 mb-5">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <p className="text-slate-300">
                  {item.name}{" "}
                  <span className="text-slate-500 font-mono text-xs">x {item.qty}</span>
                </p>
                <p className="font-bold text-slate-100 font-mono">
                  Rp {(item.price * item.qty).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-slate-800 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold text-slate-400">Total Pembayaran</p>
              <p className="text-2xl font-black text-rose-400 font-mono">
                Rp {order.totalAmount.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <Link
          to="/"
          className="
            block text-center w-full
            bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700
            text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-950/20
            transition-all duration-300 transform hover:-translate-y-0.5
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
