/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { apiClient, getIsMockMode } from "../../api/client";
import { useNavigate } from "react-router-dom";
import type { Tenant, MenuItem } from "../../types";
import { CreateTenantForm } from "../../components/admin/CreateTenantForm";
import { createMenu, deleteMenuApi, updateMenu } from "../../api/menu";
import { OrderHistory } from "../../components/admin/OrderHistory";
import { getMockOrders } from "../../api/mockData";

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-5 animate-slide-up text-slate-100">
        {/* Header */}
        <h3 className="text-lg font-black text-white tracking-tight">
          {menu?.id ? "✏️ Edit Menu Kuliner" : "➕ Tambah Menu Baru"}
        </h3>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Menu</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-2xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
              placeholder="Cth: Sate Taichan Spesial"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deskripsi</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-2xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all resize-none"
              placeholder="Jelaskan detail isian menu kuliner..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Harga (Rp)</label>
            <input
              type="number"
              min={0}
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-2xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
              placeholder="Contoh: 15000"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold rounded-2xl bg-rose-600 hover:bg-rose-700 text-white transition shadow-lg shadow-rose-950/20"
            >
              Simpan Menu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const isOffline = getIsMockMode();

  const adminTenantId = admin?.tenantId;
  const adminTenantIdString = adminTenantId ? String(adminTenantId) : null;
  const isAdminNull = adminTenantId === null; // True jika Super Admin

  // State
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
  const [tenantLoading, setTenantLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleLogout = () => {
    localStorage.removeItem("admin_auth"); // hapus sesi
    navigate("/admin/login", { replace: true }); // redirect
  };

  const token = admin?.access_token;
  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  );

  const handleOpenMenuModal = (menu?: MenuItem) => {
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

  const loadTenants = useCallback(async () => {
    if (isAdminNull) return;

    setError("");
    try {
      await apiClient.request<Tenant[]>("/api/tenants", {
        headers: authHeaders,
      });
      if (admin?.tenantId) {
        setSelectedTenantId(String(admin.tenantId));
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Gagal memuat tenants");
    }
  }, [authHeaders, admin?.tenantId, isAdminNull]);

  useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

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


  // Compute live statistics from local storage orders for active tenant
  const stats = useMemo(() => {
    const orders = getMockOrders();
    const activeTenantId = tenantData?.id;
    if (!activeTenantId) return { count: 0, revenue: 0, activeQueue: 0 };

    const tenantOrders = Object.values(orders).filter(
      (o) => String(o.tenant.id) === String(activeTenantId)
    );

    const count = tenantOrders.length;
    const revenue = tenantOrders
      .filter((o) => o.status === "PAID")
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const activeQueue = tenantOrders.filter(
      (o) => o.queueStatus === "WAITING" || o.queueStatus === "PROCESSING"
    ).length;

    return { count, revenue, activeQueue };
  }, [tenantData]);

  const handleSaveMenu = async (menuData: {
    name: string;
    description: string;
    price: number;
  }) => {
    if (!tenantData) return;

    const tenantId = tenantData.id;

    try {
      if (currentMenu?.id) {
        await updateMenu(currentMenu.id, menuData);
      } else {
        await createMenu(tenantId, menuData);
      }
      await loadTenantData();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan menu");
    } finally {
      setIsMenuModalOpen(false);
      setCurrentMenu(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-rose-500/30">
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>🖥️</span> Dashboard Admin
            </h1>
            {isOffline && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                Simulasi Offline
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center sm:text-right">
              <p className="text-xs text-slate-400">Welcome back,</p>
              <p className="text-sm font-bold text-white">{admin?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-950/20"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-2xl text-xs">
            {error}
          </div>
        )}

        {/* --- TAMPILAN KHUSUS SUPER ADMIN --- */}
        {isAdminNull && <CreateTenantForm onCreated={loadTenants} />}

        {/* --- TAMPILAN UNTUK TENANT ADMIN / KARYAWAN --- */}
        {!isAdminNull && (
          <>
            {/* Dashboard Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Card 1: Total Orders */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
                  📦
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Orderan</span>
                  <p className="text-2xl font-black text-white mt-0.5">{stats.count} Pesanan</p>
                </div>
              </div>

              {/* Card 2: Total Revenue */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
                  💰
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Pendapatan</span>
                  <p className="text-2xl font-black text-emerald-400 font-mono mt-0.5">Rp {stats.revenue.toLocaleString()}</p>
                </div>
              </div>

              {/* Card 3: Active Queues */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
                  ⏳
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Antrean Aktif</span>
                  <p className="text-2xl font-black text-amber-400 mt-0.5">{stats.activeQueue} Orang</p>
                </div>
              </div>
            </div>

            {/* Split layout: Queues & Stalls information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Live Queue Handler */}
              <section className="space-y-6">
                <OrderHistory tenantId={String(tenantData?.id)} />
              </section>

              {/* Right Column: Menu management */}
              <section className="space-y-6">
                {tenantLoading ? (
                  <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-64 animate-pulse">
                    <div className="h-6 w-32 bg-slate-800 rounded-md"></div>
                    <div className="h-10 w-full bg-slate-800 rounded-md"></div>
                  </div>
                ) : tenantData ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                    {/* Tenant Header */}
                    <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-850">
                            STAND {tenantData.address || "N/A"}
                          </span>
                          <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                            {tenantData.category}
                          </span>
                        </div>
                        <h2 className="text-xl font-black text-white mt-1">
                          {tenantData.name}
                        </h2>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                          {tenantData.description}
                        </p>
                      </div>
                    </div>

                    {/* Menus Manager */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase">
                          Daftar Menu Stan ({tenantData.menus.length})
                        </h3>
                        <button
                          onClick={() => handleOpenMenuModal()}
                          className="px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-950/20"
                        >
                          ➕ Tambah Menu
                        </button>
                      </div>

                      {tenantData.menus.length === 0 ? (
                        <div className="py-12 border border-dashed border-slate-800 rounded-2xl text-center text-slate-500 bg-slate-950/30">
                          Belum ada menu kuliner ditambahkan.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {tenantData.menus.map((menu) => (
                            <div
                              key={menu.id}
                              className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl flex justify-between items-center gap-4 hover:border-slate-700 transition"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-baseline gap-2">
                                  <h4 className="font-bold text-slate-200 truncate">
                                    {menu.name}
                                  </h4>
                                  <span className="font-mono text-xs font-bold text-emerald-400 flex-shrink-0">
                                    Rp{menu.price.toLocaleString("id-ID")}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 truncate mt-1">
                                  {menu.description}
                                </p>
                              </div>

                              <div className="flex gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleOpenMenuModal(menu)}
                                  className="px-3 py-1.5 rounded-xl border border-slate-850 hover:border-slate-750 text-[10px] font-bold uppercase text-slate-300 hover:text-white transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteMenu(menu.id)}
                                  className="px-3 py-1.5 rounded-xl border border-rose-500/20 hover:border-rose-500/40 text-[10px] font-bold uppercase text-rose-500 hover:text-rose-400 transition bg-rose-500/5 hover:bg-rose-500/10"
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
                  <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl text-slate-500">
                    Stan kuliner Anda tidak ditemukan.
                  </div>
                )}
              </section>

            </div>
          </>
        )}
      </main>

      {/* MODAL MENU FORM */}
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
