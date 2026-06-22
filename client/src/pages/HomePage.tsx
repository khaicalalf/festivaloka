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
      
      // If mock token returned, redirect directly to our local receipt summary page
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 pb-24">
      
      {/* Header with glassmorphism */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent flex items-center gap-2">
                  <svg
                    className="w-7 h-7 text-rose-500"
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
                  Festivaloka
                </h1>
                {isOffline && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 animate-pulse-slow">
                    Demo Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Digital Food Court & Order Navigator
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                to="/admin/login"
                className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition"
              >
                Admin
              </Link>
              <Link
                to="/denah"
                className="px-5 py-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl font-semibold shadow-lg shadow-rose-950/20 transition-all duration-200"
              >
                Denah Stan
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        
        {/* Upper Dashboard Grid: Preferences & Order History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preferences Box */}
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/5 rounded-full filter blur-2xl pointer-events-none"></div>
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

          {/* History Box */}
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-violet-500/5 rounded-full filter blur-2xl pointer-events-none"></div>
            <OrderHistorySection />
          </section>
        </div>

        {/* Voice AI Panel */}
        <div className={isTenantSelected ? "mt-2" : "mt-6"}>
          <VoiceAIBar
            isListening={isListening}
            onStart={startVoiceInput}
            onStop={stopVoiceInput}
            stickBottom={!isTenantSelected}
          />
        </div>

        {/* List of food stalls */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
          {loadingTenants ? (
            <div className="space-y-4">
              <div className="h-6 w-48 bg-slate-800 rounded-md animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-44 bg-slate-800 rounded-3xl animate-pulse"></div>
                <div className="h-44 bg-slate-800 rounded-3xl animate-pulse"></div>
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

        {/* Cart Order Form Drawer */}
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

        {/* Checkout modal sheet */}
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

        {/* Toast alerts */}
        {toast && (
          <div
            className="
              fixed top-24 left-1/2 -translate-x-1/2
              bg-slate-900 border border-slate-700/80 text-slate-100 text-sm px-5 py-3 rounded-2xl shadow-2xl
              animate-fade-in z-50 flex items-center gap-2 font-medium backdrop-blur-md
            "
          >
            {toast}
          </div>
        )}
      </main>
    </div>
  );
}
