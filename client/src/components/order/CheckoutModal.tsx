import type { ReactNode } from "react";
import type { CartItem } from "../../types";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  preferences?: string;
  contact: { email: string; phone: string };
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
  onConfirm,
  loading = false,
}: ModalProps) {
  if (!open) return null;

  const total = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);

  return (
    <Overlay>
      <div className="space-y-3 text-sm">
        <h2 className="font-semibold text-lg">Konfirmasi Pesanan</h2>

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
          <p>{preferences}</p>
        </div>

        {/* kontak */}
        <div className="border rounded p-2 text-xs space-y-1">
          <p className="font-semibold">Kontak</p>
          {contact.email && <p>Email: {contact.email}</p>}
          <p>HP: {contact.phone}</p>
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
              className="border px-3 py-1 rounded text-sm"
            >
              Batal
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="bg-black text-white px-3 py-1 rounded text-sm disabled:bg-gray-400"
            >
              {loading ? "Mengalihkan..." : "Bayar"}
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
