import { useEffect, useState } from "react";
//import { usePreferences } from "../hooks/usePrefrerences";
import { PreferenceForm } from "../components/preferences/PreferenceForm";
import { PreferenceSummary } from "../components/preferences/PreferenceSummary";
import { TenantList } from "../components/tenants/TenantList";
import { OrderForm } from "../components/order/OrderForm";
import { CheckoutModal } from "../components/order/CheckoutModal";
import type { CartItem, MenuItem, Tenant } from "../types";
import { fetchTenantMenu, checkoutOrder } from "../api/tenants";
import { fetchTenants, getTenantsByAI } from "../api/tenants";
import { mapCartToPayloadItems } from "../api/transactions";

export function HomePage() {
  const [preferences, setPreferences] = useState<string>(
    localStorage.getItem("preferences") ?? ""
  );

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [contact, setContact] = useState({ email: "", phone: "" });

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [editingPref, setEditingPref] = useState(false);

  /* ============================
      FETCH TENANTS BY AI
  ============================= */
  useEffect(() => {
    const loadTenants = async () => {
      setLoadingTenants(true);

      try {
        // 1. coba API AI dulu
        const aiTenants = await getTenantsByAI(
          preferences ? JSON.stringify(preferences) : ""
        );

        // Kalau AI balikin array kosong → fallback juga
        if (!aiTenants || aiTenants.length === 0) {
          console.warn("AI returned empty tenants, fallback to fetchTenants()");
          const normalTenants = await fetchTenants();
          setTenants(normalTenants);
        } else {
          setTenants(aiTenants);
        }
      } catch (err) {
        console.error("AI fetch error, fallback:", err);

        // 2. fallback apabila error
        try {
          const normalTenants = await fetchTenants();
          setTenants(normalTenants);
        } catch (e) {
          console.error("Fallback fetchTenants() also failed:", e);
        }
      } finally {
        setLoadingTenants(false);
      }
    };

    loadTenants();
  }, [preferences]);

  /* ============================
      SELECT TENANT → MENU
  ============================= */
  const handleSelectTenant = async (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setCart([]);
    setLoadingMenu(true);

    try {
      const fullTenant = await fetchTenantMenu(tenant.id);
      setSelectedTenant(fullTenant);
      setMenu(fullTenant.menus);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMenu(false);
    }
  };

  /* CART LOGIC */
  const handleChangeQuantity = (menuItem: MenuItem, qty: number) => {
    setCart((prev) => {
      if (qty === 0) return prev.filter((c) => c.menuItem.id !== menuItem.id);

      const exist = prev.find((c) => c.menuItem.id === menuItem.id);
      if (!exist) return [...prev, { menuItem, quantity: qty }];

      return prev.map((c) =>
        c.menuItem.id === menuItem.id ? { ...c, quantity: qty } : c
      );
    });
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browser kamu tidak mendukung voice input.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      console.log("Voice input:", transcript);
      await processVoiceCommand(transcript);
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e);
    };

    recognition.start();
  };

  const applyAIRecommendation = async (
    tenantId: string,
    menuId: number,
    quantity: number
  ) => {
    // 1. Fetch tenant

    const tenantData = await fetchTenantMenu(tenantId);
    setSelectedTenant(tenantData);
    setMenu(tenantData.menus);

    // 2. Cari menu yang dipilih AI
    const menuItem = tenantData.menus.find((m) => Number(m.id) === menuId);
    if (!menuItem) return;

    // 3. Masukkan ke cart
    setCart([{ menuItem, quantity }]);

    // 4. Buka modal checkout
    setCheckoutOpen(true);
  };

  const processVoiceCommand = async (text: string) => {
    try {
      const res = await fetch(
        "https://festivaloka-dev.up.railway.app/api/kolosal-ai/voice-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: text }),
        }
      );

      const data = await res.json();

      const { tenantId, menuId, quantity } = data;

      await applyAIRecommendation(tenantId, menuId, quantity);
    } catch (e) {
      console.error("Voice AI error:", e);
    }
  };

  /* CHECKOUT */
  const handleCheckoutConfirm = async () => {
    if (!selectedTenant) return;

    setCheckoutLoading(true);

    try {
      const items = mapCartToPayloadItems(cart);
      const total = cart.reduce(
        (sum, c) => sum + c.menuItem.price * c.quantity,
        0
      );

      const payload = {
        email: contact.email,
        phone: contact.phone,
        tenantId: Number(selectedTenant.id),
        totalAmount: total,
        items,
      };

      const res = await checkoutOrder(payload);
      window.location.href = `https://app.sandbox.midtrans.com/snap/v4/redirection/${res.snapToken}`;
    } catch (e) {
      console.error("Checkout error:", e);
    } finally {
      setCheckoutLoading(false);
    }
  };

  /* ============================
      RENDER
  ============================= */
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold mb-2">Food Court Digital</h1>

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
      <button
        onClick={startVoiceInput}
        className="px-4 py-2 rounded-lg bg-black text-white text-sm shadow"
      >
        🎤 Bicara ke AI
      </button>

      {/* Tenant List */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">Rekomendasi Tenant</h2>

        {loadingTenants ? (
          <div className="animate-pulse bg-gray-200 h-24 rounded-md"></div>
        ) : (
          <TenantList tenants={tenants} onSelectTenant={handleSelectTenant} />
        )}
      </section>

      {/* Tenant Menu */}
      {selectedTenant && (
        <section>
          {loadingMenu ? (
            <div className="animate-pulse bg-gray-200 h-24 rounded-md"></div>
          ) : (
            <OrderForm
              tenantName={selectedTenant.name}
              menu={menu}
              cart={cart}
              onChangeQuantity={handleChangeQuantity}
              contact={contact}
              onChangeContact={setContact}
              onCheckoutClick={() => setCheckoutOpen(true)}
            />
          )}
        </section>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        preferences={preferences ? JSON.stringify(preferences) : ""}
        contact={contact}
        onContactChange={setContact}
        onConfirm={handleCheckoutConfirm}
        loading={checkoutLoading}
      />
    </div>
  );
}
