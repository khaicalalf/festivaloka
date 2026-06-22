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

  // Convert generic Zones to human-friendly night market blocks
  const getZoneFriendlyName = (zone: string) => {
    switch (zone) {
      case "Zone A":
        return "Blok Gurih 🍢";
      case "Zone B":
        return "Blok Kenyang 🍛";
      default:
        return "Blok Segar 🍹";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center text-slate-800">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#E2725B] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-500 animate-pulse">Membuka Peta Bazaar...</p>
        </div>
      </div>
    );
  }

  // Cozy pastel highlights
  const zoneColors: Record<string, { bg: string; text: string; border: string; activeShadow: string }> = {
    "Zone A": { bg: "bg-[#FDF3F0]", text: "text-[#E2725B]", border: "border-[#F5C9BD]", activeShadow: "shadow-[#E2725B]/10" },
    "Zone B": { bg: "bg-[#F6F3FB]", text: "text-[#8A6FB9]", border: "border-[#D6CAEB]", activeShadow: "shadow-[#8A6FB9]/10" },
    "Zone C": { bg: "bg-[#EBF7F2]", text: "text-[#4A9E7A]", border: "border-[#AEDEC8]", activeShadow: "shadow-[#4A9E7A]/10" }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-slate-800 flex flex-col font-sans selection:bg-amber-500/20 relative overflow-hidden">
      
      {/* Top Header */}
      <header className="border-b-4 border-[#EADFC9] bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
                  <span className="text-2xl">🎪</span>
                  Peta Bazaar Festivaloka
                </h1>
                {isOffline && (
                  <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-800 border-2 border-amber-500/20">
                    Mode Demo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Biar gak nyasar, yuk cek letak tenda dan stan bazaar kuliner hari ini!
              </p>
            </div>
            <Link
              to="/"
              className="px-5 py-2.5 bg-[#E2725B] hover:bg-[#C55743] border-2 border-[#C55743] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#A53D2A] transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Beranda</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 z-10 relative">
        
        {/* Left Column: Interactive Map Grid (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Filters */}
          <div className="bg-white border-2 border-[#E5DEC9] rounded-3xl p-5 flex flex-wrap gap-3 items-center justify-between shadow-[4px_4px_0px_0px_#E5DEC9]">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Filter Blok Kuliner:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveZone(null)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black border-2 transition-all ${
                  !activeZone
                    ? "bg-[#E2725B] text-white border-[#C55743] shadow-[2px_2px_0px_0px_#C55743]"
                    : "bg-slate-100 border-transparent text-slate-600 hover:bg-[#FAF6EC]"
                }`}
              >
                🎪 Semua Blok
              </button>
              <button
                onClick={() => setActiveZone("Zone A")}
                className={`px-4 py-2.5 rounded-xl text-xs font-black border-2 transition-all ${
                  activeZone === "Zone A"
                    ? "bg-[#E2725B] text-white border-[#C55743] shadow-[2px_2px_0px_0px_#C55743]"
                    : "bg-slate-100 border-transparent text-slate-600 hover:bg-[#FAF6EC]"
                }`}
              >
                Blok Gurih 🍢
              </button>
              <button
                onClick={() => setActiveZone("Zone B")}
                className={`px-4 py-2.5 rounded-xl text-xs font-black border-2 transition-all ${
                  activeZone === "Zone B"
                    ? "bg-[#E2725B] text-white border-[#C55743] shadow-[2px_2px_0px_0px_#C55743]"
                    : "bg-slate-100 border-transparent text-slate-600 hover:bg-[#FAF6EC]"
                }`}
              >
                Blok Kenyang 🍛
              </button>
              <button
                onClick={() => setActiveZone("Zone C")}
                className={`px-4 py-2.5 rounded-xl text-xs font-black border-2 transition-all ${
                  activeZone === "Zone C"
                    ? "bg-[#E2725B] text-white border-[#C55743] shadow-[2px_2px_0px_0px_#C55743]"
                    : "bg-slate-100 border-transparent text-slate-600 hover:bg-[#FAF6EC]"
                }`}
              >
                Blok Segar 🍹
              </button>
            </div>
          </div>

          {/* Visual Interactive Map Floor Plan */}
          <div className="bg-white border-2 border-[#E5DEC9] rounded-[2rem] p-6 shadow-[4px_4px_0px_0px_#E5DEC9] relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-black tracking-widest uppercase text-slate-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#E2725B] rounded-full animate-ping"></span>
                Peta Penataan Tenda Bazaar
              </h2>
            </div>

            {/* Grid Layout representing the food court stands */}
            <div className="grid grid-cols-3 gap-5 border-2 border-[#E5DEC9] bg-[#FCFBF7] p-5 sm:p-6 rounded-[2rem] min-h-[300px]">
              
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
                      relative rounded-2xl p-4 border-2 text-left flex flex-col justify-between min-h-[100px] sm:min-h-[115px]
                      transition-all duration-200 transform
                      ${isFilteredOut ? "opacity-15 cursor-not-allowed border-slate-100 bg-transparent shadow-none" : "hover:translate-x-[2px] hover:translate-y-[2px]"}
                      ${isSelected 
                        ? `${colors.bg} ${colors.border} shadow-[4px_4px_0px_0px_#E2725B] scale-[1.01] border-[#E2725B]`
                        : "bg-white border-[#E5DEC9] shadow-[2px_2px_0px_0px_#E5DEC9] hover:shadow-[1px_1px_0px_0px_#E5DEC9]"
                      }
                    `}
                  >
                    {/* Stand Label */}
                    <div className="flex justify-between items-start w-full">
                      <span className={`text-[9px] font-black font-mono px-2 py-0.5 rounded-lg border-2 ${
                        isSelected ? `bg-white border-[#E2725B] ${colors.text}` : "bg-slate-50 border-[#E5DEC9] text-slate-600"
                      }`}>
                        {code}
                      </span>
                      <span className={`text-[9px] uppercase font-black tracking-wider ${
                        t.status === "RAMAI" ? "text-rose-500" : "text-slate-500"
                      }`}>
                        {t.status === "RAMAI" ? "🔥 Rame" : "Buka"}
                      </span>
                    </div>

                    {/* Stand Name */}
                    <div className="mt-3">
                      <p className={`text-xs sm:text-sm font-black truncate text-slate-800`}>
                        {t.name}
                      </p>
                      <p className="text-[9px] text-[#8B5A2B] font-bold mt-0.5 truncate uppercase tracking-wider font-mono">
                        {getZoneFriendlyName(zone)}
                      </p>
                    </div>
                  </button>
                );
              })}

            </div>

            {/* Pedestrian path */}
            <div className="mt-5 p-4 border-2 border-dashed border-[#E5DEC9] rounded-2xl bg-white/50 text-center flex items-center justify-center gap-2">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest font-mono">🚶 Lorong Pejalan Kaki Bazaar</span>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Stand Detail */}
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="bg-white border-2 border-[#E5DEC9] rounded-[2rem] p-6 shadow-[4px_4px_0px_0px_#E5DEC9] sticky top-24 space-y-6">
            {selectedStand ? (
              <>
                <div className="space-y-4">
                  {/* Stand Image */}
                  <div className="relative rounded-2xl overflow-hidden aspect-video border-2 border-[#E5DEC9] bg-[#FAF6EC]">
                    {selectedStand.imageUrl ? (
                      <img
                        src={selectedStand.imageUrl}
                        alt={selectedStand.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-450 font-bold bg-[#FAF6EC]">
                        📷 Belum ada foto
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-[#E2725B] text-white border border-[#C55743] px-3 py-1.5 rounded-xl font-bold font-mono text-xs shadow-lg">
                      ⛺ TENDA {getStandCode(selectedStand)}
                    </div>
                  </div>

                  {/* Stand Details */}
                  <div>
                    <span className="text-[10px] font-black text-[#E2725B] tracking-wider uppercase font-mono">
                      {getZoneFriendlyName(getStandZone(selectedStand))}
                    </span>
                    <h2 className="text-xl font-black text-slate-800 mt-1">
                      {selectedStand.name}
                    </h2>
                    <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                      {selectedStand.description}
                    </p>
                  </div>
                </div>

                <hr className="border-[#E5DEC9]" />

                {/* Specialty Menus Preview */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    Papan Menu Stan:
                  </h3>
                  <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
                    {selectedStand.menus.map((menu) => (
                      <div key={menu.id} className="flex justify-between items-center p-3 rounded-xl bg-[#FAF7F0]/55 border-2 border-[#EADFC9]/70">
                        <div>
                          <p className="text-xs font-black text-slate-800">{menu.name}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{menu.description}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-600 flex-shrink-0">
                          Rp {menu.price.toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call-to-action button */}
                <Link
                  to="/"
                  className="block text-center w-full py-4 bg-[#E2725B] hover:bg-[#C55743] border-2 border-[#C55743] text-white rounded-2xl font-bold shadow-lg shadow-orange-500/10 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Pesan Sekarang dari Stand Ini
                </Link>
              </>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <span className="text-4xl block mb-3">📍</span>
                Pilih salah satu stan di peta untuk melihat detail.
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Footer Info */}
      <footer className="bg-white border-t-4 border-[#EADFC9] py-6 mt-12 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          Festivaloka Guide Map &copy; {new Date().getFullYear()}. Designed for Local Bazaar.
        </div>
      </footer>
    </div>
  );
}
