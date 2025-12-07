import { useState } from "react";
import type { Tenant } from "../../types";
import { TenantList } from "./TenantList";

type Props = {
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
};

export function TenantSearch({ tenants, onSelectTenant }: Props) {
  const [query, setQuery] = useState("");

  const filtered = tenants.filter((t) =>
    t.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari tenant..."
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-sm text-gray-600 px-2"
          >
            Clear
          </button>
        )}
      </div>

      <TenantList tenants={filtered} onSelectTenant={onSelectTenant} />
    </div>
  );
}

export default TenantSearch;
