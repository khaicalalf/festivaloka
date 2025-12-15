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
  if (!tenants.length) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4 opacity-30">🏪</div>
        <p className="text-sm text-gray-500">Belum ada tenant terdaftar.</p>
      </div>
    );
  }

  return (
    <div className="mb-20 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {tenants.length} tenant tersedia
          </h2>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {tenants.map((tenant, index) => (
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
  );
}
