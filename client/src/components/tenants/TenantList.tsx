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
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
            <svg className="w-5 h-5 group-focus-within:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari makanan, minuman, atau nama stan..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500/50 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white"
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
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeCategory === "ALL"
                ? "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-lg shadow-rose-950/10"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            🍔 Semua Stan
          </button>
          <button
            onClick={() => setActiveCategory("FOOD")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeCategory === "FOOD"
                ? "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-lg shadow-rose-950/10"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            🍲 Makanan
          </button>
          <button
            onClick={() => setActiveCategory("DRINK")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeCategory === "DRINK"
                ? "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-lg shadow-rose-950/10"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            🍹 Minuman
          </button>
        </div>
      </div>

      {/* Grid of Tenants */}
      {!filtered.length ? (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
          <div className="text-5xl mb-4 opacity-40">🏪</div>
          <h3 className="text-base font-bold text-slate-300">Stan Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Coba cari dengan kata kunci lain atau ubah filter kategori Anda.
          </p>
          {(searchQuery || activeCategory !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("ALL");
              }}
              className="mt-4 text-xs font-bold text-rose-400 hover:text-rose-300 underline"
            >
              Reset Pencarian & Filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wider text-slate-400 uppercase">
              Stan yang Tersedia ({filtered.length})
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
