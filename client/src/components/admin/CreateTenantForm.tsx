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
      const newTenant = await postTenant({
        name,
        category,
        address,
        description,
        imageUrl,
      });

      const newTenantId = newTenant.id;

      if (!newTenantId) {
        throw new Error("API tidak mengembalikan ID tenant");
      }

      const stored = localStorage.getItem("admin_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.tenantId = newTenantId;
        localStorage.setItem("admin_auth", JSON.stringify(parsed));
      }

      onCreated();
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
      bg-slate-900 border border-slate-800
      rounded-3xl shadow-2xl 
      p-6 space-y-6 max-w-xl mx-auto relative overflow-hidden
    "
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full filter blur-2xl"></div>

      <div>
        <h2 className="text-xl font-black text-white tracking-tight">
          Buat Stan Pertama Anda
        </h2>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Akun Anda terdaftar sebagai <span className="font-bold text-rose-500">Super Admin</span>.
          Silakan daftarkan stan kuliner pertama untuk mulai menggunakan fitur dashboard admin.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-2xl text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Nama Stan / Tenant
          </label>
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Sate Khas Senayan"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori Kuliner</label>
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Contoh: FOOD, DRINK"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Kode Stand / Alamat Lokasi
          </label>
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Contoh: A-01"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deskripsi Singkat</label>
          <textarea
            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all resize-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsikan sajian khas kuliner stan Anda..."
            required
          ></textarea>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            URL Foto Stan (Opsional)
          </label>
          <input
            type="url"
            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-rose-950/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed mt-4"
        >
          {loading ? "Mendaftarkan Stan..." : "Buat Stan & Mulai Berjualan"}
        </button>
      </form>
    </div>
  );
}
