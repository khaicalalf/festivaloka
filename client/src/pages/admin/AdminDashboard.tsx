import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../api/client";
import { useNavigate } from "react-router-dom";
import type { Tenant, MenuItem } from "../../types";

// ====================================================================
// --- KOMPONEN DUMMY: RIWAYAT ORDER (HARDCODE) ---
// ====================================================================
const OrderHistory = () => {
  const dummyOrders = [
    { id: 1, date: "2025-11-01", total: 45000, status: "SUCCESS" },
    { id: 2, date: "2025-11-01", total: 72000, status: "PENDING" },
    { id: 3, date: "2025-11-02", total: 110000, status: "CANCELLED" },
  ];
  return (
    <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-4 md:p-6 space-y-4 border border-gray-100">
      <h3 className="text-lg md:text-xl font-bold text-gray-900 border-b pb-3 mb-4">
        Riwayat Order (Transaksi)
      </h3>
      <div className="space-y-3">
        {dummyOrders.map((order) => (
          <div
            key={order.id}
            className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-gray-50 rounded-lg shadow-sm"
          >
            <span className="text-sm font-medium text-gray-700">
              Order **#{order.id}** ({order.date})
            </span>
            <div className="flex items-center gap-3 mt-1 sm:mt-0">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  order.status === "SUCCESS"
                    ? "bg-green-100 text-green-800"
                    : order.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {order.status}
              </span>
              <span className="font-bold text-base md:text-lg text-indigo-600">
                Rp{order.total.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ====================================================================
// --- KOMPONEN DUMMY: FORM TENANT BARU (UNTUK SUPER ADMIN) ---
// ====================================================================
const CreateTenantForm = () => {
  return (
    <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-4 md:p-6 space-y-4 border border-gray-100">
      <h2 className="text-2xl font-bold text-indigo-600">Mode Super Admin</h2>
      <p className="text-gray-700">
        Sebagai Super Admin (Tenant Global), Anda harus membuat tenant pertama.
      </p>
      <form className="space-y-4 pt-3">
        <input
          type="text"
          placeholder="Nama Tenant (Contoh: Sate Taichan Senayan)"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="text-xs text-red-500">
          *Fungsionalitas pembuatan tenant dan update sesi admin belum
          diimplementasikan di sini.
        </p>
        <button
          type="submit"
          disabled
          className="px-4 py-2 bg-indigo-500 text-white rounded font-medium hover:bg-indigo-600 transition-colors cursor-not-allowed opacity-50"
        >
          Buat Tenant Baru
        </button>
      </form>
    </div>
  );
};

// ====================================================================
// --- KOMPONEN MODAL TAMBAH/EDIT MENU ---
// ====================================================================
const MenuModal = ({
  menu,
  isOpen,
  onClose,
  onSave,
}: {
  menu: Partial<MenuItem> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<MenuItem>) => void;
}) => {
  const [name, setName] = useState(menu?.name || "");
  const [description, setDescription] = useState(menu?.description || "");
  const [price, setPrice] = useState(menu?.price || 0);

  useEffect(() => {
    if (menu) {
      setName(menu.name || "");
      setDescription(menu.description || "");
      setPrice(menu.price || 0);
    }
  }, [menu]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: menu?.id, name, description, price: Number(price) });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 ease-out scale-100 opacity-100">
        <h3 className="text-xl font-bold mb-4">
          {menu?.id ? "Edit Menu" : "Tambah Menu Baru"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nama Menu
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Harga (Rp)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
              min="0"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
  const { admin, logout } = useAuth();
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
    logout();
    navigate("/admin/login", { replace: true });
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
        id: String(Date.now()),
        name: "",
        description: "",
        price: 0,
        tenantId: adminTenantId!,
      }
    );
    setIsMenuModalOpen(true);
  };

  const handleSaveMenu = (newMenuData: Partial<MenuItem>) => {
    if (!tenantData || !adminTenantId) return;

    let updatedMenus: MenuItem[];

    // Pastikan price adalah Number
    const finalMenuData = {
      ...newMenuData,
      tenantId: adminTenantId,
    } as MenuItem;

    if (currentMenu && "id" in currentMenu && finalMenuData.id) {
      // Edit Menu
      updatedMenus = tenantData.menus.map((m) =>
        m.id === finalMenuData.id ? finalMenuData : m
      );
    } else {
      // Tambah Menu (Generate ID dummy)
      // FIX: Konversi Date.now() ke String
      finalMenuData.id = String(Date.now());
      updatedMenus = [...tenantData.menus, finalMenuData];
    }

    // Update state tenantData secara lokal
    setTenantData({ ...tenantData, menus: updatedMenus });
    setIsMenuModalOpen(false);
    setCurrentMenu(null);
  };

  const handleDeleteMenu = (menuId: number | string) => {
    if (!tenantData) return;
    if (window.confirm("Apakah Anda yakin ingin menghapus menu ini?")) {
      const updatedMenus = tenantData.menus.filter((m) => m.id !== menuId);
      setTenantData({ ...tenantData, menus: updatedMenus });
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

  // --- RENDERING KOMPONEN ---

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">
            Admin Dashboard 🍔
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
        {isAdminNull && <CreateTenantForm />}

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
            <OrderHistory />

            {/* Tenant Info & Menus */}
            {tenantLoading ? (
              // Loading State dengan animasi yang lebih baik
              <div className="flex flex-col space-y-4 animate-pulse">
                <div className="h-20 bg-gray-200 rounded-xl"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="h-40 bg-gray-200 rounded-xl"></div>
                  <div className="h-40 bg-gray-200 rounded-xl"></div>
                  <div className="h-40 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            ) : tenantData ? (
              <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-4 md:p-6 space-y-4 border border-gray-100">
                {/* Header Tenant Detail */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    {tenantData.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {tenantData.category}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {tenantData.status}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed pb-4">
                  {tenantData.description}
                </p>

                {/* Menu List Section */}
                <div className="pt-4 border-t border-gray-100">
                  {/* LOKASI BARU TOMBOL TAMBAH MENU */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Daftar Menu
                    </h3>
                    <button
                      onClick={() => handleOpenMenuModal()}
                      disabled={!tenantData}
                      className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 shadow-md"
                    >
                      + Tambah Menu
                    </button>
                  </div>

                  {tenantData.menus.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 mt-4">
                      <p className="text-gray-500 text-sm">
                        Belum ada menu yang tersedia. Gunakan tombol 'Tambah
                        Menu' di atas.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                      {tenantData.menus.map((menu: MenuItem) => (
                        <div
                          key={menu.id}
                          className="border border-gray-200 rounded-xl p-4 flex flex-col bg-white hover:shadow-xl transition-shadow duration-300 group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors pr-2">
                              {menu.name}
                            </h4>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded whitespace-nowrap">
                              Rp{menu.price.toLocaleString("id-ID")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4 flex-grow">
                            {menu.description}
                          </p>

                          {/* TOMBOL EDIT & DELETE */}
                          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 mt-auto">
                            <button
                              onClick={() => handleOpenMenuModal(menu)}
                              className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors shadow-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMenu(menu.id)}
                              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors shadow-sm"
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
              <div className="text-center py-10 bg-white rounded-xl shadow border border-gray-200">
                <p className="text-gray-500">
                  {selectedTenantId
                    ? "Data tenant tidak ditemukan."
                    : "Tidak ada tenant yang terhubung dengan akun ini."}
                </p>
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
