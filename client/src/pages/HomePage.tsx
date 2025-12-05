import { useState, useEffect } from "react";
import { useTenants } from "../hooks/useTenants";
//import { useTenantMenu } from "../hooks/useTenantMenu";
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

export function HomePage() {
  const [preferences, setPreferences] = useState(
    localStorage.getItem("preferences") ?? ""
  );
  const [contact, setContact] = useState(() => {
    const saved = localStorage.getItem("contact");
    return saved ? JSON.parse(saved) : { email: "", phone: "" };
  });

  const { tenants, loadingTenants } = useTenants(preferences);
  const { cart, setCart, changeQty } = useCart();

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(true);
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
      <h1 className="text-2xl font-bold">Food Court Digital</h1>

      {/* Preferensi */}
      <section>
        {!isCollapsed || editingPref ? (
          <PreferenceForm
            value={preferences ?? ""}
            onChange={setPreferences}
            onSubmit={() => {
              localStorage.setItem("preferences", preferences);
              setEditingPref(false);
              setIsCollapsed(true);
            }}
            onClose={() => {
              setEditingPref(false);
              setIsCollapsed(true);
            }}
          />
        ) : (
          <PreferenceSummary
            pref={preferences ?? ""}
            onEdit={() => {
              setEditingPref(true);
              setIsCollapsed(false);
            }}
          />
        )}
      </section>

      {isListening ? (
        <button
          onClick={stopVoiceInput}
          className="px-4 py-2 bg-red-600 text-white rounded animate-pulse"
        >
          ⏹ Stop Mendengarkan
        </button>
      ) : (
        <button
          onClick={startVoiceInput}
          className="px-4 py-2 bg-black text-white rounded"
        >
          🎤 Bicara ke AI
        </button>
      )}

      {isListening && (
        <p className="text-xs text-red-500 mt-1 animate-pulse">
          Sedang mendengarkan…
        </p>
      )}

      {loadingTenants ? (
        <div className="animate-pulse h-24 bg-gray-200 rounded"></div>
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
    fixed bottom-6 left-1/2 -translate-x-1/2
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
