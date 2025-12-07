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
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Food Court Digital</h1>
        <Link
          to="/denah"
          className="block text-center bg-black text-white py-4 px-4 rounded-xl shadow-md hover:bg-neutral-900 transition-all duration-200 animate-slide-up"
        >
          Denah Tenant
        </Link>
      </div>

      <section>
        {prefOpen && editingPref ? (
          <PreferenceForm
            value={tempPreferences}
            onChange={setTempPreferences}
            onSubmit={() => {
              // Update preferences state HANYA saat klik simpan
              setPreferences(tempPreferences);
              localStorage.setItem("preferences", tempPreferences);
              setEditingPref(false);
              //setIsCollapsed(true);
            }}
            onClose={() => {
              setEditingPref(false);
              setPrefOpen(false);
              //setIsCollapsed(true);
            }}
          />
        ) : (
          <PreferenceSummary
            pref={preferences ?? ""}
            onEdit={() => {
              // Initialize tempPreferences dengan nilai preferences saat ini
              setTempPreferences(preferences);
              setEditingPref(true);
              setPrefOpen(true);
              //setIsCollapsed(false);
            }}
          />
        )}
      </section>
      <OrderHistorySection />

      {/* Voice AI Section — moves based on context */}
      <div className={`${isTenantSelected ? "mt-2" : ""}`}>
        <VoiceAIBar
          isListening={isListening}
          onStart={startVoiceInput}
          onStop={stopVoiceInput}
          stickBottom={!isTenantSelected}
        />
      </div>

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
    </div>
  );
}
