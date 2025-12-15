type Props = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  onClose?: () => void;
};

const QUICK_PREFS = [
  { label: "Suka pedas", icon: "🌶️" },
  { label: "Tidak pedas", icon: "❄️" },
  { label: "Cepat saji", icon: "⚡" },
  { label: "Minuman manis", icon: "🍹" },
  { label: "Lagi viral", icon: "🔥" },
  { label: "Porsi besar", icon: "🍱" },
  { label: "Makanan ringan", icon: "🍿" },
  { label: "Halal", icon: "✅" },
  { label: "Makanan berat", icon: "🍛" },
  { label: "Sate", icon: "🍢" },
];

export function PreferenceForm({ value, onChange, onSubmit, onClose }: Props) {
  const addQuickPref = (pref: string) => {
    if (!value.includes(pref)) {
      onChange(value ? `${value}, ${pref}` : pref);
    } else {
      // Remove preference if already selected
      const prefs = value.split(",").map((p) => p.trim());
      const filtered = prefs.filter((p) => p !== pref);
      onChange(filtered.join(", "));
    }
  };

  const isSelected = (pref: string) => value.includes(pref);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="space-y-5 rounded-2xl p-6 bg-white w-full max-w-lg shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-bold text-xl mb-1">🎯 Preferensi Makananmu</h2>
            <p className="text-sm text-gray-600">
              Pilih preferensimu untuk rekomendasi yang lebih personal
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* QUICK BUTTONS */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Pilih Cepat
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_PREFS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => addQuickPref(p.label)}
                className={`
                  text-sm px-3 py-2 rounded-lg border-2 transition-all
                  flex items-center gap-1.5 font-medium
                  ${
                    isSelected(p.label)
                      ? "bg-[#FF385C] text-white border-[#FF385C] shadow-md scale-105"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:shadow-sm"
                  }
                `}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* TEXTAREA */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Atau Tulis Manual
          </label>
          <textarea
            className="border-2 border-gray-200 rounded-lg px-4 py-3 w-full resize-none focus:outline-none focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/10 transition-all"
            rows={3}
            value={value}
            placeholder="Contoh: suka pedas, mau yang cepat, minuman manis..."
            onChange={(e) => onChange(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">{value.length} karakter</p>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!value.trim()}
            className="
              flex-1 bg-[#FF385C] text-white py-3 rounded-lg font-semibold
              shadow-lg hover:bg-[#E31C5F] hover:shadow-xl
              disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none
              transition-all transform hover:-translate-y-0.5
            "
          >
            ✨ Simpan Preferensi
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="
                px-6 border-2 border-gray-200 py-3 rounded-lg font-semibold
                bg-white hover:bg-gray-50 hover:border-gray-300 transition-all
              "
            >
              Batal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
