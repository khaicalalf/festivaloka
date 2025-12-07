import type { FormEvent } from "react";

type Props = {
  value: string; // preferensi bebas
  onChange: (next: string) => void;
  onSubmit: () => void;
  onClose?: () => void;
};

const QUICK_PREFS = [
  "Suka pedas",
  "Tidak pedas",
  "Cepat saji",
  "Minuman manis",
  "Lagi viral",
  "Porsi besar",
  "Makanan ringan",
  "Halal",
  "Makanan berat",
];

export function PreferenceForm({ value, onChange, onSubmit, onClose }: Props) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const addQuickPref = (pref: string) => {
    if (!value.includes(pref)) {
      onChange(value ? `${value}, ${pref}` : pref);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl p-5 bg-white w-full max-w-md shadow-xl animate-slide-up"
      >
        <h2 className="font-semibold text-lg">Preferensi Makananmu</h2>

        <p className="text-xs opacity-70">
          Kamu bisa pilih cepat di bawah atau tulis manual sesuai seleramu.
        </p>

        {/* QUICK BUTTONS */}
        <div className="flex flex-wrap gap-2">
          {QUICK_PREFS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => addQuickPref(p)}
              className="text-xs px-3 py-1 rounded-full border bg-gray-100 hover:bg-gray-200 transition"
            >
              {p}
            </button>
          ))}
        </div>

        {/* TEXTAREA */}
        <textarea
          className="border rounded-lg px-3 py-2 w-full resize-none focus:outline-none focus:ring focus:ring-gray-300"
          rows={3}
          value={value}
          placeholder="contoh: suka pedas, mau yang cepat, minuman manis…"
          onChange={(e) => onChange(e.target.value)}
        />

        {/* BUTTONS */}
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            className="flex-1 bg-black text-white py-2 rounded-lg text-sm shadow-md hover:bg-neutral-900 transition"
          >
            Simpan
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition"
            >
              Tutup
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
