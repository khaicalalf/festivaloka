import { useState } from "react";
import { postTenant } from "../../api/tenants";

type Props = {
  onCreated: () => void;
};

export function CreateTenantForm({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await postTenant({
        name,
        category,
        address,
        description,
        imageUrl,
      });

      onCreated(); // refresh tenant list
    } catch (err: unknown) {
      let message = "Terjadi kesalahan saat login";
      if (err instanceof Error && err.message) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-4 md:p-6 space-y-4 border border-gray-100">
      <h2 className="text-2xl font-bold text-cyan-600">Mode Super Admin</h2>

      <p className="text-gray-700">
        Sebagai Super Admin (Tenant Global), Anda harus membuat tenant pertama.
      </p>

      {error && (
        <div className="p-3 text-sm bg-red-100 text-red-700 rounded border border-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 pt-3">
        <input
          type="text"
          placeholder="Nama Tenant"
          className="w-full border rounded-lg px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Kategori (contoh: Minuman, Sate)"
          className="w-full border rounded-lg px-3 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Alamat Stand (contoh: A-01)"
          className="w-full border rounded-lg px-3 py-2"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <textarea
          placeholder="Deskripsi"
          className="w-full border rounded-lg px-3 py-2 resize-none"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Image URL (opsional)"
          className="w-full border rounded-lg px-3 py-2"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded font-medium text-white transition ${
            loading
              ? "bg-cyan-300 cursor-not-allowed"
              : "bg-cyan-600 hover:bg-cyan-700"
          }`}
        >
          {loading ? "Membuat..." : "Buat Tenant Baru"}
        </button>
      </form>
    </div>
  );
}
