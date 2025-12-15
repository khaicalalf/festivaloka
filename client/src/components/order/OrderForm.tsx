import type { MenuItem, CartItem } from "../../types";

type Props = {
  tenantName: string;
  menu: MenuItem[];
  cart: CartItem[];
  onChangeQuantity: (menuItem: MenuItem, quantity: number) => void;
  contact: { email: string; phone: string };
  onChangeContact: (contact: { email: string; phone: string }) => void;
  onCheckoutClick: () => void;
  onCancel: () => void;
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
  const itemCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div
      className="
        fixed inset-0 z-50 
        flex items-end md:items-center md:justify-center
        bg-black/50 backdrop-blur-sm
        animate-fadeIn
        p-4
      "
      onClick={onCancel}
    >
      <div
        className="
          w-full md:max-w-2xl bg-white rounded-2xl
          shadow-2xl
          animate-slideUp
          max-h-[90vh] overflow-hidden
          flex flex-col
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {tenantName}
              </h2>
              <p className="text-sm text-gray-600">Pilih menu favoritmu</p>
            </div>
            <button
              onClick={onCancel}
              className="
                w-8 h-8 rounded-full hover:bg-gray-100 
                flex items-center justify-center
                transition-colors text-gray-400 hover:text-gray-600
              "
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
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* MENU LIST */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            {menu.map((item) => {
              const qty = getQty(item.id);
              return (
                <div
                  key={item.id}
                  className="
                    border-2 border-gray-200 rounded-xl p-4
                    transition-all duration-200
                    hover:border-gray-300 hover:shadow-md
                  "
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.description}
                      </p>
                      <p className="text-base font-bold text-gray-900">
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item, -1)}
                        disabled={qty === 0}
                        className="
                          w-8 h-8 rounded-full border-2 border-gray-300
                          flex items-center justify-center
                          hover:border-black hover:bg-gray-50
                          disabled:opacity-30 disabled:cursor-not-allowed
                          transition-all font-semibold text-gray-700
                        "
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-bold text-gray-900">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item, 1)}
                        className="
                          w-8 h-8 rounded-full bg-[#FF385C] text-white
                          flex items-center justify-center
                          hover:bg-[#E31C5F]
                          transition-all font-semibold
                        "
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CONTACT & CHECKOUT */}
        <div className="px-6 py-5 border-t border-gray-200 bg-gray-50 rounded-b-2xl space-y-4">
          {/* Contact Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) =>
                  onChangeContact({ ...contact, email: e.target.value })
                }
                className="
                  border-2 border-gray-200 rounded-lg px-4 py-2.5 w-full text-sm
                  focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10
                  transition-all
                "
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                No HP (Opsional)
              </label>
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) =>
                  onChangeContact({ ...contact, phone: e.target.value })
                }
                className="
                  border-2 border-gray-200 rounded-lg px-4 py-2.5 w-full text-sm
                  focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10
                  transition-all
                "
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          {/* Total & Checkout Button */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div>
              <p className="text-sm text-gray-600">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                Rp {total.toLocaleString("id-ID")}
              </p>
            </div>

            <button
              type="button"
              disabled={!cart.length || !contact.email}
              onClick={onCheckoutClick}
              className="
                bg-[#FF385C] text-white px-8 py-3 rounded-lg font-semibold
                shadow-lg hover:bg-[#E31C5F] hover:shadow-xl
                disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none
                transition-all transform hover:-translate-y-0.5
                flex items-center gap-2
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
