import type { Tenant } from "../../types";

type Props = {
  tenant: Tenant;
  selected?: boolean;
  onClick: () => void;
};

export function TenantCard({ tenant, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`border rounded-lg p-3 text-left w-full hover:shadow flex gap-3 ${
        selected ? "bg-black text-white" : ""
      }`}
    >
      <div>
        <h3 className="font-semibold">{tenant.name}</h3>
        <p className={`text-xs  ${selected ? " text-white" : "text-gray-600"}`}>
          {tenant.category}
        </p>
        {tenant.description && (
          <p
            className={`text-xs mt-1 line-clamp-2 ${
              selected ? " text-white" : "text-gray-500"
            }`}
          >
            {tenant.description}
          </p>
        )}
      </div>
    </button>
  );
}
