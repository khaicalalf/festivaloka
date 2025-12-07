/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../api/client";
import { useNavigate } from "react-router-dom";
import type { Tenant, MenuItem } from "../../types";
import { CreateTenantForm } from "../../components/admin/CreateTenantForm";
import { createMenu, deleteMenuApi, updateMenu } from "../../api/menu";
import { OrderHistory } from "../../components/admin/OrderHistory";

const MenuModal = ({
  menu,
  isOpen,
  onClose,
  onSave,
}: {
  menu: Partial<MenuItem> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description: string; price: number }) => void;
}) => {
  const [name, setName] = useState(menu?.name ?? "");
  const [description, setDescription] = useState(menu?.description ?? "");
  const [price, setPrice] = useState(menu?.price ?? 0);

  useEffect(() => {
    if (menu) {
      setName(menu.name ?? "");
      setDescription(menu.description ?? "");
      setPrice(menu.price ?? 0);
    }
  }, [menu]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description, price: Number(price) });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border rounded-xl p-6 w-full max-w-md space-y-5">
        {/* Header */}
        <h3 className="text-lg font-semibold tracking-tight">
          {menu?.id ? "Edit Menu" : "Tambah Menu"}
        </h3>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-gray-600">Nama Menu</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black/20 focus:border-black/30 outline-none"
              placeholder="Cth: Seblak Spesial"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-gray-600">Deskripsi</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:ring-1 focus:ring-black/20 focus:border-black/30 outline-none"
              placeholder="Deskripsi singkat menu..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-gray-600">Harga (Rp)</label>
            <input
              type="number"
              min={0}
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black/20 focus:border-black/30 outline-none"
              placeholder="Contoh: 15000"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm border rounded-lg bg-white hover:bg-gray-50"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-4 py-1.5 text-sm rounded-lg bg-black text-white hover:bg-gray-900"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ====================================================================
// --- KOMPONEN UTAMA: AdminDashboard ---
// ====================================================================
export default function AdminDashboard() {
  const { admin } = useAuth();
  const navigate = useNavigate();

  // Ambil tenantId & Role
  const adminTenantId = admin?.tenantId;
  const adminTenantIdString = adminTenantId ? String(adminTenantId) : null;
  const isAdminNull = adminTenantId === null; // True jika Super Admin

  // State
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(
    adminTenantIdString
  );
  const [tenantData, setTenantData] = useState<Tenant | null>(null);

  // State untuk form menu
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<Partial<MenuItem> | null>(
    null
  );

  // Loading & Error states
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [tenantLoading, setTenantLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleLogout = () => {
    localStorage.removeItem("admin_auth"); // hapus sesi
    navigate("/admin/login", { replace: true }); // redirect
  };

  // Prepare auth headers
  const token = admin?.access_token;
  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  );

  // --- HANDLER MENU LOKAL (Hardcoded) ---

  const handleOpenMenuModal = (menu?: MenuItem) => {
    // FIX: Konversi Date.now() ke String agar sesuai dengan type MenuItem.id
    setCurrentMenu(
      menu || {
        id: "",
        name: "",
        description: "",
        price: 0,
        tenantId: adminTenantId!,
      }
    );
    setIsMenuModalOpen(true);
  };

  const handleDeleteMenu = async (menuId: number | string) => {
    if (!tenantData) return;
    if (!confirm("Yakin hapus menu?")) return;

    try {
      await deleteMenuApi(menuId);
      await loadTenantData();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus menu");
    }
  };

  // 1. Load daftar tenants (tetap sama)
  const loadTenants = useCallback(async () => {
    if (isAdminNull) return;

    setError("");
    setTenantsLoading(true);
    try {
      const data = await apiClient.request<Tenant[]>("/api/tenants", {
        headers: authHeaders,
      });
      setTenants(data);

      if (admin?.tenantId) {
        setSelectedTenantId(String(admin.tenantId));
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Gagal memuat tenants");
    } finally {
      setTenantsLoading(false);
    }
  }, [authHeaders, admin?.tenantId, isAdminNull]);

  useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

  // 2. Load detail data tenant (tetap sama)
  const loadTenantData = useCallback(async () => {
    if (isAdminNull) {
      setTenantData(null);
      return;
    }

    const idToLoad = selectedTenantId;
    if (!idToLoad) {
      setTenantData(null);
      return;
    }

    setError("");
    setTenantLoading(true);
    try {
      const data = await apiClient.request<Tenant>(`/api/tenants/${idToLoad}`, {
        headers: authHeaders,
      });
      setTenantData(data);
    } catch (err) {
      console.error(err);
      setTenantData(null);
      setError(err instanceof Error ? err.message : "Gagal memuat data tenant");
    } finally {
      setTenantLoading(false);
    }
  }, [selectedTenantId, authHeaders, isAdminNull]);

  useEffect(() => {
    void loadTenantData();
  }, [loadTenantData]);

  // Cari nama tenant untuk ditampilkan di input read-only (tetap sama)
  const currentTenantName = useMemo(() => {
    if (tenantData) return tenantData.name;
    const found = tenants.find((t) => String(t.id) === selectedTenantId);
    return found ? found.name : "Memuat nama...";
  }, [tenants, selectedTenantId, tenantData]);

  const handleSaveMenu = async (menuData: {
    name: string;
    description: string;
    price: number;
  }) => {
    if (!tenantData) return;

    const tenantId = tenantData.id;

    try {
      if (currentMenu?.id) {
        // EDIT
        await updateMenu(currentMenu.id, menuData);
      } else {
        // CREATE
        await createMenu(tenantId, menuData);
      }

      // Refresh dari API agar 100% akurat
      await loadTenantData();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan menu");
    } finally {
      setIsMenuModalOpen(false);
      setCurrentMenu(null);
    }
  };

  // --- RENDERING KOMPONEN ---

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">
            Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs sm:text-sm text-indigo-100 text-center">
              Welcome, <strong className="text-white">{admin?.email}</strong>
              <br className="sm:hidden" /> (Role: {admin?.role} - ID:{" "}
              {adminTenantIdString || "Global"})
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm border border-red-200 shadow-sm">
            {error}
          </div>
        )}

        {/* --- TAMPILAN KHUSUS SUPER ADMIN --- */}
        {isAdminNull && <CreateTenantForm onCreated={loadTenants} />}

        {/* --- TAMPILAN UNTUK TENANT ADMIN / KARYAWAN --- */}
        {!isAdminNull && (
          <>
            {/* Tenant Display (Read Only) */}
            <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant Aktif
              </label>
              {tenantsLoading && !tenantData ? (
                <div className="h-10 w-full bg-gray-200 animate-pulse rounded-lg"></div>
              ) : (
                <input
                  type="text"
                  value={currentTenantName}
                  readOnly
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 shadow-inner focus:outline-none cursor-not-allowed font-medium"
                />
              )}
            </div>

            {/* History Order Section */}
            <OrderHistory tenantId={Number(tenantData?.id)} />

            {/* TENANT INFO & MENUS */}
            {tenantLoading ? (
              <div className="space-y-4">
                <div className="h-16 bg-gray-100 rounded-md animate-pulse" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-24 bg-gray-100 rounded-md animate-pulse" />
                  <div className="h-24 bg-gray-100 rounded-md animate-pulse" />
                  <div className="h-24 bg-gray-100 rounded-md animate-pulse" />
                </div>
              </div>
            ) : tenantData ? (
              <div className="bg-white border rounded-xl p-6 space-y-5">
                {/* HEADER */}
                <div className="flex justify-between items-start pb-4 border-b">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      {tenantData.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {tenantData.description}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 text-xs font-medium border rounded-md text-gray-700 bg-gray-50">
                      {tenantData.category}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-medium border rounded-md text-emerald-700 bg-emerald-50">
                      {tenantData.status}
                    </span>
                  </div>
                </div>

                {/* MENU */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium tracking-tight">Menu Tenant</h3>
                    <button
                      onClick={() => handleOpenMenuModal()}
                      className="text-sm px-3 py-1.5 rounded-md bg-black text-white hover:bg-gray-800 transition"
                    >
                      + Tambah
                    </button>
                  </div>

                  {tenantData.menus.length === 0 ? (
                    <div className="py-8 border rounded-lg text-center text-gray-500 bg-gray-50">
                      Belum ada menu ditambahkan.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {tenantData.menus.map((menu) => (
                        <div
                          key={menu.id}
                          className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-800 leading-tight">
                              {menu.name}
                            </h4>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">
                              Rp{menu.price.toLocaleString("id-ID")}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 line-clamp-2">
                            {menu.description}
                          </p>

                          <div className="flex justify-end gap-2 pt-3 mt-3 border-t">
                            <button
                              onClick={() => handleOpenMenuModal(menu)}
                              className="text-xs px-3 py-1 rounded border bg-white hover:bg-gray-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMenu(menu.id)}
                              className="text-xs px-3 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-white border rounded-xl">
                <p className="text-gray-500">Tenant tidak ditemukan.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL MENU */}
      {currentMenu && (
        <MenuModal
          menu={currentMenu}
          isOpen={isMenuModalOpen}
          onClose={() => setIsMenuModalOpen(false)}
          onSave={handleSaveMenu}
        />
      )}
    </div>
  );
}
