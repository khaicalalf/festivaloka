type Props = {
  pref: string;
  onEdit: () => void;
};

export function PreferenceSummary({ pref, onEdit }: Props) {
  const isEmpty = !pref || pref.trim() === "";

  // Split preferences into tags
  const prefTags = pref
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p);

  return (
    <div className="border-2 border-gray-200 rounded-2xl p-5 mb-4 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <h2 className="font-bold text-lg">Preferensi Kamu</h2>
        </div>
        <button
          onClick={onEdit}
          className="
            text-sm bg-[#FF385C] text-white px-4 py-2 rounded-lg 
            shadow-md hover:bg-[#E31C5F] hover:shadow-lg
            transition-all transform hover:-translate-y-0.5
            flex items-center gap-1.5
          "
        >
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit
        </button>
      </div>

      <div className="min-h-[60px]">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="text-4xl mb-2 opacity-30">🍽️</div>
            <p className="text-sm text-gray-500 italic">
              Belum ada preferensi. Klik{" "}
              <span className="font-semibold">Edit</span> untuk menambahkan!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {prefTags.map((tag, index) => (
                <span
                  key={index}
                  className="
                    inline-flex items-center gap-1.5
                    px-3 py-1.5 rounded-lg
                    bg-[#FF385C] text-white text-sm font-medium
                    shadow-sm
                  "
                >
                  <span className="text-xs">✨</span>
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
              {prefTags.length} preferensi aktif
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
