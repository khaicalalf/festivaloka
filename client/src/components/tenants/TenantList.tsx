import { useState } from "react";
import type { Tenant } from "../../types";
import { TenantCard } from "./TenantCard";

type Props = {
  tenants: Tenant[];
  selectedTenantId?: number | string | null;
  onSelectTenant: (tenant: Tenant) => void;
};

export function TenantList({
  tenants,
  selectedTenantId,
  onSelectTenant,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"ALL" | "FOOD" | "DRINK">("ALL");

  const filtered = tenants.filter((tenant) => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      tenant.description.toLowerCase().includes(searchQuery.trim().toLowerCase());
    
    const matchesCategory = activeCategory === "ALL" || 
      (activeCategory === "FOOD" && tenant.category === "FOOD") ||
      (activeCategory === "DRINK" && tenant.category === "DRINK");

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search & Category Filter Section */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari camilan, kopi, sate, atau nama stan..."
            className="w-full bg-[#FCFBF7] border-2 border-[#E5DEC9] focus:border-[#E2725B] rounded-2xl pl-12 pr-10 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-650"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black border-2 transition-all flex items-center gap-1.5 ${
              activeCategory === "ALL"
                ? "bg-[#E2725B] text-white border-[#C55743] shadow-[2px_2px_0px_0px_#C55743]"
                : "bg-white border-[#E5DEC9] text-slate-600 hover:bg-[#FAF6EC]"
            }`}
          >
            🎪 Semua Stan Jajanan
          </button>
          <button
            onClick={() => setActiveCategory("FOOD")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black border-2 transition-all flex items-center gap-1.5 ${
              activeCategory === "FOOD"
                ? "bg-[#E2725B] text-white border-[#C55743] shadow-[2px_2px_0px_0px_#C55743]"
                : "bg-white border-[#E5DEC9] text-slate-600 hover:bg-[#FAF6EC]"
            }`}
          >
            🍲 Makanan Berat & Camilan
          </button>
          <button
            onClick={() => setActiveCategory("DRINK")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black border-2 transition-all flex items-center gap-1.5 ${
              activeCategory === "DRINK"
                ? "bg-[#E2725B] text-white border-[#C55743] shadow-[2px_2px_0px_0px_#C55743]"
                : "bg-white border-[#E5DEC9] text-slate-600 hover:bg-[#FAF6EC]"
            }`}
          >
            🍹 Minuman Segar
          </button>
        </div>
      </div>

      {/* Grid of Tenants */}
      {!filtered.length ? (
        <div className="text-center py-16 border-2 border-dashed border-[#E5DEC9] rounded-2xl bg-[#FCFBF7]">
          <div className="text-5xl mb-4 opacity-55">🎪</div>
          <h3 className="text-sm font-bold text-slate-700">Stan makanan belum ketemu nih</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Coba tulis kata kunci lain atau ubah kategori jajananmu di atas.
          </p>
          {(searchQuery || activeCategory !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("ALL");
              }}
              className="mt-4 text-xs font-black text-[#E2725B] hover:text-[#C55743] underline"
            >
              Ulangi Pencarian & Filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black tracking-widest text-slate-400 uppercase">
              Stan Bazaar Terbuka ({filtered.length})
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {filtered.map((tenant, index) => (
              <div
                key={tenant.id}
                style={{ animationDelay: `${index * 0.05}s` }}
                className="animate-fade-in"
              >
                <TenantCard
                  tenant={tenant}
                  onClick={() => onSelectTenant(tenant)}
                  selected={tenant.id === selectedTenantId}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
