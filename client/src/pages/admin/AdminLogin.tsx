import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { AuthSession } from "../../types";
import { loginAdmin } from "../../api/admin";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }
    setLoading(true);

    try {
      const data = await loginAdmin(email, password);
      console.log(data);

      const session: AuthSession = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        tenantId: data.user.tenantId,
        access_token: data.access_token,
      };

      if (!session.access_token) {
        throw new Error("Token tidak ditemukan pada respons login");
      }

      login(session);
      navigate("/admin/dashboard");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50/50 via-slate-50 to-rose-50/40 text-slate-800 px-4 selection:bg-amber-500/20 relative overflow-hidden">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-amber-200/20 rounded-full filter blur-3xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-200/20 rounded-full filter blur-3xl animate-float pointer-events-none" style={{ animationDelay: "2s" }}></div>

      <div className="max-w-md w-full bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden z-10">
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-600 font-bold mb-4 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda
          </Link>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">Login Admin Stan</h1>
          <p className="text-xs text-slate-500 mt-1">Masuk untuk mengelola produk dan antrean masak stan</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-black text-slate-400 uppercase tracking-widest"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder="admin@toko.com"
              className="w-full bg-slate-50 border border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-xs font-black text-slate-400 uppercase tracking-widest"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
              required
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/15 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed hover:shadow-orange-500/25 mt-4"
          >
            {loading ? "Menghubungkan..." : "Masuk Ke Dashboard"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-amber-500/5 border border-amber-200/50 rounded-2xl text-xs text-slate-650 space-y-1">
          <p className="font-bold text-amber-800">Akun Uji Coba (Demo Mode):</p>
          <p>Email: <code className="text-orange-600 bg-amber-500/10 px-1 py-0.5 rounded font-mono">admin@toko.com</code></p>
          <p>Password: <code className="text-orange-600 bg-amber-500/10 px-1 py-0.5 rounded font-mono">rahasia123</code></p>
        </div>

        <div className="mt-6 text-xs text-slate-500 text-center">
          Belum punya akun admin?{" "}
          <Link to="/admin/register" className="text-amber-600 hover:text-amber-700 font-bold transition">
            Daftar Akun
          </Link>
        </div>
      </div>
    </div>
  );
}
