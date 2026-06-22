import { useState } from "react";
import type { Tenant } from "../../types";
import { TenantRow } from "./TenantRow";

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
    <div className="h-full flex flex-col bg-white">
      {/* Search Input Bar (WhatsApp style) */}
      <div className="p-3 bg-white space-y-2">
        <div className="relative flex items-center bg-[#F0F2F5] rounded-xl px-3 py-2 border border-transparent focus-within:border-slate-200 focus-within:bg-white transition-all shadow-inner-sm">
          <span className="text-slate-400 mr-2 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari jajanan, kopi, sate, atau tenda..."
            className="w-full bg-transparent border-none text-sm text-slate-800 placeholder-slate-450 focus:outline-none"
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

        {/* Category Pills (WhatsApp Chat Filter style) */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-1 flex-shrink-0 ${
              activeCategory === "ALL"
                ? "bg-slate-900 text-white border border-slate-950 shadow-xs"
                : "bg-[#F0F2F5] text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            🎪 Semua Stan
          </button>
          <button
            onClick={() => setActiveCategory("FOOD")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-1 flex-shrink-0 ${
              activeCategory === "FOOD"
                ? "bg-slate-900 text-white border border-slate-950 shadow-xs"
                : "bg-[#F0F2F5] text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            🍲 Makanan
          </button>
          <button
            onClick={() => setActiveCategory("DRINK")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-1 flex-shrink-0 ${
              activeCategory === "DRINK"
                ? "bg-slate-900 text-white border border-slate-950 shadow-xs"
                : "bg-[#F0F2F5] text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            🍹 Minuman
          </button>
        </div>
      </div>

      {/* List of Tenants / Chat threads */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
        {!filtered.length ? (
          <div className="text-center py-12 px-4 space-y-2">
            <div className="text-4xl opacity-40">🎪</div>
            <h4 className="text-sm font-bold text-slate-650">Stan tidak ditemukan</h4>
            <p className="text-xs text-slate-450 max-w-xs mx-auto">
              Coba gunakan kata kunci pencarian yang lain atau ganti filter kategori di atas.
            </p>
            {(searchQuery || activeCategory !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("ALL");
                }}
                className="text-xs font-bold text-[#2E7D32] hover:underline pt-2 block mx-auto"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100/50">
            {filtered.map((tenant) => (
              <TenantRow
                key={tenant.id}
                tenant={tenant}
                onClick={() => onSelectTenant(tenant)}
                selected={tenant.id === selectedTenantId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
