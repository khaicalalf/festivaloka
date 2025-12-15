import type { Tenant } from "../../types";

type Props = {
  tenant: Tenant;
  selected?: boolean;
  onClick: () => void;
};

export function TenantCard({ tenant, selected, onClick }: Props) {
  // Badge logic - keeping original text
  let badgeText = "";
  let badgeColor = "";

  if (tenant.isViral) {
    badgeText = "🔥 Viral";
    badgeColor = "bg-orange-100 text-orange-700 border-orange-200";
  } else if (tenant.status === "RAMAI") {
    badgeText = "🧑‍🍳 Banyak yang Suka nih";
    badgeColor = "bg-red-100 text-red-700 border-red-200";
  } else if (tenant.status === "SEPI") {
    badgeText = "😌 Nyaman Pesan di Sini";
    badgeColor = "bg-yellow-100 text-yellow-700 border-yellow-200";
  } else {
    badgeText = "🟢 Ayo Pesan Lagi";
    badgeColor = "bg-green-100 text-green-700 border-green-200";
  }

  return (
    <button
      onClick={onClick}
      className={`
        relative border-2 rounded-xl p-5 text-left w-full
        transition-all duration-200
        ${
          selected
            ? "bg-[#FF385C] text-white border-[#FF385C] shadow-xl scale-[1.02]"
            : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg"
        }
      `}
    >
      {/* BADGE */}
      {badgeText && (
        <div
          className={`
            absolute top-3 left-3 text-xs px-3 py-1.5 rounded-lg font-medium
            border shadow-sm
            ${selected ? "bg-white/20 text-white border-white/30" : badgeColor}
          `}
        >
          {badgeText}
        </div>
      )}

      <div className="mt-10">
        <h3
          className={`text-lg font-bold mb-1 ${
            selected ? "text-white" : "text-gray-900"
          }`}
        >
          {tenant.name}
        </h3>

        <p
          className={`text-sm mb-2 ${
            selected ? "text-white/80" : "text-gray-600"
          }`}
        >
          {tenant.category}
        </p>

        {tenant.description && (
          <p
            className={`text-sm line-clamp-2 ${
              selected ? "text-white/70" : "text-gray-500"
            }`}
          >
            {tenant.description}
          </p>
        )}
      </div>

      {/* Selection indicator */}
      {selected && (
        <div className="absolute bottom-3 right-3">
          <svg
            className="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
