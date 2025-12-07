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
    return <p className="text-sm text-gray-500">Belum ada tenant terdaftar.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      {tenants.map((tenant) => (
        <TenantCard
          key={tenant.id}
          tenant={tenant}
          onClick={() => onSelectTenant(tenant)}
          selected={tenant.id === selectedTenantId}
        />
      ))}
    </div>
  );
}
