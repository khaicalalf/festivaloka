import type { FormEvent } from "react";

type Props = {
  value: string; // preferensi bebas
  onChange: (next: string) => void;
  onSubmit: () => void;
  onClose?: () => void; // tombol tutup
};

export function PreferenceForm({ value, onChange, onSubmit, onClose }: Props) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 border rounded-xl p-4 mb-4 bg-white/70 backdrop-blur shadow-sm animate-slide-up"
    >
      <h2 className="font-semibold text-lg">Preferensi Makananmu</h2>

      <p className="text-xs opacity-70">
        Tulis selera makananmu, misalnya: “suka pedas”, “mau yang cepat saji”,
        “cari minuman manis”.
      </p>

      {/* TEXTAREA */}
      <textarea
        className="border rounded-lg px-3 py-2 w-full resize-none focus:outline-none focus:ring focus:ring-gray-300"
        rows={2}
        value={value}
        placeholder="contoh: suka pedas, suka bakso, suka minuman dingin…"
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
  );
}
