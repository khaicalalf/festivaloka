import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { TransactionResultPage } from "./pages/TransactionResultPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRegister from "./pages/admin/AdminRegister";
import { useAuth } from "./hooks/useAuth";

function AdminAuthRoute({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return admin ? <>{children}</> : <Navigate to="/admin/login" replace />;
}
import { DenahPage } from "./pages/DenahPage";

export function App() {
  const { admin, loading } = useAuth();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/transaction/:uuid" element={<TransactionResultPage />} />

        {/* Admin routes */}
        <Route
          path="/admin/login"
          element={
            admin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />
          }
        />
        <Route
          path="/admin/register"
          element={
            admin ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <AdminRegister />
            )
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <AdminAuthRoute>
              <AdminDashboard />
            </AdminAuthRoute>
          }
        />

        {/* Redirect /admin to /admin/login */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="*" element={<h1>404 | Halaman Tidak Ditemukan</h1>} />
        <Route path="/denah" element={<DenahPage />} />
        <Route path="/transaction/:id" element={<TransactionResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}
