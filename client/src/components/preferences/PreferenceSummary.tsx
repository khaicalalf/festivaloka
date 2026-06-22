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
    <div className="rounded-3xl p-5 mb-4 bg-white/40 border border-slate-200/50 shadow-xs hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <h2 className="font-black text-slate-800 text-sm tracking-widest uppercase">Preferensi Anda</h2>
        </div>
        <button
          onClick={onEdit}
          className="
            text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600
            text-white px-4 py-2 rounded-xl font-bold
            shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5
            flex items-center gap-1.5
          "
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Ubah
        </button>
      </div>

      <div className="min-h-[50px]">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="text-3xl mb-1.5 opacity-40">🍽️</div>
            <p className="text-xs text-slate-500 italic">
              Belum menentukan preferensi makanan khusus.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {prefTags.map((tag, index) => (
                <span
                  key={index}
                  className="
                    inline-flex items-center gap-1
                    px-3 py-1.5 rounded-xl
                    bg-amber-500/10 text-amber-700 text-xs font-bold
                    border border-amber-200
                  "
                >
                  <span className="text-[10px]">✨</span>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
