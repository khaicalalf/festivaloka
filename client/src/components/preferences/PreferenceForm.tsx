import type { FormEvent } from "react";
import type { FoodPreference } from "../../types";

type Props = {
  value: FoodPreference;
  onChange: (next: FoodPreference) => void;
  onSubmit: () => void;
};

export function PreferenceForm({ value, onChange, onSubmit }: Props) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 border rounded-lg p-4 mb-4"
    >
      <h2 className="font-semibold text-lg">Preferensi Makananmu</h2>

      <div>
        <label className="block text-sm mb-1">Level Pedas</label>
        <select
          className="border rounded px-2 py-1"
          value={value.spicyLevel}
          onChange={(e) =>
            onChange({
              ...value,
              spicyLevel: e.target.value as FoodPreference["spicyLevel"],
            })
          }
        >
          <option value="mild">Tidak terlalu pedas</option>
          <option value="medium">Sedang</option>
          <option value="hot">Pedas banget</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="halalOnly"
          type="checkbox"
          checked={value.halalOnly}
          onChange={(e) => onChange({ ...value, halalOnly: e.target.checked })}
        />
        <label htmlFor="halalOnly" className="text-sm">
          Hanya tampilkan menu halal
        </label>
      </div>

      <div>
        <label className="block text-sm mb-1">Catatan khusus</label>
        <textarea
          className="border rounded px-2 py-1 w-full"
          rows={2}
          value={value.notes ?? ""}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          placeholder="Misal: alergi udang, suka manis, dll..."
        />
      </div>

      <button
        type="submit"
        className="bg-black text-white text-sm px-4 py-2 rounded"
      >
        Simpan Preferensi
      </button>
    </form>
  );
}
