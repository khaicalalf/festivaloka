import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function AdminDashboard() {
  const nav = useNavigate();
  const { admin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    nav("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, <strong>{admin?.email}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Total Users */}
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-sm text-gray-600 mb-2">Total Users</h3>
            <p className="text-3xl font-bold">0</p>
          </div>

          {/* Card 2: Total Tenants */}
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-sm text-gray-600 mb-2">Total Tenants</h3>
            <p className="text-3xl font-bold">0</p>
          </div>

          {/* Card 3: Total Transactions */}
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-sm text-gray-600 mb-2">Total Transactions</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Manage Content</h2>
          <div className="space-y-2">
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
              📝 Manage Tenants
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
              🛒 View Orders
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
              👥 Manage Users
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
