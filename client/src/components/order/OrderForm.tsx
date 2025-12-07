import type { MenuItem, CartItem } from "../../types";

type Props = {
  tenantName: string;
  menu: MenuItem[];
  cart: CartItem[];
  onChangeQuantity: (menuItem: MenuItem, quantity: number) => void;
  contact: { email: string; phone: string };
  onChangeContact: (contact: { email: string; phone: string }) => void;
  onCheckoutClick: () => void;
  onCancel: () => void; // tombol close
};

export function OrderForm({
  tenantName,
  menu,
  cart,
  onChangeQuantity,
  contact,
  onChangeContact,
  onCheckoutClick,
  onCancel,
}: Props) {
  const getQty = (id: string) =>
    cart.find((c) => c.menuItem.id === id)?.quantity ?? 0;

  const handleQtyChange = (item: MenuItem, delta: number) => {
    const current = getQty(item.id);
    const next = Math.max(0, current + delta);
    onChangeQuantity(item, next);
  };

  const total = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);

  return (
    <div
      className="
        fixed inset-0 z-50 
        flex items-end 
        bg-black/30 backdrop-blur-sm
        animate-fadeIn
      "
    >
      <div
        className="flex items-center justify-center
          w-full bg-white rounded-t-2xl p-5 
          animate-slideUp
          max-h-[85vh] overflow-y-auto space-y-4"
      >
        <div
          className="
          w-full md:w-1/3 bg-white rounded-t-2xl p-5 
          animate-slideUp
          max-h-[85vh] overflow-y-auto space-y-4
        "
        >
          {/* HEADER */}
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-semibold text-lg">Pesan di {tenantName}</h2>

            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-800 text-sm"
            >
              ❌
            </button>
          </div>

          {/* MENU LIST */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {menu.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.description} • Rp{item.price.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="border rounded px-2"
                    onClick={() => handleQtyChange(item, -1)}
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm">
                    {getQty(item.id)}
                  </span>
                  <button
                    type="button"
                    className="border rounded px-2"
                    onClick={() => handleQtyChange(item, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CONTACT */}
          <div className="space-y-2 pt-2">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) =>
                  onChangeContact({ ...contact, email: e.target.value })
                }
                className="border rounded px-2 py-1 w-full text-sm"
                placeholder="wajib untuk info antrian"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">No HP / WhatsApp</label>
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) =>
                  onChangeContact({ ...contact, phone: e.target.value })
                }
                className="border rounded px-2 py-1 w-full text-sm"
                placeholder="opsional"
              />
            </div>
          </div>

          {/* TOTAL + CHECKOUT */}
          <div className="flex justify-between items-center pt-3 border-t">
            <p className="text-sm">
              Total: <b>Rp{total.toLocaleString("id-ID")}</b>
            </p>

            <button
              type="button"
              disabled={!cart.length || !contact.email}
              onClick={onCheckoutClick}
              className="
              bg-black text-white px-4 py-2 rounded text-sm
              disabled:bg-gray-400
            "
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
