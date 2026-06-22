import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { Tenant } from "../../types";
import { registerAdmin, type RegisterAdminPayload } from "../../api/admin";
import { fetchTenants } from "../../api/tenants";

export default function AdminRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] =
    useState<RegisterAdminPayload["role"]>("TENANT_ADMIN");
  const [tenantId, setTenantId] = useState<string>("");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (role === "karyawan") {
      setTenantsLoading(true);
      fetchTenants()
        .then((data) => {
          setTenants(data);
        })
        .catch((e) => {
          console.error("Gagal memuat tenants", e);
        })
        .finally(() => {
          setTenantsLoading(false);
        });
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    let tenantIdPayload: number | null = null;
    if (role === "TENANT_ADMIN") {
      tenantIdPayload = null;
    } else {
      if (!tenantId) {
        setError("Silakan pilih tenant untuk role karyawan");
        return;
      }

      const parsedId = Number(tenantId);
      if (isNaN(parsedId)) {
        setError("ID tenant tidak valid.");
        return;
      }
      tenantIdPayload = parsedId;
    }

    const payload: RegisterAdminPayload = {
      email,
      password,
      role,
      tenantId: tenantIdPayload,
    };

    setLoading(true);
    try {
      const data = await registerAdmin(payload);

      const session: any = {
        id: data.id,
        email: data.email,
        role: data.role,
        tenantId: data.tenantId,
        access_token: data.access_token,
      };

      login(session);
      navigate("/admin/dashboard");
    } catch (err: unknown) {
      let message = "Terjadi kesalahan saat registrasi";
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
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/10 rounded-full filter blur-2xl"></div>

        <div className="text-center mb-8">
          <Link to="/admin/login" className="inline-flex items-center gap-2 text-rose-500 hover:text-rose-400 font-bold mb-3 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Login
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight mt-2">Daftar Admin Baru</h1>
          <p className="text-xs text-slate-400 mt-1">Buat akun untuk mengelola stan Anda</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-2xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label htmlFor="role" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Role Jabatan
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => {
                const val = e.target.value as RegisterAdminPayload["role"];
                setRole(val);
                if (val === "TENANT_ADMIN") {
                  setTenantId("");
                }
                if (error) setError("");
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-2xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
              disabled={loading}
            >
              <option value="TENANT_ADMIN">TENANT_ADMIN (Super Admin)</option>
              <option value="karyawan">Karyawan (Staf Toko)</option>
            </select>
          </div>

          {role === "karyawan" && (
            <div className="space-y-2">
              <label
                htmlFor="tenant"
                className="text-xs font-bold text-slate-400 uppercase tracking-wider"
              >
                Pilih Stan Kerja
              </label>

              <select
                id="tenant"
                value={tenantId}
                onChange={(e) => {
                  setTenantId(e.target.value);
                  if (error) setError("");
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-2xl px-4 py-3 text-sm text-slate-350 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
                disabled={loading || tenantsLoading}
              >
                <option value="">- Pilih stan -</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              {tenantsLoading && (
                <p className="text-[10px] text-slate-500 animate-pulse">Memuat daftar stan...</p>
              )}
            </div>
          )}

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

          <div className="space-y-2">
            <label
              htmlFor="confirm"
              className="text-xs font-bold text-slate-400 uppercase tracking-wider"
            >
              Ulangi Password
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
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
            className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-rose-950/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed hover:shadow-rose-950/40 mt-4"
          >
            {loading ? "Mendaftarkan..." : "Daftar Akun Baru"}
          </button>
        </form>

        <div className="mt-6 text-xs text-slate-400 text-center">
          Sudah punya akun admin?{" "}
          <Link to="/admin/login" className="text-rose-400 hover:text-rose-300 font-bold transition">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
