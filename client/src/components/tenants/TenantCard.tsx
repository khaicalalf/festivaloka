import type { Tenant } from "../../types";

type Props = {
  tenant: Tenant;
  onClick: () => void;
};

export function TenantCard({ tenant, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="border rounded-lg p-3 text-left w-full hover:shadow flex gap-3"
    >
      <div>
        <h3 className="font-semibold">{tenant.name}</h3>
        <p className="text-xs text-gray-600">{tenant.category}</p>
        {tenant.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {tenant.description}
          </p>
        )}
      </div>
    </button>
  );
}
