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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
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

  const isContactValid =
    contact.email.trim() !== "" && contact.phone.trim() !== "";

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    onContactChange({ ...contact, email: e.target.value });
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    onContactChange({ ...contact, phone: e.target.value });
  };

  return (
    <Overlay>
      <div className="space-y-3 text-sm">
        <h2 className="font-semibold text-lg">Konfirmasi Pesanan</h2>

        {/* item cart */}
        <div className="border rounded p-2 max-h-40 overflow-auto space-y-1">
          {cart.map((c) => (
            <div key={c.menuItem.id} className="flex justify-between">
              <span>
                {c.menuItem.name} × {c.quantity}
              </span>
              <span>
                Rp{(c.menuItem.price * c.quantity).toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>

        {/* preferensi */}
        <div className="border rounded p-2 text-xs space-y-1">
          <p className="font-semibold">Preferensi</p>
          <p className="whitespace-pre-line">
            {preferences && preferences.trim() !== ""
              ? preferences
              : "Tidak ada preferensi khusus."}
          </p>
        </div>

        {/* kontak – sekarang bisa diisi di sini */}
        <div className="border rounded p-2 text-xs space-y-2">
          <p className="font-semibold">Kontak</p>

          <div className="space-y-1">
            <label className="block">
              <span className="text-[11px] uppercase tracking-wide">Email</span>
              <input
                type="email"
                value={contact.email}
                onChange={handleEmailChange}
                placeholder="nama@email.com"
                className="mt-1 w-full border rounded px-2 py-1 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-[11px] uppercase tracking-wide">
                No HP / WhatsApp
              </span>
              <input
                type="tel"
                value={contact.phone}
                onChange={handlePhoneChange}
                placeholder="08xxxxxxxxxx"
                className="mt-1 w-full border rounded px-2 py-1 text-sm"
              />
            </label>
          </div>

          {!isContactValid && (
            <p className="text-[11px] text-red-600 mt-1">
              Isi email dan nomor HP dulu sebelum melanjutkan pembayaran.
            </p>
          )}
        </div>

        {/* footer */}
        <div className="flex justify-between items-center pt-2 border-t">
          <p className="text-sm">
            Total: <b>Rp{total.toLocaleString("id-ID")}</b>
          </p>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="border px-3 py-1 rounded text-sm disabled:opacity-60"
            >
              Batal
            </button>

            <button
              onClick={onConfirm}
              disabled={loading || !isContactValid}
              className="bg-black text-white px-3 py-1 rounded text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Mengalihkan..." : "Bayar"}
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
