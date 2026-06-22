import type { Tenant } from "../../types";

type Props = {
  tenant: Tenant;
  selected?: boolean;
  onClick: () => void;
};

export function TenantRow({ tenant, selected, onClick }: Props) {
  // Determine avatar background and emoji based on category
  const isFood = tenant.category === "FOOD";
  const avatarBg = "bg-slate-100";
  const avatarEmoji = isFood ? "🍛" : "🍹";

  // Determine status details
  let statusText = tenant.description || "Silakan mampir dan pesan sekarang!";
  let statusColor = "text-slate-500";
  let statusBadge = null;

  if (tenant.isViral) {
    statusText = "🔥 Paling Viral! Menu laris manis...";
    statusColor = "text-rose-600 font-medium";
    statusBadge = (
      <span className="bg-rose-50 text-rose-700 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-rose-200">
        Viral
      </span>
    );
  } else if (tenant.status === "RAMAI") {
    statusText = "👨‍🍳 Sedang ramai antrean...";
    statusColor = "text-amber-600 font-medium";
    statusBadge = (
      <span className="bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-amber-200">
        Rame
      </span>
    );
  } else if (tenant.status === "SEPI") {
    statusText = "😌 Antrean santai... pesan cepat!";
    statusColor = "text-emerald-600 font-medium";
    statusBadge = (
      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-emerald-250">
        Santai
      </span>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3.5 px-4 py-3.5 border-b border-slate-100/75
        transition-all duration-150 text-left outline-none relative
        ${
          selected
            ? "bg-slate-100 border-transparent"
            : "bg-white hover:bg-slate-50/80"
        }
      `}
    >
      {/* Active Line indicator (WhatsApp style vertical stripe) */}
      {selected && (
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-slate-900"></div>
      )}

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border border-slate-100 shadow-sm ${avatarBg}`}
        >
          {tenant.imageUrl ? (
            <img
              src={tenant.imageUrl}
              alt={tenant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl">{avatarEmoji}</span>
          )}
        </div>

        {/* Online Status Dot */}
        <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex justify-between items-baseline">
          <h4 className="font-semibold text-[14px] text-slate-800 truncate pr-2">
            {tenant.name}
          </h4>
          {tenant.address && (
            <span className="text-[10px] font-bold text-slate-400 font-mono flex-shrink-0 uppercase">
              Tenda {tenant.address}
            </span>
          )}
        </div>

        <p className={`text-xs truncate leading-normal ${statusColor}`}>
          {statusText}
        </p>
      </div>

      {/* Right End badge indicator */}
      {statusBadge && (
        <div className="flex-shrink-0 flex items-center justify-center pl-1">
          {statusBadge}
        </div>
      )}
    </button>
  );
}
