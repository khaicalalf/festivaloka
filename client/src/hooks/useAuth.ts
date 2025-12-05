import { useState, useEffect } from "react";

type Admin = {
  id: string;
  email: string;
  role: "admin";
};

export function useAuth() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek localStorage saat component mount
    const stored = localStorage.getItem("admin_auth");
    if (stored) {
      try {
        setAdmin(JSON.parse(stored));
      } catch {
        localStorage.removeItem("admin_auth");
      }
    }
    setLoading(false);
  }, []);

  const login = (adminData: Admin) => {
    setAdmin(adminData);
    localStorage.setItem("admin_auth", JSON.stringify(adminData));
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("admin_auth");
  };

  return { admin, loading, login, logout };
}
