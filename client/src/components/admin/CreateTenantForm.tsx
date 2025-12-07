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
      // === HIT API BUAT TENANT ===
      const newTenant = await postTenant({
        name,
        category,
        address,
        description,
        imageUrl,
      });

      // Backend harus mengembalikan { id: number }
      const newTenantId = newTenant.id;

      if (!newTenantId) {
        throw new Error("API tidak mengembalikan ID tenant");
      }

      // === UPDATE SESSION DI LOCAL STORAGE ===
      const stored = localStorage.getItem("admin_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.tenantId = newTenantId;
        localStorage.setItem("admin_auth", JSON.stringify(parsed));
      }

      onCreated();

      // Refresh supaya dashboard baca tenantId baru
      window.location.reload();
    } catch (err: unknown) {
      let message = "Gagal membuat tenant.";
      if (err instanceof Error) message = err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
      bg-white/90 backdrop-blur-md 
      rounded-2xl shadow-xl 
      p-6 space-y-5 border border-gray-200
      max-w-xl mx-auto
    "
    >
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
        Buat Tenant Pertama
      </h2>

      <p className="text-sm text-gray-600 leading-relaxed">
        Kamu login sebagai <span className="font-semibold">Super Admin</span>.
        Silakan buat tenant pertama untuk mulai menggunakan dashboard.
      </p>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Nama Tenant
          </label>
          <input
            type="text"
            className="mt-1 w-full border rounded-lg px-3 py-2 shadow-sm focus:ring focus:ring-cyan-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Sate Taichan Senayan"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Kategori</label>
          <input
            type="text"
            className="mt-1 w-full border rounded-lg px-3 py-2 shadow-sm focus:ring focus:ring-cyan-300"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Contoh: Minuman, Sate, Dessert"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Alamat Stand
          </label>
          <input
            type="text"
            className="mt-1 w-full border rounded-lg px-3 py-2 shadow-sm focus:ring focus:ring-cyan-300"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Contoh: A-01"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Deskripsi</label>
          <textarea
            className="mt-1 w-full border rounded-lg px-3 py-2 shadow-sm resize-none focus:ring focus:ring-cyan-300"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ceritakan tenant kamu…"
            required
          ></textarea>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            URL Gambar (Opsional)
          </label>
          <input
            type="url"
            className="mt-1 w-full border rounded-lg px-3 py-2 shadow-sm focus:ring focus:ring-cyan-300"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://contoh.com/gambar.jpg"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`
            w-full py-3 rounded-lg font-semibold text-white shadow 
            transition-all duration-200
            ${loading ? "bg-cyan-300" : "bg-cyan-600 hover:bg-cyan-700"}
          `}
        >
          {loading ? "Membuat Tenant…" : "Buat Tenant Baru"}
        </button>
      </form>
    </div>
  );
}
