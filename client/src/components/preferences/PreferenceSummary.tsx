import type { FoodPreference } from "../../types";

type Props = {
  pref: FoodPreference;
  onEdit: () => void;
};

export function PreferenceSummary({ pref, onEdit }: Props) {
  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow">
      <h2 className="font-semibold text-lg mb-2">Preferensi Kamu</h2>

      <div className="text-sm space-y-1">
        <p>
          <b>Level pedas:</b> {pref.spicyLevel}
        </p>
        <p>
          <b>Halal only:</b> {pref.halalOnly ? "Ya" : "Tidak"}
        </p>
        {pref.notes && (
          <p>
            <b>Catatan:</b> {pref.notes}
          </p>
        )}
      </div>

      <button
        onClick={onEdit}
        className="mt-3 text-sm bg-black text-white px-3 py-1 rounded"
      >
        Edit Preferensi
      </button>
    </div>
  );
}
