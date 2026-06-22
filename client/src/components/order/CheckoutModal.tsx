import type { ChangeEvent, ReactNode } from "react";
import type { CartItem } from "../../types";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  preferences?: string;
  contact: { email: string; phone: string };
  onContactChange: (next: { email: string; phone: string }) => void;
  onConfirm: () => void;
  loading?: boolean;
};

type OverlayProps = {
  children: ReactNode;
};

function Overlay({ children }: OverlayProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-2xl max-w-lg w-full animate-slide-up overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export function CheckoutModal({
  open,
  onClose,
  cart,
  preferences,
  contact,
  onContactChange,
  onConfirm,
  loading = false,
}: ModalProps) {
  if (!open) return null;

  const total = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
  const itemCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const isContactValid = contact.email.trim() !== "";

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    onContactChange({ ...contact, email: e.target.value });
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    onContactChange({ ...contact, phone: e.target.value });
  };

  return (
    <Overlay>
      <div className="flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black text-rose-500 tracking-widest uppercase">Langkah Terakhir</span>
              <h2 className="text-xl font-black text-slate-800 mt-0.5">
                Konfirmasi Pesanan
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-slate-400 hover:text-slate-650 transition-colors disabled:opacity-50"
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
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1 bg-slate-50/50">
          {/* Cart Items */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              📦 Keranjang Belanja ({itemCount} item)
            </h3>
            <div className="border border-slate-200/80 rounded-2xl p-4 space-y-3.5 max-h-48 overflow-y-auto bg-white shadow-xs">
              {cart.map((c) => (
                <div
                  key={c.menuItem.id}
                  className="flex justify-between items-start text-xs text-slate-700"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-bold text-slate-800 truncate">
                      {c.menuItem.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Rp {c.menuItem.price.toLocaleString("id-ID")} × {c.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-slate-800 font-mono flex-shrink-0">
                    Rp {(c.menuItem.price * c.quantity).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              ✍️ Catatan Preferensi Makanan
            </h3>
            <div className="border border-slate-200/80 rounded-2xl p-4 bg-white text-xs text-slate-650 shadow-xs leading-relaxed">
              {preferences && preferences.trim() !== ""
                ? preferences
                : "Tidak ada preferensi khusus."}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              👤 Kontak Pelanggan
            </h3>
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Email Anda <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={handleEmailChange}
                  placeholder="nama@email.com"
                  className="
                    w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400
                    focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10
                    transition-all shadow-inner
                  "
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Nomor HP (Opsional)
                </label>
                <input
                  type="tel"
                  value={contact.phone}
                  onChange={handlePhoneChange}
                  placeholder="08xxxxxxxxxx"
                  className="
                    w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400
                    focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10
                    transition-all shadow-inner
                  "
                />
              </div>

              {!isContactValid && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                  <svg
                    className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="text-[10px] text-rose-600 font-medium">
                    Alamat email wajib diisi untuk verifikasi transaksi pembayaran Anda.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-slate-100 bg-white">
          <div className="flex justify-between items-center mb-5">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Pembayaran</span>
              <p className="text-2xl font-black text-slate-800 font-mono mt-0.5">
                Rp {total.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="
                flex-1 border border-slate-200 py-3.5 rounded-2xl font-bold text-xs text-slate-500
                bg-white hover:bg-slate-50 transition-all
              "
            >
              Kembali
            </button>

            <button
              onClick={onConfirm}
              disabled={loading || !isContactValid}
              className="
                flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest
                shadow-lg shadow-orange-500/15 hover:from-amber-600 hover:to-orange-600
                disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none
                transition-all transform hover:-translate-y-0.5
                flex items-center justify-center gap-2
              "
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Bayar Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
