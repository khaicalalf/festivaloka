import type { Tenant } from "../../types";

type Props = {
  tenant: Tenant;
  selected?: boolean;
  onClick: () => void;
};

export function TenantCard({ tenant, selected, onClick }: Props) {
  // Badge logic - keeping original text with premium styling
  let badgeText = "";
  let badgeStyle = "";

  if (tenant.isViral) {
    badgeText = "🔥 Viral";
    badgeStyle = "bg-rose-500/10 text-rose-400 border-rose-500/25";
  } else if (tenant.status === "RAMAI") {
    badgeText = "🧑‍🍳 Banyak yang Suka";
    badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/25";
  } else if (tenant.status === "SEPI") {
    badgeText = "😌 Nyaman Antre";
    badgeStyle = "bg-indigo-500/10 text-indigo-400 border-indigo-500/25";
  } else {
    badgeText = "🟢 Ayo Pesan";
    badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
  }

  return (
    <button
      onClick={onClick}
      className={`
        relative border rounded-3xl text-left w-full overflow-hidden
        transition-all duration-300 transform group hover:-translate-y-1
        ${
          selected
            ? "bg-slate-900 border-rose-500 shadow-xl shadow-rose-950/20 scale-[1.01]"
            : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:shadow-lg"
        }
      `}
    >
      {/* Top Banner/Image Area */}
      <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
        {tenant.imageUrl ? (
          <img
            src={tenant.imageUrl}
            alt={tenant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center text-slate-700">
            <span>No Image</span>
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>

        {/* Badge - Top Left */}
        {badgeText && (
          <div
            className={`
              absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl
              border backdrop-blur-md shadow-lg
              ${badgeStyle}
            `}
          >
            {badgeText}
          </div>
        )}

        {/* Stand Code - Bottom Left */}
        {tenant.address && (
          <div className="absolute bottom-3 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 text-[10px] font-bold font-mono px-2 py-0.5 rounded text-slate-300">
            Stand: {tenant.address}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-rose-500 tracking-widest uppercase">
              {tenant.category}
            </span>
            <h3
              className={`text-lg font-bold leading-snug mt-0.5 ${
                selected ? "text-white" : "text-slate-100 group-hover:text-white"
              }`}
            >
              {tenant.name}
            </h3>
          </div>
        </div>

        {tenant.description && (
          <p
            className={`text-xs leading-relaxed line-clamp-2 ${
              selected ? "text-slate-400" : "text-slate-400"
            }`}
          >
            {tenant.description}
          </p>
        )}
      </div>

      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-3 right-3 bg-rose-500 text-white rounded-full p-1 shadow-lg ring-4 ring-rose-500/20">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
