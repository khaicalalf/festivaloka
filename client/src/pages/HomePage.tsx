import { useEffect, useState } from "react";
import { usePreferences } from "../hooks/usePrefrerences";
import { PreferenceForm } from "../components/preferences/PreferenceForm";
import { TenantList } from "../components/tenants/TenantList";
import { OrderForm } from "../components/order/OrderForm";
import { CheckoutModal } from "../components/order/CheckoutModal";
import type { CartItem, MenuItem, Tenant } from "../types";
import { fetchTenants, fetchTenantMenu, checkoutOrder } from "../api/tenants";
import { mapCartToPayloadItems } from "../api/transactions";
import { PreferenceSummary } from "../components/preferences/PreferenceSummary";
//import { useNavigate } from "react-router-dom";

export function HomePage() {
  const { preferences, setPreferences } = usePreferences();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [contact, setContact] = useState({ email: "", phone: "" });
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [editingPref, setEditingPref] = useState(() => {
    // jika preferences dari localStorage masih default → auto edit mode
    return false;
  });

  // quick check untuk tau apakah user sudah pernah isi preferensi
  const isDefault =
    preferences.notes === "" &&
    preferences.spicyLevel === "medium" &&
    preferences.halalOnly === true;

  //const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoadingTenants(true);

      const tenantsPromise = fetchTenants();
      // misal kamu mau prefetch default tenant dulu

      const [tenants] = await Promise.all([tenantsPromise]);

      setTenants(tenants);

      setLoadingTenants(false);
    };

    load();
  }, []);

  const handleSelectTenant = async (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setCart([]); // reset pesanan jika ganti tenant
    setLoadingMenu(true);
    try {
      const data = await fetchTenantMenu(tenant.id);
      setSelectedTenant(data);
      setMenu(data.menus);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMenu(false);
    }
  };

  const handleChangeQuantity = (menuItem: MenuItem, quantity: number) => {
    setCart((prev) => {
      // hapus jika quantity 0
      if (quantity === 0) {
        return prev.filter((c) => c.menuItem.id !== menuItem.id);
      }
      const existing = prev.find((c) => c.menuItem.id === menuItem.id);
      if (!existing) {
        return [...prev, { menuItem, quantity }];
      }
      return prev.map((c) =>
        c.menuItem.id === menuItem.id ? { ...c, quantity } : c
      );
    });
  };

  const handleCheckoutConfirm = async () => {
    if (!selectedTenant) return;

    setCheckoutLoading(true);

    try {
      const items = mapCartToPayloadItems(cart);

      const payload = {
        email: contact.email,
        phone: contact.phone,
        tenantId: Number(selectedTenant.id),
        totalAmount: Number(
          cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0)
        ),
        items,
      };
      console.log("Checkout payload:", payload);
      const res = await checkoutOrder(payload);
      console.log("Checkout response:", res);
      // Redirect ke Midtrans Snap
      window.location.href = `https://app.sandbox.midtrans.com/snap/v4/redirection/${res.snapToken}`;
    } catch (e: unknown) {
      console.error("Checkout error:", e);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold mb-2">Food Court Digital</h1>
      <section className="mb-4">
        {editingPref || isDefault ? (
          <PreferenceForm
            value={preferences}
            onChange={setPreferences}
            onSubmit={() => {
              setEditingPref(false);
            }}
          />
        ) : (
          <PreferenceSummary
            pref={preferences}
            onEdit={() => setEditingPref(true)}
          />
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-lg">Pilih Tenant</h2>
        {loadingTenants ? (
          <div className="animate-pulse bg-gray-200 h-24 rounded-md"></div>
        ) : (
          <TenantList tenants={tenants} onSelectTenant={handleSelectTenant} />
        )}
      </section>

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

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        preferences={preferences}
        contact={contact}
        onConfirm={handleCheckoutConfirm}
        loading={checkoutLoading}
      />
    </div>
  );
}
