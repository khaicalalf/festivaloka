/* eslint-disable @typescript-eslint/no-explicit-any */
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

      if (!data) {
        console.log(data);
      }

      const session: any = {
        id: data.id,
        email: data.email,
        role: data.role,
        tenantId: data.tenantId,
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Register</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
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
              className="w-full border rounded px-3 py-2 text-sm"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="role" className="text-sm font-medium text-gray-700">
              Role
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
              className="w-full border rounded px-3 py-2 text-sm bg-white"
              disabled={loading}
            >
              <option value="TENANT_ADMIN">TENANT_ADMIN</option>
              <option value="karyawan">karyawan</option>
            </select>
            <p className="text-xs text-gray-500">
              Role TENANT_ADMIN tidak terkait tenant tertentu.
            </p>
          </div>

          {role === "karyawan" && (
            <div className="space-y-1">
              <label
                htmlFor="tenant"
                className="text-sm font-medium text-gray-700"
              >
                Tenant
              </label>

              <select
                id="tenant"
                value={tenantId} // Mengambil nilai ID yang sedang terpilih
                onChange={(e) => {
                  setTenantId(e.target.value); // Menyimpan ID yang baru dipilih ke state
                  if (error) setError("");
                }}
                className="w-full border rounded px-3 py-2 text-sm bg-white"
                disabled={loading || tenantsLoading}
              >
                <option value="">- Pilih tenant -</option>

                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {/* Nilai (value) yang disimpan adalah ID, tetapi yang ditampilkan adalah Nama */}
                    {t.name}
                  </option>
                ))}
              </select>

              {tenantsLoading && (
                <p className="text-xs text-gray-500">Memuat daftar tenant...</p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
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
              className="w-full border rounded px-3 py-2 text-sm"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="confirm"
              className="text-sm font-medium text-gray-700"
            >
              Konfirmasi Password
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
              className="w-full border rounded px-3 py-2 text-sm"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded disabled:bg-gray-400"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600 text-center">
          Sudah punya akun?{" "}
          <Link to="/admin/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
