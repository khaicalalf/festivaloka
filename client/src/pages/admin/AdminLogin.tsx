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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4 selection:bg-rose-500/30">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/10 rounded-full filter blur-2xl"></div>

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-rose-500 hover:text-rose-400 font-bold mb-3 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight mt-2">Login Admin Stan</h1>
          <p className="text-xs text-slate-400 mt-1">Kelola menu dan antrean stan Anda</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-2xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-bold text-slate-400 uppercase tracking-wider"
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
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-xs font-bold text-slate-400 uppercase tracking-wider"
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
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
              required
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-rose-950/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed hover:shadow-rose-950/40"
          >
            {loading ? "Menghubungkan..." : "Login Ke Dashboard"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-slate-400 space-y-1">
          <p className="font-bold text-slate-300">Akun Uji Coba Demo (Offline Mode):</p>
          <p>Email: <code className="text-rose-400 bg-slate-900 px-1 py-0.5 rounded font-mono">admin@toko.com</code></p>
          <p>Password: <code className="text-rose-400 bg-slate-900 px-1 py-0.5 rounded font-mono">rahasia123</code></p>
        </div>

        <div className="mt-6 text-xs text-slate-400 text-center">
          Belum punya akun admin?{" "}
          <Link to="/admin/register" className="text-rose-400 hover:text-rose-300 font-bold transition">
            Daftar Akun
          </Link>
        </div>
      </div>
    </div>
  );
}
