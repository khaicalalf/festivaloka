import type { Tenant } from "../../types";

type Props = {
  tenant: Tenant;
};

export function DenahCard({ tenant }: Props) {
  const standCode = tenant.address?.match(/[A-Z]-\d+/)?.[0] ?? "???";

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
    <div
      className={`relative border rounded-lg p-2 md:p-3 text-left w-full flex gap-2 md:gap-3 transition
      `}
    >
      {/* BADGE */}
      <div
        className={`absolute top-2 left-2 hidden md:block text-[14px] px-2 py-1 mt-4 rounded-full font-medium ${badgeColor}`}
      >
        {badgeText}
      </div>
      <div
        className={`absolute top-2 right-2 text-[24px] md:text-[32px] px-2 py-0.5 rounded-full font-medium`}
      >
        {standCode}
      </div>

      <div className="mt-4">
        <img
          src={tenant.imageUrl}
          alt={tenant.name}
          className="h-20 w-1/2 my-4 object-cover rounded-lg"
        />
        <h3 className="font-semibold">{tenant.name}</h3>

        <p className="text-xs text-gray-600">{tenant.category}</p>

        {tenant.description && (
          <p className="text-xs mt-1 mb-2 line-clamp-2 text-gray-500">
            {tenant.description}
          </p>
        )}
        <span
          className={` md:hidden text-[11px] px-2 py-1 mt-4 rounded-full font-medium ${badgeColor}`}
        >
          {badgeText}
        </span>
      </div>
    </div>
  );
}
