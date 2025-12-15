import { useState } from "react";
import { useOrderHistory } from "../../hooks/useOrderHistory";
import { OrderHistoryItem } from "./OrderHistoryItem";

export function OrderHistorySection() {
  /* ==========================
      AMBIL EMAIL DARI CONTACT
  =========================== */
  const savedContact = localStorage.getItem("contact");
  const savedEmail =
    savedContact && JSON.parse(savedContact)?.email
      ? JSON.parse(savedContact).email
      : null;

  const [email, setEmail] = useState<string | null>(savedEmail);
  const [tempEmail, setTempEmail] = useState("");
  const [modalOpen, setModalOpen] = useState(false); // Changed from expanded to modalOpen

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

  /* ==========================
        SIMPAN EMAIL BARU
  =========================== */
  const handleSaveEmail = () => {
    if (!tempEmail) return;

    // update state
    setEmail(tempEmail);

    // update contact (email) di localStorage
    const previous = savedContact ? JSON.parse(savedContact) : {};
    const updated = { ...previous, email: tempEmail };

    localStorage.setItem("contact", JSON.stringify(updated));
  };

  /* ==========================
        JIKA BELUM ADA EMAIL
  =========================== */
  if (!email) {
    return (
      <div className="border-2 border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
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
          <h3 className="font-bold text-lg text-gray-900">Riwayat Pesanan</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Masukkan email untuk melihat riwayat pesananmu
        </p>

        <div className="space-y-3">
          <input
            type="email"
            value={tempEmail}
            onChange={(e) => setTempEmail(e.target.value)}
            className="
              border-2 border-gray-200 rounded-lg px-4 py-2.5 w-full text-sm
              focus:outline-none focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/10
              transition-all
            "
            placeholder="emailmu@contoh.com"
          />

          <button
            onClick={handleSaveEmail}
            disabled={!tempEmail.trim()}
            className="
              w-full bg-[#FF385C] text-white rounded-lg px-4 py-2.5 font-semibold
              shadow-lg hover:bg-[#E31C5F] hover:shadow-xl
              disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none
              transition-all transform hover:-translate-y-0.5
            "
          >
            Simpan Email
          </button>
        </div>
      </div>
    );
  }

  /* ==========================
              UI
  =========================== */
  return (
    <>
      <div className="border-2 border-gray-200 rounded-2xl p-6 bg-white shadow-sm space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
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
            <h3 className="font-bold text-lg text-gray-900">Riwayat Pesanan</h3>
          </div>
          {pointsEarned > 0 && (
            <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg border border-yellow-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold text-sm">{pointsEarned} Poin</span>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-[#FF385C] rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">Memuat riwayat...</p>
            </div>
          </div>
        ) : showHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3 opacity-30">📋</div>
            <p className="text-sm text-gray-500">Tidak ada pesanan aktif</p>
          </div>
        ) : (
          <div className="space-y-3">
            {showHistory.map((order) => (
              <div
                key={order.id}
                className="p-4 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {order.tenant.name}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Antrian:{" "}
                      <span className="font-bold">#{order.queueNumber}</span>
                    </p>
                  </div>

                  <span
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold border ${
                      order.queue?.status === "WAITING"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : order.queue?.status === "CALLED"
                        ? "bg-purple-100 text-purple-700 border-purple-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    {order.queue?.status ?? order.status}
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
              w-full border-2 border-gray-200 py-2.5 rounded-lg font-semibold text-sm
              bg-white hover:bg-gray-50 hover:border-gray-300
              transition-all flex items-center justify-center gap-2
            "
          >
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
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
                <h2 className="text-xl font-bold text-gray-900">
                  Semua Riwayat Pesanan
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {history.map((order) => (
                  <OrderHistoryItem key={order.id} order={order} />
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setModalOpen(false)}
                className="
                  w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold
                  hover:bg-gray-300 transition-all
                "
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
