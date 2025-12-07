type Props = {
  pref: string; // preferensi bebas
  onEdit: () => void;
};

export function PreferenceSummary({ pref, onEdit }: Props) {
  const isEmpty = !pref || pref.trim() === "";

  return (
    <div className="border rounded-xl p-4 mb-4 bg-white shadow-sm backdrop-blur">
      <h2 className="font-semibold text-lg mb-2">Preferensi Kamu</h2>

      <div className="text-sm text-neutral-700">
        {isEmpty ? (
          <p className="italic opacity-70">Kamu belum mengisi preferensi.</p>
        ) : (
          <p className="whitespace-pre-line leading-relaxed">{pref}</p>
        )}
      </div>

      <button
        onClick={onEdit}
        className="mt-3 text-sm bg-black text-white px-3 py-1.5 rounded-lg shadow hover:bg-neutral-900 transition"
      >
        Edit Preferensi
      </button>
    </div>
  );
}
