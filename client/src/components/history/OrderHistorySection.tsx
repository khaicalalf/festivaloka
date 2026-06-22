import { useState } from "react";
import { useOrderHistory } from "../../hooks/useOrderHistory";
import { OrderHistoryItem } from "./OrderHistoryItem";

export function OrderHistorySection() {
  const savedContact = localStorage.getItem("contact");
  const savedEmail =
    savedContact && JSON.parse(savedContact)?.email
      ? JSON.parse(savedContact).email
      : null;

  const [email, setEmail] = useState<string | null>(savedEmail);
  const [tempEmail, setTempEmail] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { history, loading } = useOrderHistory(email);

  const pointsEarned = history.reduce(
    (sum, order) => sum + order.pointsEarned,
    0
  );

  const waitingOnly = history.filter(
    (h) =>
      h.queue?.status === "WAITING" ||
      h.status === "PENDING" ||
      h.status === "UNPAID"
  );

  const latestTwoWaiting = waitingOnly.slice(0, 1);
  const called = history.filter((h) => h.queue?.status === "CALLED");
  const latestCalled = called.slice(0, 1);

  const showHistory =
    latestTwoWaiting.length > 0 ? latestTwoWaiting : latestCalled;

  const handleSaveEmail = () => {
    if (!tempEmail) return;

    setEmail(tempEmail);

    const previous = savedContact ? JSON.parse(savedContact) : {};
    const updated = { ...previous, email: tempEmail };

    localStorage.setItem("contact", JSON.stringify(updated));
  };

  if (!email) {
    return (
      <div className="rounded-3xl p-6 bg-white/40 border border-slate-200/50 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-5 h-5 text-amber-500"
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
          <h3 className="font-black text-slate-800 text-sm tracking-widest uppercase">Riwayat Order</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Masukkan email transaksi Anda untuk memeriksa riwayat pesanan & nomor antrian live.
        </p>

        <div className="space-y-3">
          <input
            type="email"
            value={tempEmail}
            onChange={(e) => setTempEmail(e.target.value)}
            className="
              bg-white border border-slate-200 rounded-2xl px-4 py-2.5 w-full text-xs text-slate-850 placeholder-slate-400
              focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10
              transition-all shadow-inner
            "
            placeholder="emailmu@contoh.com"
          />

          <button
            onClick={handleSaveEmail}
            disabled={!tempEmail.trim()}
            className="
              w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl py-2.5 text-xs font-bold
              shadow-lg shadow-orange-500/10 hover:from-amber-600 hover:to-orange-600
              disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none
              transition-all transform hover:-translate-y-0.5
            "
          >
            Simpan Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-3xl p-6 bg-white/40 border border-slate-200/50 shadow-xs space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-amber-500"
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
            <h3 className="font-black text-slate-800 text-sm tracking-widest uppercase">Riwayat Order</h3>
          </div>
          {pointsEarned > 0 && (
            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-700 px-3 py-1 rounded-full border border-amber-200/50">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-black text-xs">{pointsEarned} Poin</span>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
              <p className="text-[10px] text-slate-400">Memuat...</p>
            </div>
          </div>
        ) : showHistory.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2 opacity-35">📋</div>
            <p className="text-xs text-slate-500 italic">Tidak ada antrean pesanan aktif.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {showHistory.map((order) => (
              <div
                key={order.id}
                className="p-4 bg-white border border-slate-200/80 rounded-2xl hover:border-amber-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 text-xs truncate">
                      {order.tenant.name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                      Antrean:{" "}
                      <span className="font-black text-rose-500 text-xs">#{order.queueNumber}</span>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-xl font-bold uppercase tracking-wider border ${
                      order.queue?.status === "WAITING"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        : order.queue?.status === "CALLED"
                        ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {order.queue?.status === "WAITING" ? "Antre" : order.queue?.status === "CALLED" ? "Dipanggil" : order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        {history.length > 0 && (
          <button
            onClick={() => setModalOpen(true)}
            className="
              w-full border border-slate-200 py-2.5 rounded-2xl font-bold text-xs text-slate-650
              bg-white hover:bg-slate-50 hover:border-slate-350
              transition-all flex items-center justify-center gap-1.5 shadow-sm
            "
          >
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            Lihat Semua Riwayat ({history.length})
          </button>
        )}
      </div>

      {/* Modal for Full History */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-amber-500"
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
                <h2 className="text-lg font-black text-slate-800">
                  Semua Riwayat Pesanan
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition flex items-center justify-center border border-slate-200/50"
                aria-label="Close"
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
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 bg-slate-50/50 space-y-4">
              {history.map((order) => (
                <OrderHistoryItem key={order.id} order={order} />
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white">
              <button
                onClick={() => setModalOpen(false)}
                className="
                  w-full bg-slate-100 text-slate-600 py-3 rounded-2xl font-bold text-xs
                  hover:bg-slate-200 transition-all
                "
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
