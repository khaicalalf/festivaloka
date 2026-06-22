import { useState, useEffect } from "react";
import { useTenants } from "../hooks/useTenants";
import { useCart } from "../hooks/useCart";
import { useVoiceOrder } from "../hooks/useVoiceOrder";
import type { Tenant } from "../types";
import { PreferenceForm } from "../components/preferences/PreferenceForm";
import { PreferenceSummary } from "../components/preferences/PreferenceSummary";
import { TenantList } from "../components/tenants/TenantList";
import { OrderForm } from "../components/order/OrderForm";
import { CheckoutModal } from "../components/order/CheckoutModal";
import { checkoutOrder } from "../api/tenants";
import { mapCartToPayloadItems } from "../api/transactions";
import { OrderHistorySection } from "../components/history/OrderHistorySection";
import { VoiceAIBar } from "../components/order/VoiceAIBar";
import { Link } from "react-router-dom";
import { getIsMockMode } from "../api/client";

export function HomePage() {
  const [preferences, setPreferences] = useState(
    localStorage.getItem("preferences") ?? ""
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

  const isTenantSelected = selectedTenant !== null;
  const [editingPref, setEditingPref] = useState(false);
  const [toast, setToast] = useState<string>("");
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
        totalAmount: cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0),
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

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-slate-800 flex flex-col font-sans selection:bg-amber-500/20 pb-24 relative overflow-hidden">
      
      {/* Header with Warm Paper style */}
      <header className="border-b-4 border-[#EADFC9] bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
                  <span className="text-2xl">🎪</span>
                  Festivaloka
                </h1>
                {isOffline && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-800 border-2 border-amber-500/20">
                    Mode Demo
                  </span>
                )}
              </div>
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mt-0.5">
                Panduan Jajanan & Antrean Bazaar
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                to="/admin/login"
                className="px-4 py-2 border-2 border-[#E5DEC9] bg-white text-slate-600 hover:text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider transition hover:bg-[#FCFBF8] shadow-sm"
              >
                Masuk Admin
              </Link>
              <Link
                to="/denah"
                className="px-5 py-2.5 bg-[#E2725B] hover:bg-[#C55743] border-2 border-[#C55743] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#A53D2A] transition-all duration-200"
              >
                Peta Bazaar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 z-10 relative">
        
        {/* Playful Headline */}
        <div className="bg-[#FAF6EC] border-2 border-dashed border-[#E5DEC9] rounded-3xl p-6 text-center">
          <h2 className="text-lg sm:text-xl font-black text-slate-850">
            Lagi di Festivaloka? Jajan yuk! 🍢
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Pesan menu favoritmu dari tenda kuliner mana saja tanpa repot antre panjang. Bisa pakai suara juga lho!
          </p>
        </div>

        {/* Upper Grid: Preferences & Order History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preferences Section */}
          <section className="bg-white border-2 border-[#E5DEC9] rounded-[2rem] p-6 shadow-[4px_4px_0px_0px_#E5DEC9]">
            {prefOpen && editingPref ? (
              <PreferenceForm
                value={tempPreferences}
                onChange={setTempPreferences}
                onSubmit={() => {
                  setPreferences(tempPreferences);
                  localStorage.setItem("preferences", tempPreferences);
                  setEditingPref(false);
                }}
                onClose={() => {
                  setEditingPref(false);
                  setPrefOpen(false);
                }}
              />
            ) : (
              <PreferenceSummary
                pref={preferences ?? ""}
                onEdit={() => {
                  setTempPreferences(preferences);
                  setEditingPref(true);
                  setPrefOpen(true);
                }}
              />
            )}
          </section>

          {/* Order History Section */}
          <section className="bg-white border-2 border-[#E5DEC9] rounded-[2rem] p-6 shadow-[4px_4px_0px_0px_#E5DEC9]">
            <OrderHistorySection />
          </section>
        </div>

        {/* Voice AI Assistant Section */}
        <div className={isTenantSelected ? "mt-2" : "mt-6"}>
          <VoiceAIBar
            isListening={isListening}
            onStart={startVoiceInput}
            onStop={stopVoiceInput}
            stickBottom={!isTenantSelected}
          />
        </div>

        {/* Food Court Tenants Card Container */}
        <section className="bg-white border-2 border-[#E5DEC9] rounded-[2.5rem] p-8 shadow-[4px_4px_0px_0px_#E5DEC9]">
          {loadingTenants ? (
            <div className="space-y-4">
              <div className="h-6 w-48 bg-slate-100 rounded-md animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-44 bg-slate-100 rounded-[2rem] animate-pulse"></div>
                <div className="h-44 bg-slate-100 rounded-[2rem] animate-pulse"></div>
              </div>
            </div>
          ) : (
            <TenantList
              tenants={tenants}
              selectedTenantId={selectedTenant?.id}
              onSelectTenant={handleSelectTenant}
            />
          )}
        </section>

        {/* Selected food stall cart menu drawer */}
        {selectedTenant && (
          <OrderForm
            tenantName={selectedTenant.name}
            menu={selectedTenant.menus}
            cart={cart}
            onChangeQuantity={changeQty}
            contact={contact}
            onChangeContact={setContact}
            onCheckoutClick={() => setCheckoutOpen(true)}
            onCancel={() => setSelectedTenant(null)}
          />
        )}

        {/* Payment Confirmation sheet */}
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

        {/* Floating toast notes */}
        {toast && (
          <div
            className="
              fixed top-24 left-1/2 -translate-x-1/2
              bg-white border-2 border-slate-800 text-slate-800 text-xs font-black uppercase tracking-wider px-6 py-4 rounded-2xl shadow-xl
              animate-fade-in z-50 flex items-center gap-2 backdrop-blur-md
            "
          >
            {toast}
          </div>
        )}
      </main>
    </div>
  );
}
