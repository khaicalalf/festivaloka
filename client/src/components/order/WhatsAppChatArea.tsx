import { useState, useRef, useEffect } from "react";
import type { Tenant, MenuItem, CartItem } from "../../types";

type ChatAreaProps = {
  tenant: Tenant;
  cart: CartItem[];
  onChangeQuantity: (menuItem: MenuItem, quantity: number) => void;
  contact: { email: string; phone: string };
  onChangeContact: (contact: { email: string; phone: string }) => void;
  onCheckoutClick: () => void;
  onCancel: () => void;
  isListening: boolean;
  onStartVoice: () => void;
  onStopVoice: () => void;
};

export function WhatsAppChatArea({
  tenant,
  cart,
  onChangeQuantity,
  contact,
  onChangeContact,
  onCheckoutClick,
  onCancel,
  isListening,
  onStartVoice,
  onStopVoice,
}: ChatAreaProps) {
  const [menuSearch, setMenuSearch] = useState("");
  const [showContactEdit, setShowContactEdit] = useState(!contact.email);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat when cart changes to see the outgoing bubble
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [cart, isListening]);

  const getQty = (id: string) =>
    cart.find((c) => c.menuItem.id === id)?.quantity ?? 0;

  const handleQtyChange = (item: MenuItem, delta: number) => {
    const current = getQty(item.id);
    const next = Math.max(0, current + delta);
    onChangeQuantity(item, next);
  };

  const total = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
  const itemCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  // Filter menu items by search query
  const filteredMenu = tenant.menus.filter((item) =>
    item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
    item.description.toLowerCase().includes(menuSearch.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#fafafa] relative overflow-hidden select-none">
      {/* 1. CHAT HEADER */}
      <div className="px-4 py-3 bg-white border-b border-slate-200/60 flex justify-between items-center z-10 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Back button (Mobile view only) */}
          <button
            onClick={onCancel}
            className="lg:hidden p-1 rounded-full hover:bg-slate-100 text-slate-600 transition"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          {/* Stall Icon/Avatar */}
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-lg shadow-sm">
            {tenant.imageUrl ? (
              <img
                src={tenant.imageUrl}
                alt={tenant.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>{tenant.category === "FOOD" ? "🍲" : "🍹"}</span>
            )}
          </div>

          {/* Stall Info */}
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-slate-800 truncate leading-snug">
              {tenant.name}
            </h3>
            <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
              ⛺ Tenda {tenant.address || "Bazaar"} •{" "}
              {tenant.status === "RAMAI" ? "🔥 Sedang Ramai" : "🟢 Buka"}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Contact Toggle button */}
          <button
            onClick={() => setShowContactEdit((prev) => !prev)}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
              showContactEdit
                ? "bg-slate-900 text-white border border-slate-950"
                : "hover:bg-slate-100 text-slate-650 border border-transparent"
            }`}
            title="Edit Contact"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="hidden sm:inline">Kontak</span>
          </button>

          {/* Close Panel Button */}
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
            title="Close Stall"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. CONTACT EDIT BANNER (Collapsible, attached style) */}
      {showContactEdit && (
        <div className="bg-white border-b border-slate-200 p-4 space-y-3 shadow-xs animate-slideDown z-20 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              👤 Kontak Pemesan (Wajib untuk Pembayaran)
            </h4>
            <button
              onClick={() => setShowContactEdit(false)}
              className="text-xs font-bold text-slate-800 hover:underline"
            >
              Selesai
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Email Anda <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) =>
                  onChangeContact({ ...contact, email: e.target.value })
                }
                placeholder="nama@email.com"
                className="w-full bg-[#f0f2f5] border border-transparent focus:border-slate-250 focus:bg-white rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) =>
                  onChangeContact({ ...contact, phone: e.target.value })
                }
                placeholder="08xxxxxxxxxx"
                className="w-full bg-[#f0f2f5] border border-transparent focus:border-slate-250 focus:bg-white rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. CHAT CONTENT AREA */}
      <div className="flex-1 overflow-y-auto whatsapp-bg p-4 space-y-4 custom-scrollbar flex flex-col justify-start">
        
        {/* System Message Greeting */}
        <div className="flex justify-center my-1.5">
          <div className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] sm:text-xs px-4 py-2 rounded-xl text-center shadow-2xs max-w-lg leading-relaxed">
            💬 <strong>Asisten AI:</strong> Halo! Hari ini kami menyajikan menu-menu lezat di bawah. Silakan pesan lewat input suara di bawah atau klik "+" pada daftar menu.
          </div>
        </div>

        {/* Menu Items (Left aligned chat bubbles) */}
        <div className="space-y-3.5 max-w-xl sm:max-w-2xl">
          {!filteredMenu.length ? (
            <div className="bg-white rounded-2xl rounded-tl-none p-4 text-xs text-slate-500 italic shadow-sm border border-slate-100/50 w-64">
              Menu tidak ditemukan.
            </div>
          ) : (
            filteredMenu.map((item) => {
              const qty = getQty(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl rounded-tl-none p-3.5 shadow-sm border border-slate-100/50 w-full hover:shadow-md transition-all duration-150"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                      <p className="text-sm font-black text-slate-900 font-mono mt-2">
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>

                    {/* Quantity selectors inside bubble */}
                    <div className="flex-shrink-0 flex items-center bg-slate-550/5 rounded-xl p-1 border border-slate-200">
                      {qty > 0 ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item, -1)}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-650 hover:bg-slate-100 active:scale-95 transition-all text-xs"
                          >
                            −
                          </button>
                          <span className="w-5 text-center font-bold text-xs text-slate-800 font-mono">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item, 1)}
                            className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold hover:bg-slate-850 active:scale-95 transition-all text-xs"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQtyChange(item, 1)}
                          className="px-3.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs transition-colors shadow-2xs"
                        >
                          Tambah +
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* User Cart Summary Bubble (Right aligned outgoing bubble) */}
        {itemCount > 0 && (
          <div className="bg-slate-900 text-white rounded-2xl rounded-tr-none p-4 shadow-sm border border-slate-950 w-full max-w-sm sm:max-w-md ml-auto animate-fade-in relative">
            {/* Outgoing Bubble tail/tip */}
            <div className="absolute right-0 top-0 w-3 h-3 bg-slate-900 rotate-45 transform translate-x-1 border-r border-t border-slate-950"></div>

            <div className="relative space-y-3 z-10">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  🛒 Pesanan Saya ({itemCount} item)
                </h4>
                <button
                  onClick={() => {
                    tenant.menus.forEach((m) => onChangeQuantity(m, 0));
                  }}
                  className="text-[10px] text-rose-300 font-semibold hover:underline"
                >
                  Kosongkan
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {cart.map((c) => (
                  <div key={c.menuItem.id} className="flex justify-between items-start text-xs text-slate-200">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-white truncate">{c.menuItem.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Rp {c.menuItem.price.toLocaleString("id-ID")} × {c.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-white font-mono flex-shrink-0">
                      Rp {(c.menuItem.price * c.quantity).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10 flex flex-col gap-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-300 font-semibold">Total Pembayaran</span>
                  <span className="text-base font-black text-white font-mono">
                    Rp {total.toLocaleString("id-ID")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onCheckoutClick}
                  disabled={!contact.email}
                  className="w-full bg-white hover:bg-slate-100 text-slate-900 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Lanjutkan Pembayaran</span>
                </button>

                {!contact.email && (
                  <p className="text-[10px] text-rose-300 text-center font-medium">
                    ⚠️ Silakan isi Email Anda di bagian atas chat sebelum melanjutkan.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Anchor point for scrolling */}
        <div ref={chatEndRef} />
      </div>

      {/* 4. CHAT INPUT BAR (WhatsApp Style with integrated Voice AI) */}
      <div className="px-4 py-3 bg-white border-t border-slate-200/60 flex items-center gap-3 z-10 flex-shrink-0">
        
        {/* If user is listening, show recording HUD, otherwise show message box */}
        {isListening ? (
          <div className="flex-1 flex items-center justify-between bg-[#f8f9fa] border border-slate-300 rounded-xl px-4 py-2.5 shadow-inner-sm animate-breathe">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 animate-ping"></span>
              <p className="text-xs text-slate-700 font-semibold uppercase tracking-wider font-mono">
                Mendengarkan...
              </p>
            </div>
            
            {/* Visualizer waves */}
            <div className="flex items-end gap-1 h-4">
              <div className="w-0.5 bg-slate-800 rounded-full animate-bounce h-2" style={{ animationDelay: "0ms" }}></div>
              <div className="w-0.5 bg-slate-800 rounded-full animate-bounce h-4" style={{ animationDelay: "150ms" }}></div>
              <div className="w-0.5 bg-slate-800 rounded-full animate-bounce h-3" style={{ animationDelay: "300ms" }}></div>
              <div className="w-0.5 bg-slate-800 rounded-full animate-bounce h-1" style={{ animationDelay: "450ms" }}></div>
            </div>

            <button
              onClick={onStopVoice}
              className="text-xs font-bold text-slate-500 hover:text-slate-750 underline"
            >
              Batal
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-center bg-[#f0f2f5] border border-transparent focus-within:bg-white focus-within:border-slate-200 rounded-xl px-3 py-2 shadow-inner-sm transition-all">
            {/* Filter Input */}
            <input
              type="text"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder="Ketik nama makanan untuk memfilter menu..."
              className="w-full bg-transparent border-none text-xs text-slate-800 placeholder-slate-450 focus:outline-none"
            />
            {menuSearch && (
              <button
                onClick={() => setMenuSearch("")}
                className="text-slate-400 hover:text-slate-650"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Voice Microphone / Trigger button */}
        <button
          onClick={isListening ? onStopVoice : onStartVoice}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-sm transition-all duration-300 transform active:scale-90
            ${
              isListening
                ? "bg-slate-850 hover:bg-slate-750 hover:shadow-md animate-pulse"
                : "bg-slate-900 hover:bg-slate-800 hover:shadow-md"
            }
          `}
          title={isListening ? "Hentikan perekaman" : "Pesan lewat suara AI"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isListening ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
