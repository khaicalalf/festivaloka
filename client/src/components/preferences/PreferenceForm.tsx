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
  { label: "Halal Only", icon: "✅" },
  { label: "Makanan berat", icon: "🍛" },
  { label: "Sate-satean", icon: "🍢" },
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
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="space-y-6 rounded-[2rem] p-6 bg-white w-full max-w-lg shadow-2xl border border-slate-200/80 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-black text-xl text-slate-800 tracking-tight">🎯 Preferensi Sajian</h2>
            <p className="text-xs text-slate-500 mt-1">
              Personalisasi pilihan kuliner sesuai keinginan Anda hari ini
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
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
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* QUICK BUTTONS */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
            Pilih Cepat
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_PREFS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => addQuickPref(p.label)}
                className={`
                  text-xs px-3.5 py-2.5 rounded-xl border transition-all
                  flex items-center gap-1.5 font-bold
                  ${
                    isSelected(p.label)
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-md shadow-orange-500/10 scale-105"
                      : "bg-slate-50 text-slate-650 border-slate-200 hover:border-slate-350 hover:bg-slate-100/50"
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
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
            Atau Tulis Manual
          </label>
          <textarea
            className="w-full bg-slate-50 border border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all resize-none shadow-inner"
            rows={3}
            value={value}
            placeholder="Contoh: suka pedas, mau yang cepat, minuman manis..."
            onChange={(e) => onChange(e.target.value)}
          />
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!value.trim()}
            className="
              flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-650
              text-white py-3.5 rounded-2xl font-bold
              shadow-lg shadow-orange-500/15 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none
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
                px-5 border border-slate-200 py-3.5 rounded-2xl font-bold text-xs text-slate-500
                bg-white hover:bg-slate-50 transition-all
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
