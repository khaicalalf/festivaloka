import { useEffect, useState } from "react";
import { usePreferences } from "../hooks/usePrefrerences";
import { PreferenceForm } from "../components/preferences/PreferenceForm";
import { TenantList } from "../components/tenants/TenantList";
import { OrderForm } from "../components/order/OrderForm";
import { CheckoutModal } from "../components/order/CheckoutModal";
import type { CartItem, MenuItem, Tenant } from "../types";
import { fetchTenants, fetchTenantMenu } from "../api/tenants";
import { createTransaction, mapCartToPayloadItems } from "../api/transactions";
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

  //const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoadingTenants(true);
      try {
        const data = await fetchTenants();
        setTenants(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingTenants(false);
      }
    };
    load();
  }, []);

  const handleSelectTenant = async (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setCart([]); // reset pesanan jika ganti tenant
    setLoadingMenu(true);
    try {
      const data = await fetchTenantMenu(tenant.id);
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
      const payload = {
        tenantId: selectedTenant.id,
        items: mapCartToPayloadItems(cart),
        email: contact.email || undefined,
        phone: contact.phone,
        preferences,
      };

      const res = await createTransaction(payload);

      // optional: simpan uuid terakhir kalau mau
      // window.localStorage.setItem("last-transaction-uuid", res.uuid);

      // langsung lempar ke Midtrans
      window.location.href = res.redirectUrl;
    } catch (e) {
      console.error(e);
      setCheckoutLoading(false);
      // di real app, tampilkan toast error
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold mb-2">Food Court Digital</h1>
      <p className="text-sm text-gray-600 mb-4">
        Masukkan preferensi makanmu, pilih tenant, pesan, dan bayar via
        Midtrans. Nanti nomor antrian & estimasi selesai muncul di halaman
        transaksi.
      </p>

      <PreferenceForm
        value={preferences}
        onChange={setPreferences}
        onSubmit={() => {
          // di sini sebenarnya cukup disimpan via hook, boleh tambahin toast
        }}
      />

      <section className="space-y-2">
        <h2 className="font-semibold text-lg">Pilih Tenant</h2>
        {loadingTenants ? (
          <p className="text-sm text-gray-500">Memuat tenant...</p>
        ) : (
          <TenantList tenants={tenants} onSelectTenant={handleSelectTenant} />
        )}
      </section>

      {selectedTenant && (
        <section>
          {loadingMenu ? (
            <p className="text-sm text-gray-500 mt-2">Memuat menu...</p>
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
