import { useEffect, useState } from "react";
import type { Tenant } from "../types";
import { Link } from "react-router-dom";
import { apiClient, getIsMockMode } from "../api/client";

export function DenahPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStand, setSelectedStand] = useState<Tenant | null>(null);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
      <div className="min-h-screen bg-[#E1E8EB] flex items-center justify-center text-slate-800">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-500 animate-pulse">Membuka Peta Bazaar...</p>
        </div>
      </div>
    );
  }

  // Cozy minimalist theme definitions
  const zoneColors: Record<string, { bg: string; text: string; border: string; activeShadow: string; activeBorder: string; hoverBg: string }> = {
    "Zone A": { bg: "bg-stone-50", text: "text-stone-600", border: "border-stone-200", activeBorder: "border-slate-850", activeShadow: "shadow-slate-800/10", hoverBg: "hover:bg-stone-100/50" },
    "Zone B": { bg: "bg-slate-50", text: "text-slate-650", border: "border-slate-200", activeBorder: "border-slate-850", activeShadow: "shadow-slate-800/10", hoverBg: "hover:bg-slate-100/50" },
    "Zone C": { bg: "bg-zinc-50", text: "text-zinc-650", border: "border-zinc-200", activeBorder: "border-slate-850", activeShadow: "shadow-slate-800/10", hoverBg: "hover:bg-zinc-100/50" }
  };

  // Stalls filtering
  const filteredTenants = tenants.filter((t) => {
    const zone = getStandZone(t);
    const matchesZone = !activeZone || zone === activeZone;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getStandCode(t).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesSearch;
  });

  return (
    <div className="h-screen w-screen bg-[#E1E8EB] flex justify-center items-center font-sans overflow-hidden p-0 lg:p-4 text-slate-800">
      
      {/* Three-Pane Container */}
      <div className="w-full h-full lg:h-[95vh] lg:w-[95vw] lg:max-w-[1396px] bg-[#f0f2f5] lg:rounded-2xl lg:shadow-2xl flex overflow-hidden border border-slate-200/50 relative">
        
        {/* ==============================================
            PANEL 1: LEFT SIDEBAR (Stall directory list)
           ============================================== */}
        <aside className="w-full sm:w-[350px] lg:w-[320px] flex-shrink-0 border-r border-slate-200 flex flex-col bg-white h-full z-20">
          
          {/* Header with back button */}
          <div className="h-[60px] bg-[#f0f2f5] px-4 flex items-center gap-3 flex-shrink-0 border-b border-slate-200">
            <Link
              to="/"
              className="p-1.5 rounded-full hover:bg-slate-250 text-slate-650 transition active:scale-90"
              title="Kembali ke Beranda"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="min-w-0">
              <h3 className="font-extrabold text-[15px] tracking-tight text-slate-850">
                Peta & Lokasi Stan
              </h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                Festivaloka Guide Map
              </p>
            </div>
          </div>

          {/* Search bar inputs */}
          <div className="p-3 bg-white border-b border-slate-100 space-y-2">
            <div className="relative flex items-center bg-[#f0f2f5] rounded-xl px-3 py-1.5 border border-transparent focus-within:border-slate-200 focus-within:bg-white transition shadow-inner-sm">
              <span className="text-slate-400 mr-2 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari stan atau tenda..."
                className="w-full bg-transparent border-none text-xs text-slate-800 placeholder-slate-450 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-650 ml-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Zone pills filters */}
            <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
              <button
                onClick={() => setActiveZone(null)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide transition flex-shrink-0 border ${
                  !activeZone
                    ? "bg-slate-900 text-white border-slate-950 shadow-xs"
                    : "bg-[#f0f2f5] text-slate-600 border-transparent hover:bg-slate-200"
                }`}
              >
                🎪 Semua
              </button>
              <button
                onClick={() => setActiveZone("Zone A")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide transition flex-shrink-0 border ${
                  activeZone === "Zone A"
                    ? "bg-slate-900 text-white border border-slate-950 shadow-xs"
                    : "bg-[#f0f2f5] text-slate-600 border-transparent hover:bg-slate-200"
                }`}
              >
                Gurih 🍢
              </button>
              <button
                onClick={() => setActiveZone("Zone B")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide transition flex-shrink-0 border ${
                  activeZone === "Zone B"
                    ? "bg-slate-900 text-white border border-slate-950 shadow-xs"
                    : "bg-[#f0f2f5] text-slate-600 border-transparent hover:bg-slate-200"
                }`}
              >
                Kenyang 🍛
              </button>
              <button
                onClick={() => setActiveZone("Zone C")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide transition flex-shrink-0 border ${
                  activeZone === "Zone C"
                    ? "bg-slate-900 text-white border border-slate-950 shadow-xs"
                    : "bg-[#f0f2f5] text-slate-600 border-transparent hover:bg-slate-200"
                }`}
              >
                Segar 🍹
              </button>
            </div>
          </div>

          {/* List layout */}
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 bg-white">
            {!filteredTenants.length ? (
              <div className="p-6 text-center text-slate-400 space-y-1">
                <span className="text-3xl block">🗺️</span>
                <p className="text-xs font-bold">Stan tidak ditemukan</p>
              </div>
            ) : (
              filteredTenants.map((t) => {
                const zone = getStandZone(t);
                const colors = zoneColors[zone];
                const isSelected = selectedStand?.id === t.id;

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedStand(t)}
                    className={`w-full px-4 py-3 flex items-center justify-between text-left transition-all relative ${
                      isSelected ? "bg-slate-50" : "hover:bg-slate-50/50"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-slate-900"></div>
                    )}
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-semibold text-xs text-slate-800 truncate">
                          {t.name}
                        </h4>
                        {t.isViral && (
                          <span className="text-[8px] font-bold text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-100 uppercase flex-shrink-0">
                            Viral
                          </span>
                        )}
                        {t.status === "RAMAI" && (
                          <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1 py-0.2 rounded border border-amber-100 uppercase flex-shrink-0">
                            Rame
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] mt-0.5 font-bold uppercase ${colors.text}`}>
                        {getZoneFriendlyName(zone)}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 border rounded-lg ${colors.bg} ${colors.border} ${colors.text}`}>
                      {getStandCode(t)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ==============================================
            PANEL 2: CENTER AREA (Interactive floor map grid)
           ============================================== */}
        <section className="flex-1 h-full flex flex-col bg-[#efeae2] relative overflow-hidden">
          
          {/* Header Panel */}
          <div className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between flex-shrink-0 border-b border-slate-200 z-10 shadow-sm">
            <div>
              <h3 className="font-semibold text-sm text-slate-800 leading-snug">Denah Lokasi Bazaar Live</h3>
              <p className="text-[10px] text-slate-500 font-medium">
                Peta interaktif penataan stand kuliner
              </p>
            </div>
            {isOffline && (
              <span className="text-[9px] font-bold text-amber-800 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 rounded-md uppercase">
                Demo
              </span>
            )}
          </div>

          {/* Interactive Map Layout grid with wallpaper */}
          <div className="flex-1 overflow-y-auto whatsapp-bg p-4 sm:p-6 flex flex-col justify-center items-center custom-scrollbar">
            
            {/* Visual Grid Container */}
            <div className="w-full max-w-2xl bg-white/95 border border-slate-200/60 rounded-[2rem] p-5 sm:p-6 shadow-md space-y-5 animate-fade-in backdrop-blur-md">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-slate-800 rounded-full animate-ping"></span>
                  Pilih stan pada peta untuk melihat detail
                </span>
                <span className="text-[10px] text-slate-400 font-bold font-mono">PINTU UTAMA ➡️</span>
              </div>

              {/* Stands Layout grid representation */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 min-h-[300px]">
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
                        relative rounded-xl p-3.5 border text-left flex flex-col justify-between min-h-[90px] sm:min-h-[105px]
                        transition-all duration-200 transform outline-none
                        ${isFilteredOut ? "opacity-10 cursor-not-allowed border-slate-100 bg-transparent shadow-none" : `hover:scale-102 ${colors.hoverBg}`}
                        ${isSelected 
                          ? `${colors.bg} ${colors.activeBorder} border-2 shadow-md ${colors.activeShadow}`
                          : "bg-white border-slate-200 shadow-2xs hover:shadow-sm"
                        }
                      `}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border ${
                          isSelected ? `bg-white ${colors.activeBorder} ${colors.text}` : "bg-slate-50 border-slate-200 text-slate-550"
                        }`}>
                          {code}
                        </span>
                        <span className="text-[8px] font-black uppercase text-slate-400">
                          {t.status === "RAMAI" ? "🔥" : "🟢"}
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <h4 className="text-xs font-black truncate text-slate-800">
                          {t.name}
                        </h4>
                        <p className="text-[8px] font-bold text-slate-400 mt-0.5 truncate uppercase tracking-wider">
                          {getZoneFriendlyName(zone)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pedestrian passage label */}
              <div className="p-3 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center flex items-center justify-center gap-1.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono">🚶 Jalur Pengunjung Bazaar Utama</span>
              </div>
            </div>

            {/* Responsive details button for Mobile/Tablet */}
            {selectedStand && (
              <button
                onClick={() => {
                  // Toggle drawer overlay display on mobile
                  const drawer = document.getElementById("detail-drawer");
                  if (drawer) drawer.classList.remove("translate-x-full");
                }}
                className="lg:hidden mt-4 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>Lihat Detail Menu</span>
                <span>➔</span>
              </button>
            )}

          </div>

          {/* Footer guides */}
          <div className="bg-[#f0f2f5] py-3 text-center border-t border-slate-200 text-[10px] text-slate-400 font-medium">
            Festivaloka Map Guide &copy; {new Date().getFullYear()}.
          </div>
        </section>

        {/* ==============================================
            PANEL 3: RIGHT DRAWER (Stall detail - Contact Info style)
           ============================================== */}
        <aside
          id="detail-drawer"
          className={`
            fixed lg:relative inset-y-0 right-0 w-full sm:w-[350px] lg:w-[340px] flex-shrink-0 bg-white border-l border-slate-200 flex flex-col h-full z-30
            transition-transform duration-300 lg:translate-x-0
            ${selectedStand ? "translate-x-0" : "translate-x-full lg:hidden"}
          `}
        >
          {selectedStand ? (
            <>
              {/* Drawer Header */}
              <div className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between flex-shrink-0 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  {/* Close drawer button on Mobile */}
                  <button
                    onClick={() => {
                      const drawer = document.getElementById("detail-drawer");
                      if (drawer) drawer.classList.add("translate-x-full");
                    }}
                    className="lg:hidden p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <h3 className="font-extrabold text-[14px] text-slate-850">
                    Detail Stan Bazaar
                  </h3>
                </div>
                {/* Close Stand selection */}
                <button
                  onClick={() => setSelectedStand(null)}
                  className="p-1 rounded-full hover:bg-slate-200 text-slate-450 hover:text-slate-650 transition-colors"
                  title="Tutup detail"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                
                {/* Visual Image */}
                <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-200 bg-slate-50">
                  {selectedStand.imageUrl ? (
                    <img
                      src={selectedStand.imageUrl}
                      alt={selectedStand.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-[#FAF6EC] text-xs">
                      📷 Belum ada foto stan
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5 bg-slate-900 text-white border border-slate-950 px-2.5 py-1 rounded-lg font-bold font-mono text-[10px] shadow-sm">
                    ⛺ TENDA {getStandCode(selectedStand)}
                  </div>
                </div>

                {/* Stall Description details */}
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase font-mono">
                    {getZoneFriendlyName(getStandZone(selectedStand))}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-extrabold text-slate-800 leading-snug">
                      {selectedStand.name}
                    </h4>
                    {selectedStand.isViral && (
                      <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase">
                        Viral
                      </span>
                    )}
                    {selectedStand.status === "RAMAI" && (
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase">
                        Rame
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    {selectedStand.description || "Mari kunjungi stan kami untuk menikmati sajian kuliner yang lezat dan otentik!"}
                  </p>
                </div>

                <hr className="border-slate-100" />

                {/* Stall Menu Board list */}
                <div className="space-y-2.5">
                  <h5 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    📋 Papan Menu Stan:
                  </h5>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {selectedStand.menus.map((menu) => (
                      <div key={menu.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/50 flex justify-between items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-800 truncate">{menu.name}</p>
                          <p className="text-[9px] text-slate-450 line-clamp-1 mt-0.5">{menu.description}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-800 flex-shrink-0">
                          Rp {menu.price.toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call-to-action button */}
                <div className="pt-2">
                  <Link
                    to={`/?tenantId=${selectedStand.id}`}
                    className="block text-center w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    Jajan Sekarang 🛒
                  </Link>
                </div>

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-450 space-y-2">
              <span className="text-4xl">📍</span>
              <p className="text-xs">Pilih stan di peta untuk melihat menu lengkap.</p>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
}
