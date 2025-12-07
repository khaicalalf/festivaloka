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
  const [expanded, setExpanded] = useState(false);

  const { history, loading } = useOrderHistory(email);

  const waitingOnly = history.filter(
    (h) =>
      h.queue?.status === "WAITING" ||
      h.status === "PENDING" ||
      h.status === "UNPAID"
  );

  const latestTwoWaiting = waitingOnly.slice(0, 1);

  const called = history.filter((h) => h.queue?.status === "CALLED");

  const latestCalled = called.slice(0, 1);

  const showHistory = expanded
    ? history
    : latestTwoWaiting.length > 0
    ? latestTwoWaiting
    : latestCalled;

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
      <div className="border rounded-xl p-4 bg-white shadow-sm space-y-2">
        <h3 className="font-semibold text-lg">Riwayat Pesanan</h3>
        <p className="text-sm text-gray-600">
          Masukkan email untuk melihat riwayat pesananmu.
        </p>

        <input
          type="email"
          value={tempEmail}
          onChange={(e) => setTempEmail(e.target.value)}
          className="border px-3 py-1 rounded w-full text-sm"
          placeholder="emailmu@contoh.com"
        />

        <button
          onClick={handleSaveEmail}
          className="bg-black text-white rounded px-4 py-1 text-sm"
        >
          Simpan
        </button>
      </div>
    );
  }

  /* ==========================
              UI
  =========================== */
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm space-y-3">
      <h3 className="font-semibold text-lg">Riwayat Pesanan</h3>

      {loading ? (
        <p className="text-sm text-gray-500 animate-pulse">Memuat...</p>
      ) : showHistory.length === 0 ? (
        <p className="text-sm text-gray-500">Tidak ada pesanan aktif.</p>
      ) : (
        <>
          {!expanded &&
            showHistory.map((order) => (
              <div
                key={order.id}
                className="p-3 border rounded-lg bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{order.tenant.name}</p>
                  <p className="text-xs text-gray-600">
                    Antrian: {order.queueNumber}
                  </p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded ${
                    order.queue?.status === "WAITING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {order.queue?.status ?? order.status}
                </span>
              </div>
            ))}

          {expanded &&
            history.map((order) => (
              <OrderHistoryItem key={order.id} order={order} />
            ))}
        </>
      )}

      {history.length > 0 && (
        <button
          onClick={() => setExpanded((x) => !x)}
          className="text-blue-600 text-sm"
        >
          {expanded ? "Sembunyikan Riwayat" : "Lihat Semua Riwayat"}
        </button>
      )}
    </div>
  );
}
