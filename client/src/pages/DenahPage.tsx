import { useEffect, useState } from "react";
import type { Tenant } from "../types";
import { Link } from "react-router-dom";
import { apiClient, getIsMockMode } from "../api/client";


export function DenahPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStand, setSelectedStand] = useState<Tenant | null>(null);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const isOffline = getIsMockMode();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient.request<Tenant[]>("/api/tenants");

        // SORT BY STAND CODE
        const sorted = data.sort((a, b) => {
          const getCode = (str: string) =>
            str.match(/[A-Z]-\d+/)?.[0] ?? "Z-999";

          return getCode(a.address ?? "").localeCompare(
            getCode(b.address ?? "")
          );
        });

        setTenants(sorted);
        if (sorted.length > 0) {
          setSelectedStand(sorted[0]);
        }
      } catch (e) {
        console.error("Gagal memuat denah:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getStandCode = (t: Tenant) => {
    return t.address?.match(/[A-Z]-\d+/)?.[0] ?? "N/A";
  };

  const getStandZone = (t: Tenant) => {
    const code = getStandCode(t);
    return code.startsWith("A") ? "Zone A" : code.startsWith("B") ? "Zone B" : "Zone C";
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium text-slate-400 animate-pulse">Memetakan Denah Food Court...</p>
        </div>
      </div>
    );
  }

  // Define layout zones for visual map
  const zoneColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    "Zone A": { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30", glow: "shadow-rose-500/20" },
    "Zone B": { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/30", glow: "shadow-violet-500/20" },
    "Zone C": { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", glow: "shadow-emerald-500/20" }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent flex items-center gap-2">
                  <svg className="w-7 h-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Denah Digital Food Court
                </h1>
                {isOffline && (
                  <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 animate-pulse-slow">
                    Demo Mode
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Pilih stan di peta interaktif untuk melihat menu & memesan langsung
              </p>
            </div>
            <Link
              to="/"
              className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl font-semibold shadow-lg shadow-rose-900/30 hover:shadow-rose-900/40 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Beranda</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Interactive Map Grid (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-2 items-center justify-between shadow-lg">
            <span className="text-sm font-semibold text-slate-300">Filter Wilayah:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveZone(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  !activeZone
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/45 shadow"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                }`}
              >
                Semua Wilayah
              </button>
              <button
                onClick={() => setActiveZone("Zone A")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeZone === "Zone A"
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/45 shadow"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                }`}
              >
                Zone A (Food East)
              </button>
              <button
                onClick={() => setActiveZone("Zone B")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeZone === "Zone B"
                    ? "bg-violet-500/20 text-violet-400 border-violet-500/45 shadow"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                }`}
              >
                Zone B (Food Center)
              </button>
              <button
                onClick={() => setActiveZone("Zone C")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeZone === "Zone C"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/45 shadow"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                }`}
              >
                Zone C (Beverage)
              </button>
            </div>
          </div>

          {/* Visual Interactive Map Floor Plan */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold tracking-tight text-slate-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
                Denah Fisik & Tata Letak
              </h2>
              <span className="text-xs text-slate-500 font-mono">MAP STAGE VIEW V1.0</span>
            </div>

            {/* Grid Layout representing the food court stands */}
            <div className="grid grid-cols-3 gap-4 border border-slate-800 bg-slate-950 p-4 sm:p-6 rounded-2xl min-h-[300px]">
              
              {/* Stand cells placed dynamically */}
              {tenants.map((t) => {
                const zone = getStandZone(t);
                const code = getStandCode(t);
                const isSelected = selectedStand?.id === t.id;
                const colors = zoneColors[zone];
                const isFilteredOut = activeZone && zone !== activeZone;

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedStand(t)}
                    disabled={!!isFilteredOut}
                    className={`
                      relative group rounded-xl p-4 border text-left flex flex-col justify-between min-h-[90px] sm:min-h-[110px]
                      transition-all duration-300
                      ${isFilteredOut ? "opacity-15 cursor-not-allowed border-slate-900" : ""}
                      ${isSelected 
                        ? `${colors.bg} ${colors.border} shadow-lg ${colors.glow} scale-[1.03] ring-1 ring-slate-700`
                        : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700"
                      }
                    `}
                  >
                    {/* Stand Label */}
                    <div className="flex justify-between items-start w-full">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                        {code}
                      </span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${
                        t.status === "RAMAI" ? "text-rose-400" : "text-emerald-400"
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    {/* Stand Name */}
                    <div className="mt-3">
                      <p className={`text-xs sm:text-sm font-bold truncate ${isSelected ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                        {t.name}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {t.category}
                      </p>
                    </div>

                    {/* Active highlight bar */}
                    {isSelected && (
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-rose-500 via-violet-500 to-emerald-500 rounded-b-xl"></div>
                    )}
                  </button>
                );
              })}

            </div>

            {/* Dining Area Simulation */}
            <div className="mt-4 p-4 border border-dashed border-slate-800 rounded-xl bg-slate-900/40 text-center flex items-center justify-center gap-2">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">Area Makan Utama (Dining Hall)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Stand Detail & Actions */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl sticky top-24 space-y-6">
            {selectedStand ? (
              <>
                <div className="space-y-4">
                  {/* Stand code & image */}
                  <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-800 bg-slate-950">
                    {selectedStand.imageUrl ? (
                      <img
                        src={selectedStand.imageUrl}
                        alt={selectedStand.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                        No Image Available
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-rose-600 text-white px-3 py-1 rounded-xl font-bold font-mono text-xs shadow-lg">
                      STAND {getStandCode(selectedStand)}
                    </div>
                    {selectedStand.isViral && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 px-3 py-1 rounded-xl font-black text-[10px] uppercase shadow-lg tracking-wider animate-bounce">
                        🔥 VIRAL
                      </div>
                    )}
                  </div>

                  {/* Info titles */}
                  <div>
                    <span className="text-xs font-bold text-rose-500 tracking-wider uppercase">
                      {selectedStand.category}
                    </span>
                    <h2 className="text-xl font-black text-white mt-1">
                      {selectedStand.name}
                    </h2>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                      {selectedStand.description}
                    </p>
                  </div>
                </div>

                <hr className="border-slate-800" />

                {/* Menus List preview */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    Rekomendasi Menu Spesial:
                  </h3>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {selectedStand.menus.map((menu) => (
                      <div key={menu.id} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                        <div>
                          <p className="text-xs font-bold text-slate-200">{menu.name}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{menu.description}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400 flex-shrink-0">
                          Rp {menu.price.toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call-to-action button */}
                <Link
                  to="/"
                  className="block text-center w-full py-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-2xl font-bold shadow-lg shadow-rose-900/30 hover:shadow-rose-900/50 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Pesan Sekarang dari Stand Ini
                </Link>
              </>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <span className="text-4xl block mb-3">📍</span>
                Pilih salah satu stan di peta untuk melihat detail.
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Footer info stand list */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-600">
          Festivaloka Food Court Navigator &copy; {new Date().getFullYear()}. Running Offline Mode fallbacks successfully.
        </div>
      </footer>
    </div>
  );
}
