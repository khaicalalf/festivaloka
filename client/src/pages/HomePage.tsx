import { useState, useEffect } from "react";
import { useTenants } from "../hooks/useTenants";
import { useCart } from "../hooks/useCart";
import { useVoiceOrder } from "../hooks/useVoiceOrder";
import type { Tenant } from "../types";
import { PreferenceForm } from "../components/preferences/PreferenceForm";
import { PreferenceSummary } from "../components/preferences/PreferenceSummary";
import { TenantList } from "../components/tenants/TenantList";
import { WhatsAppChatArea } from "../components/order/WhatsAppChatArea";
import { CheckoutModal } from "../components/order/CheckoutModal";
import { checkoutOrder } from "../api/tenants";
import { mapCartToPayloadItems } from "../api/transactions";
import { OrderHistorySection } from "../components/history/OrderHistorySection";
import { VoiceAIBar } from "../components/order/VoiceAIBar";
import { Link } from "react-router-dom";
import { getIsMockMode } from "../api/client";

export function HomePage() {
  const [preferences, setPreferences] = useState(
    localStorage.getItem("preferences") ?? "",
  );
  const [prefOpen, setPrefOpen] = useState(preferences === "");
  const [tempPreferences, setTempPreferences] = useState(""); // Temporary state untuk editing
  const [contact, setContact] = useState(() => {
    const saved = localStorage.getItem("contact");
    return saved ? JSON.parse(saved) : { email: "", phone: "" };
  });

  const { tenants, loadingTenants } = useTenants(preferences);
  const { cart, setCart, changeQty } = useCart();

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [editingPref, setEditingPref] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [tempContact, setTempContact] = useState({ email: "", phone: "" });
  const [toast, setToast] = useState<string>("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const isOffline = getIsMockMode();

  const { startVoiceInput, stopVoiceInput, isListening } = useVoiceOrder({
    tenants,
    setSelectedTenant,
    setCart,
    setCheckoutOpen,
    onVoiceStopped: () => {
      setToast("🎧 Memproses pesanan AI...");
    },
  });

  const handleSelectTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setCart([]); // reset cart
  };

  const handleCheckout = async () => {
    if (!selectedTenant) return;
    setCheckoutLoading(true);

    try {
      const payload = {
        email: contact.email,
        phone: contact.phone,
        tenantId: Number(selectedTenant.id),
        totalAmount: cart.reduce(
          (s, c) => s + c.menuItem.price * c.quantity,
          0,
        ),
        items: mapCartToPayloadItems(cart),
      };

      const res = await checkoutOrder(payload);

      if (res.snapToken && res.snapToken.startsWith("snap-")) {
        window.location.href = `/transaction/${res.orderId}`;
      } else {
        window.location.href = `https://app.sandbox.midtrans.com/snap/v4/redirection/${res.snapToken}`;
      }
    } catch (e) {
      console.error(e);
      setToast("❌ Gagal memproses pesanan.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("contact", JSON.stringify(contact));
  }, [contact]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  // Auto-select tenant if tenantId query parameter is provided
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramTenantId = params.get("tenantId");
    if (paramTenantId && tenants.length > 0) {
      const foundTenant = tenants.find(
        (t) => String(t.id) === String(paramTenantId),
      );
      if (foundTenant) {
        setSelectedTenant(foundTenant);
        // Clean URL to prevent re-opening on reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [tenants]);

  // Sync temp contact details when editing is opened
  const startEditingContact = () => {
    setTempContact({ email: contact.email, phone: contact.phone });
    setEditingContact(true);
  };

  const saveContact = () => {
    setContact(tempContact);
    setEditingContact(false);
    setToast("👤 Detail kontak disimpan.");
  };

  const isTenantSelected = selectedTenant !== null;

  return (
    <div className="h-screen w-screen bg-[#E1E8EB] flex justify-center items-center font-sans overflow-hidden p-0 lg:p-4 text-slate-800">
      {/* Outer App Container with Desktop shadow and borders */}
      <div className="w-full h-full lg:h-[95vh] lg:w-[95vw] lg:max-w-[1396px] bg-[#f0f2f5] lg:rounded-2xl lg:shadow-2xl flex overflow-hidden border border-slate-200/50 relative">
        {/* ==============================================
            LEFT SIDEBAR (Stall lists & settings)
           ============================================== */}
        <aside
          className={`
            w-full lg:w-[400px] flex-shrink-0 border-r border-slate-250 flex flex-col bg-white h-full transition-all duration-300
            ${isTenantSelected ? "hidden lg:flex" : "flex"}
          `}
        >
          {/* Top Profile Header (WhatsApp style) */}
          <div className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between flex-shrink-0 border-b border-slate-200">
            {/* User Profile Avatar */}
            <div className="flex items-center gap-3">
              <div
                onClick={startEditingContact}
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-950 flex items-center justify-center font-bold text-white shadow-2xs text-sm cursor-pointer hover:scale-105 active:scale-95 transition-all"
                title={
                  contact.email
                    ? `Pemesan: ${contact.email}`
                    : "Edit detail kontak"
                }
              >
                {contact.email ? contact.email[0].toUpperCase() : "🥑"}
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-[15px] tracking-tight text-slate-850 flex items-center gap-1">
                  🎪 Festivaloka
                </span>
                {isOffline && (
                  <span className="text-[9px] font-bold text-amber-800 bg-amber-500/10 px-1 py-0.2 rounded-md uppercase">
                    Demo
                  </span>
                )}
              </div>
            </div>

            {/* Utility Icons (Preferences, Maps, Admin Login) */}
            <div className="flex items-center gap-1">
              {/* Preferences Button */}
              <button
                onClick={() => {
                  setTempPreferences(preferences);
                  setEditingPref(true);
                  setPrefOpen(true);
                }}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-650 transition-all active:scale-95"
                title="🎯 Preferensi Kuliner"
              >
                🎯
              </button>

              {/* Peta Bazaar (Link to Map) */}
              <Link
                to="/denah"
                className="p-2 rounded-full hover:bg-slate-200 text-slate-655 transition-all flex items-center justify-center active:scale-95"
                title="🗺️ Peta Bazaar"
              >
                🗺️
              </Link>

              {/* Order History Button */}
              <button
                onClick={() => setHistoryOpen(true)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-650 transition-all active:scale-95 cursor-pointer"
                title="📋 Riwayat Order"
              >
                📋
              </button>

              {/* Admin Panel Link */}
              <Link
                to="/admin/login"
                className="p-2 rounded-full hover:bg-slate-200 text-slate-655 transition-all flex items-center justify-center active:scale-95"
                title="🔑 Portal Admin"
              >
                🔑
              </Link>
            </div>
          </div>

          {/* Tenants List pane */}
          <div className="flex-1 overflow-hidden">
            {loadingTenants ? (
              <div className="p-6 space-y-4">
                <div className="h-4 bg-slate-100 rounded-md animate-pulse w-32"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 animate-pulse flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-slate-100 rounded-md animate-pulse w-3/4"></div>
                        <div className="h-3 bg-slate-100 rounded-md animate-pulse w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <TenantList
                tenants={tenants}
                selectedTenantId={selectedTenant?.id}
                onSelectTenant={handleSelectTenant}
              />
            )}
          </div>
        </aside>

        {/* ==============================================
            RIGHT MAIN CHAT/ORDER DISPLAY
           ============================================== */}
        <main
          className={`
            flex-1 flex flex-col h-full bg-[#f8f9fa] relative overflow-hidden
            ${!isTenantSelected ? "hidden lg:flex" : "flex"}
          `}
        >
          {selectedTenant ? (
            /* ACTIVE CHAT WORKSPACE (Ordering) */
            <WhatsAppChatArea
              tenant={selectedTenant}
              cart={cart}
              onChangeQuantity={changeQty}
              contact={contact}
              onChangeContact={setContact}
              onCheckoutClick={() => setCheckoutOpen(true)}
              onCancel={() => setSelectedTenant(null)}
              isListening={isListening}
              onStartVoice={startVoiceInput}
              onStopVoice={stopVoiceInput}
            />
          ) : (
            /* EMPTY STATE / WELCOME DASHBOARD (WhatsApp desktop style) */
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center justify-center py-10 bg-[#f8f9fa] border-l border-slate-200/40 relative">
              {/* Vertical Centered Banner content */}
              <div className="max-w-[460px] px-6 text-center space-y-6 flex flex-col items-center justify-center">
                {/* Visual Icon with breathing effect */}
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-5xl shadow-sm border border-slate-200 animate-float">
                  🎪
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Festivaloka Desktop
                  </h2>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Selamat datang di panduan kuliner bazaar & antrean live!
                    Pilih stan makanan di sebelah kiri untuk mulai memesan lewat
                    chat, atau gunakan asisten suara AI kami di bawah ini.
                  </p>
                </div>

                {/* Info and Preferences card sections */}
                <div className="w-full space-y-4 pt-2 text-left">
                  {/* 1. Contact profile section */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                        👤 Detail Kontak Anda
                      </span>
                      {!editingContact && (
                        <button
                          onClick={startEditingContact}
                          className="text-xs font-bold text-slate-800 hover:underline"
                        >
                          Ubah
                        </button>
                      )}
                    </div>

                    {editingContact ? (
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">
                            Email Transaksi
                          </label>
                          <input
                            type="email"
                            value={tempContact.email}
                            onChange={(e) =>
                              setTempContact({
                                ...tempContact,
                                email: e.target.value,
                              })
                            }
                            placeholder="nama@email.com"
                            className="w-full bg-[#f0f2f5] border border-transparent rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-200 transition-all shadow-inner-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">
                            No. WhatsApp
                          </label>
                          <input
                            type="tel"
                            value={tempContact.phone}
                            onChange={(e) =>
                              setTempContact({
                                ...tempContact,
                                phone: e.target.value,
                              })
                            }
                            placeholder="08xxxxxxxxxx"
                            className="w-full bg-[#f0f2f5] border border-transparent rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-200 transition-all shadow-inner-sm"
                          />
                        </div>
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            onClick={() => setEditingContact(false)}
                            className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs hover:bg-slate-50 font-semibold"
                          >
                            Batal
                          </button>
                          <button
                            onClick={saveContact}
                            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800 font-semibold"
                          >
                            Simpan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-slate-700 mt-0.5 font-mono">
                        {contact.email
                          ? `${contact.email} • ${contact.phone || "-"}`
                          : "❌ Email belum diisi (Wajib untuk memesan)"}
                      </p>
                    )}
                  </div>

                  {/* 2. Food preferences summary */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                        🎯 Preferensi Kuliner Saya
                      </span>
                    </div>
                    <PreferenceSummary
                      pref={preferences ?? ""}
                      onEdit={() => {
                        setTempPreferences(preferences);
                        setEditingPref(true);
                        setPrefOpen(true);
                      }}
                    />
                  </div>

                  {/* 3. Live queue history tracker */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs">
                    <OrderHistorySection />
                  </div>
                </div>

                {/* Voice Bar block */}
                <div className="w-full pt-2">
                  <VoiceAIBar
                    isListening={isListening}
                    onStart={startVoiceInput}
                    onStop={stopVoiceInput}
                    stickBottom={false}
                  />
                </div>

                {/* Bottom official footer stamp */}
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 justify-center pt-4">
                  <span>🔒</span>
                  <span>
                    Sistem Pembayaran Terenkripsi & Resmi Terintegrasi Midtrans
                    Snap
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Global Popup Preference form modal */}
        {prefOpen && editingPref && (
          <PreferenceForm
            value={tempPreferences}
            onChange={setTempPreferences}
            onSubmit={() => {
              setPreferences(tempPreferences);
              localStorage.setItem("preferences", tempPreferences);
              setEditingPref(false);
              setPrefOpen(false);
              setToast("🎯 Preferensi kuliner Anda diperbarui!");
            }}
            onClose={() => {
              setEditingPref(false);
              setPrefOpen(false);
            }}
          />
        )}

        {/* Final Payment Confirmation overlay modal */}
        <CheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          cart={cart}
          preferences={preferences}
          contact={contact}
          onContactChange={setContact}
          onConfirm={handleCheckout}
          loading={checkoutLoading}
        />

        {/* Global Order History modal */}
        {historyOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setHistoryOpen(false)}
          >
            <div
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-slide-up relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setHistoryOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
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
              <div className="mt-2 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
                <OrderHistorySection />
              </div>
            </div>
          </div>
        )}

        {/* Floating toast notes */}
        {toast && (
          <div
            className="
              fixed top-8 left-1/2 -translate-x-1/2
              bg-slate-850 text-white text-[11px] font-semibold uppercase tracking-wider px-5 py-3 rounded-xl shadow-xl
              animate-fade-in z-50 flex items-center gap-2 backdrop-blur-md border border-slate-700/30
            "
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
