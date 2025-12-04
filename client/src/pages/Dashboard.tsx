import { useEffect, useState } from "react";
import { getTenantsByAI } from "../api/tenants";
import type { Tenant } from "../types";

export function Dashboard() {
  const [ref, setRef] = useState<string>("");
  const [savedRef, setSavedRef] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Load stored ref on first render
  useEffect(() => {
    const storedRef = localStorage.getItem("preferensi_makanan");
    if (storedRef) {
      setSavedRef(storedRef);
      setRef(storedRef);
    }
  }, []);

  // Fetch tenants whenever savedRef changes
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getTenantsByAI(savedRef);
        setTenants(data);
      } catch (e) {
        if (e instanceof Error) setError(e.message);
        else setError("Gagal memuat daftar tenant.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [savedRef]);

  //   // Save preference
  //   const handleSaveRef = () => {
  //     localStorage.setItem("preferensi_makanan", ref);
  //     setSavedRef(ref);
  //     setIsEditing(false);
  //   };

  //   // Clear preference
  //   const handleClearRef = () => {
  //     localStorage.removeItem("preferensi_makanan");
  //     setRef("");
  //     setSavedRef(null);
  //     setIsEditing(true);
  //   };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      {/* Preferensi Section */}
      <div className="rounded-xl border p-4 shadow-sm bg-white/70 backdrop-blur animate-fade-in">
        {/* CASE 1: Form muncul jika belum collapsed & (belum ada savedRef atau sedang edit) */}
        {!isCollapsed && (!savedRef || isEditing) ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Preferensi Makanan</h2>

            <textarea
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              rows={3}
              placeholder="Contoh: suka pedas, suka sate, minuman manis..."
              className="w-full p-2 border rounded-lg resize-none"
            />

            <div className="flex items-center gap-3 pt-1">
              {/* SIMPAN */}
              <button
                onClick={() => {
                  localStorage.setItem("preferensi_makanan", ref);
                  setSavedRef(ref);
                  setIsEditing(false);
                  setIsCollapsed(true); // collapse setelah simpan
                }}
                className="flex-1 bg-black text-white py-2 rounded-lg"
              >
                Simpan
              </button>

              {/* TUTUP (collapse tanpa simpan) */}
              <button
                onClick={() => {
                  setIsCollapsed(true);
                  setIsEditing(false);
                }}
                className="flex-1 border py-2 rounded-lg bg-gray-100"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          /* CASE 2: Collapsed view */
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Preferensi Kamu</h2>

            <div className="p-3 border rounded-lg bg-gray-50">
              <p className="text-sm opacity-80">
                {savedRef ? savedRef : "Belum ada preferensi"}
              </p>
            </div>

            <div className="flex gap-4 pt-1">
              {/* EDIT membuka kembali form */}
              <button
                onClick={() => {
                  setIsEditing(true);
                  setIsCollapsed(false);
                }}
                className="text-blue-600 text-sm underline"
              >
                Edit
              </button>

              {/* Hapus preferensi */}
              {savedRef && (
                <button
                  onClick={() => {
                    localStorage.removeItem("preferensi_makanan");
                    setSavedRef(null);
                    setRef("");
                  }}
                  className="text-red-500 text-sm underline"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tenant List */}
      <div className="space-y-3">
        {loading && (
          <p className="text-gray-500 text-sm animate-pulse">
            Mencari tenant rekomendasi...
          </p>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {!loading && !error && tenants.length === 0 && (
          <p className="text-gray-700 text-sm">Tidak ada tenant ditemukan.</p>
        )}

        {tenants.map((tenant) => (
          <div
            key={tenant.id}
            className="p-4 rounded-xl border shadow-sm bg-white/70 backdrop-blur animate-slide-up"
          >
            <p className="font-semibold text-lg">{tenant.name}</p>
            <p className="text-sm opacity-70">{tenant.description}</p>

            <button
              className="mt-3 w-full bg-black text-white py-2 rounded-lg text-sm"
              onClick={() => (window.location.href = `/tenant/${tenant.id}`)}
            >
              Lihat Menu
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
