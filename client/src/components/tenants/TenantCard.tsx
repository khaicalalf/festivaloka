import type { Tenant } from "../../types";

type Props = {
  tenant: Tenant;
  selected?: boolean;
  onClick: () => void;
};

export function TenantCard({ tenant, selected, onClick }: Props) {
  // Cozy, humanistic badge styling
  let badgeText = "";
  let badgeStyle = "";

  if (tenant.isViral) {
    badgeText = "🔥 Paling Viral!";
    badgeStyle = "bg-[#E2725B] text-white border-[#C55743]";
  } else if (tenant.status === "RAMAI") {
    badgeText = "🧑‍🍳 Lagi Rame Nih";
    badgeStyle = "bg-[#E5A93B] text-slate-900 border-[#C7912E]";
  } else if (tenant.status === "SEPI") {
    badgeText = "😌 Antrean Santai";
    badgeStyle = "bg-[#8CA88D] text-white border-[#728E73]";
  } else {
    badgeText = "🟢 Buka";
    badgeStyle = "bg-[#8CA88D] text-white border-[#728E73]";
  }

  return (
    <button
      onClick={onClick}
      className={`
        relative border-2 rounded-2xl text-left w-full overflow-hidden
        transition-all duration-200 transform
        ${
          selected
            ? "bg-[#FAF6EC] border-[#E2725B] shadow-[4px_4px_0px_0px_#E2725B] translate-x-[2px] translate-y-[2px]"
            : "bg-white border-[#E5DEC9] shadow-[4px_4px_0px_0px_#E5DEC9] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#E5DEC9]"
        }
      `}
    >
      {/* Top Banner/Image Area */}
      <div className="relative h-40 w-full bg-[#FAF6EC] overflow-hidden border-b-2 border-[#E5DEC9]">
        {tenant.imageUrl ? (
          <img
            src={tenant.imageUrl}
            alt={tenant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#FAF6EC] flex items-center justify-center text-slate-400 font-medium">
            <span>📷 Belum ada foto</span>
          </div>
        )}

        {/* Badge - Top Left */}
        {badgeText && (
          <div
            className={`
              absolute top-3 left-3 text-[10px] font-black tracking-wider px-2.5 py-1 rounded-lg
              border-2 shadow-xs
              ${badgeStyle}
            `}
          >
            {badgeText}
          </div>
        )}

        {/* Stand Code - Bottom Left */}
        {tenant.address && (
          <div className="absolute bottom-3 left-4 bg-white border-2 border-[#E5DEC9] text-[10px] font-bold px-2 py-0.5 rounded-lg text-slate-700">
            ⛺ Tenda {tenant.address}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 space-y-2">
        <div>
          <span className="text-[10px] font-black text-[#E2725B] tracking-wider uppercase font-mono">
            {tenant.category === "FOOD" ? "🍲 Makanan" : "🍹 Minuman"}
          </span>
          <h3
            className={`text-base font-black leading-snug mt-0.5 text-slate-800`}
          >
            {tenant.name}
          </h3>
        </div>

        {tenant.description && (
          <p className="text-xs leading-relaxed text-slate-650 line-clamp-2">
            {tenant.description}
          </p>
        )}
      </div>
    </button>
  );
}
