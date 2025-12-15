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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-slide-up">
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
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Konfirmasi Pesanan
              </h2>
              <p className="text-sm text-gray-600">
                Periksa pesanan Anda sebelum melanjutkan
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
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
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
          {/* Cart Items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Pesanan Anda ({itemCount} item)
            </h3>
            <div className="border border-gray-200 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto bg-gray-50">
              {cart.map((c) => (
                <div
                  key={c.menuItem.id}
                  className="flex justify-between items-start text-sm"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {c.menuItem.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Rp {c.menuItem.price.toLocaleString("id-ID")} ×{" "}
                      {c.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    Rp {(c.menuItem.price * c.quantity).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
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
              Preferensi
            </h3>
            <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {preferences && preferences.trim() !== ""
                  ? preferences
                  : "Tidak ada preferensi khusus"}
              </p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Informasi Kontak
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={handleEmailChange}
                  placeholder="nama@email.com"
                  className="
                    w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm
                    focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10
                    transition-all
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  No HP / WhatsApp (Opsional)
                </label>
                <input
                  type="tel"
                  value={contact.phone}
                  onChange={handlePhoneChange}
                  placeholder="08xxxxxxxxxx"
                  className="
                    w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm
                    focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10
                    transition-all
                  "
                />
              </div>

              {!isContactValid && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <svg
                    className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="text-xs text-red-700">
                    Email wajib diisi untuk melanjutkan pembayaran
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Pembayaran</p>
              <p className="text-2xl font-bold text-gray-900">
                Rp {total.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="
                flex-1 border-2 border-gray-200 py-3 rounded-lg font-semibold
                bg-white hover:bg-gray-50 hover:border-gray-300
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all
              "
            >
              Batal
            </button>

            <button
              onClick={onConfirm}
              disabled={loading || !isContactValid}
              className="
                flex-1 bg-[#FF385C] text-white py-3 rounded-lg font-semibold
                shadow-lg hover:bg-[#E31C5F] hover:shadow-xl
                disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none
                transition-all transform hover:-translate-y-0.5
                flex items-center justify-center gap-2
              "
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
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
                  Mengalihkan...
                </>
              ) : (
                <>
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
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Bayar Sekarang
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
