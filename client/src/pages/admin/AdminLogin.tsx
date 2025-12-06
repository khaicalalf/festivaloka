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

      // mapping eksplisit ke AuthSession
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 p-3 bg-blue-50 text-sm text-blue-700 rounded">
          Demo email <code>admin@toko.com</code>, password{" "}
          <code>rahasia123</code>
        </div>
        <div className="mt-4 text-sm text-gray-600 text-center">
          Belum punya akun?{" "}
          <Link to="/admin/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
