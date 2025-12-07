import type { Tenant } from "../../types";

type Props = {
  tenant: Tenant;
  selected?: boolean;
  onClick: () => void;
};

export function TenantCard({ tenant, selected, onClick }: Props) {
  // badge logic
  let badgeText = "";
  let badgeColor = "";

  if (tenant.isViral) {
    badgeText = "🔥 Viral";
    badgeColor = "bg-orange-100 text-orange-700";
  } else if (tenant.status === "RAMAI") {
    badgeText = "🧑‍🍳 Banyak yang Suka nih";
    badgeColor = "bg-red-100 text-red-700";
  } else if (tenant.status === "SEPI") {
    badgeText = "😌 Nyaman Pesan di Sini";
    badgeColor = "bg-yellow-100 text-yellow-700";
  } else {
    badgeText = "🟢 Buka";
    badgeColor = "bg-green-100 text-green-700";
  }

  return (
    <button
      onClick={onClick}
      className={`relative border rounded-lg p-3 text-left w-full flex gap-3 transition
        ${selected ? "bg-black text-white" : ""}
      `}
    >
      {/* BADGE */}
      <div
        className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeColor}`}
      >
        {badgeText}
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">{tenant.name}</h3>

        <p className={`text-xs ${selected ? "text-white" : "text-gray-600"}`}>
          {tenant.category}
        </p>

        {tenant.description && (
          <p
            className={`text-xs mt-1 line-clamp-2 ${
              selected ? "text-white" : "text-gray-500"
            }`}
          >
            {tenant.description}
          </p>
        )}
      </div>
    </button>
  );
}
