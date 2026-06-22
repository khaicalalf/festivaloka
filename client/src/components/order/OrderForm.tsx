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
        bg-slate-900/40 backdrop-blur-sm
        animate-fadeIn
        p-4
      "
      onClick={onCancel}
    >
      <div
        className="
          w-full md:max-w-2xl bg-white rounded-t-[2.5rem] md:rounded-[2.5rem]
          shadow-2xl border border-slate-200/60
          animate-slideUp
          max-h-[90vh] overflow-hidden
          flex flex-col
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <span className="text-[10px] font-black text-rose-500 tracking-widest uppercase">Menu Spesial Stan</span>
              <h2 className="text-xl font-black text-slate-800 mt-0.5">
                {tenantName}
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="
                w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 
                flex items-center justify-center
                transition-colors text-slate-400 hover:text-slate-600 border border-slate-200/50
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
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* MENU LIST */}
        <div className="flex-1 overflow-y-auto px-6 py-5 bg-slate-50/50">
          <div className="space-y-4">
            {menu.map((item) => {
              const qty = getQty(item.id);
              return (
                <div
                  key={item.id}
                  className="
                    bg-white border border-slate-200/80 rounded-[1.5rem] p-4
                    transition-all duration-200
                    hover:border-amber-300 hover:shadow-md
                  "
                >
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                      <p className="text-sm font-black text-emerald-600 mt-2 font-mono">
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item, -1)}
                        disabled={qty === 0}
                        className="
                          w-8 h-8 rounded-full border border-slate-200
                          flex items-center justify-center bg-white
                          hover:border-amber-400 hover:bg-amber-50
                          disabled:opacity-30 disabled:cursor-not-allowed
                          transition-all font-black text-slate-600
                        "
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-bold text-slate-800 font-mono text-sm">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item, 1)}
                        className="
                          w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white
                          flex items-center justify-center shadow shadow-orange-500/10
                          hover:from-amber-600 hover:to-orange-650
                          transition-all font-black
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
        <div className="px-6 py-6 border-t border-slate-100 bg-white rounded-b-[2.5rem] space-y-5">
          {/* Contact Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Email Anda <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) =>
                  onChangeContact({ ...contact, email: e.target.value })
                }
                className="
                  bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 w-full text-sm text-slate-800 placeholder-slate-400
                  focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10
                  transition-all shadow-inner
                "
                placeholder="nama@email.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Nomor HP (WhatsApp)
              </label>
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) =>
                  onChangeContact({ ...contact, phone: e.target.value })
                }
                className="
                  bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 w-full text-sm text-slate-800 placeholder-slate-400
                  focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10
                  transition-all shadow-inner
                "
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          {/* Total & Checkout Button */}
          <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Total Belanja ({itemCount} item)
              </p>
              <p className="text-2xl font-black text-slate-800 font-mono mt-0.5">
                Rp {total.toLocaleString("id-ID")}
              </p>
            </div>

            <button
              type="button"
              disabled={!cart.length || !contact.email}
              onClick={onCheckoutClick}
              className="
                bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3.5 rounded-2xl font-bold
                shadow-lg shadow-orange-500/15 hover:from-amber-600 hover:to-orange-600
                disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none
                transition-all transform hover:-translate-y-0.5
                flex items-center gap-2 text-sm
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
                  strokeWidth={2.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Bayar Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
