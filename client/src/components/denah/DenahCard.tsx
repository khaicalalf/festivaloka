import type { Tenant } from "../../types";

type Props = {
  tenant: Tenant;
};

export function DenahCard({ tenant }: Props) {
  // Extract stand code from address (e.g., "Stand D-03" -> "D-03")
  const standCode = tenant.address?.match(/[A-Z]-\d+/)?.[0] ?? "N/A";

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
    <div className="relative border-2 border-gray-200 rounded-xl p-4 bg-white hover:shadow-lg hover:border-gray-300 transition-all duration-200">
      {/* Stand Number Badge - Top Left */}
      <div className="absolute -top-3 left-3 bg-[#FF385C] text-white px-3 py-1 rounded-lg font-bold text-sm shadow-md">
        {standCode}
      </div>

      {/* Status Badge - Top Right */}
      {badgeText && (
        <div
          className={`absolute -top-3 right-3 text-xs px-3 py-1 rounded-lg font-medium border shadow-sm ${badgeColor}`}
        >
          {badgeText}
        </div>
      )}

      {/* Image */}
      {tenant.imageUrl && (
        <div className="mt-4 mb-3 overflow-hidden rounded-lg">
          <img
            src={tenant.imageUrl}
            alt={tenant.name}
            className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className={tenant.imageUrl ? "mt-3" : "mt-6"}>
        <h3 className="font-bold text-lg text-gray-900 mb-1">{tenant.name}</h3>

        <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          {tenant.category}
        </p>

        {tenant.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {tenant.description}
          </p>
        )}

        {/* Location Info */}
        {tenant.address && (
          <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg mt-3">
            <svg
              className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-xs text-gray-600 font-medium">
              {tenant.address}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
