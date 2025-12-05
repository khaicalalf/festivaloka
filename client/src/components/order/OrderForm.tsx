import type { MenuItem, CartItem } from "../../types";

type Props = {
  tenantName: string;
  menu: MenuItem[];
  cart: CartItem[];
  onChangeQuantity: (menuItem: MenuItem, quantity: number) => void;
  contact: { email: string; phone: string };
  onChangeContact: (contact: { email: string; phone: string }) => void;
  onCheckoutClick: () => void;
};

export function OrderForm({
  tenantName,
  menu,
  cart,
  onChangeQuantity,
  contact,
  onChangeContact,
  onCheckoutClick,
}: Props) {
  const getQty = (itemId: string) =>
    cart.find((c) => c.menuItem.id === itemId)?.quantity ?? 0;

  const handleQtyChange = (item: MenuItem, delta: number) => {
    const current = getQty(item.id);
    const next = Math.max(0, current + delta);
    onChangeQuantity(item, next);
  };

  const total = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);

  return (
    <div className="border rounded-lg p-4 mt-4 space-y-3">
      <h2 className="font-semibold text-lg">Pesan di {tenantName}</h2>

      <div className="space-y-2 max-h-64 overflow-auto pr-1">
        {menu.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm border-b pb-2"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">
                {item.description} • Rp
                {item.price.toLocaleString()}
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
              <span className="w-6 text-center">{getQty(item.id)}</span>
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

      <div className="space-y-2 pt-2">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            className="border rounded px-2 py-1 w-full text-sm"
            value={contact.email}
            onChange={(e) =>
              onChangeContact({ ...contact, email: e.target.value })
            }
            placeholder="wajib, buat info antrian"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Nomor HP / WhatsApp</label>
          <input
            type="tel"
            className="border rounded px-2 py-1 w-full text-sm"
            value={contact.phone}
            onChange={(e) =>
              onChangeContact({ ...contact, phone: e.target.value })
            }
            placeholder="opsional"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <p className="text-sm">
          Total:{" "}
          <span className="font-semibold">
            Rp{total.toLocaleString("id-ID")}
          </span>
        </p>
        <button
          type="button"
          disabled={!cart.length || !contact.email}
          onClick={onCheckoutClick}
          className="bg-black text-white text-sm px-4 py-2 rounded disabled:bg-gray-400"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
