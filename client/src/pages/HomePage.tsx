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

  //const [isCollapsed, setIsCollapsed] = useState(true);
  const [editingPref, setEditingPref] = useState(false);
  const [toast, setToast] = useState<string>("");

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

    const payload = {
      email: contact.email,
      phone: contact.phone,
      tenantId: Number(selectedTenant.id),
      totalAmount: cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0),
      items: mapCartToPayloadItems(cart),
    };

    const res = await checkoutOrder(payload);
    window.location.href = `https://app.sandbox.midtrans.com/snap/v4/redirection/${res.snapToken}`;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
      {/* Header */}
      <header className="border-b-2 border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div>
              <h1 className="text-md font-medium md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 md:w-7 md:h-7"
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
                Food Court Digital
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Pesan makanan dengan mudah dan cepat
              </p>
            </div>
            <Link
              to="/denah"
              className="p-4 text-md md:text-lg block text-center bg-[#FF385C] text-white rounded-xl shadow-md hover:bg-[#E31C5F] transition-all duration-200 animate-slide-up"
            >
              Denah
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Premium Grid Layout for Preferences & History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preferences Section */}
          <section>
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
          <section>
            <OrderHistorySection />
          </section>
        </div>

        {/* Voice AI Section */}
        <div className={`${isTenantSelected ? "mt-2" : ""}`}>
          <VoiceAIBar
            isListening={isListening}
            onStart={startVoiceInput}
            onStop={stopVoiceInput}
            stickBottom={!isTenantSelected}
          />
        </div>

        {/* Tenant List */}
        {loadingTenants ? (
          <div className="animate-pulse h-24 mb-20 bg-gray-200 rounded"></div>
        ) : (
          <TenantList
            tenants={tenants}
            selectedTenantId={selectedTenant?.id}
            onSelectTenant={handleSelectTenant}
          />
        )}

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

        {toast && (
          <div
            className="
    fixed top-8 left-1/2 -translate-x-1/2
    bg-black text-white text-sm px-4 py-2 rounded-lg shadow-lg
    animate-fade-in
  "
          >
            {toast}
          </div>
        )}
      </main>
    </div>
  );
}
