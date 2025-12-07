/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import type { AuthSession } from "../types";

export function useAuth() {
  const [admin, setAdmin] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("admin_auth");
    if (stored) {
      try {
        const parsed: AuthSession = JSON.parse(stored);
        // validasi minimal: harus ada access_token
        if (
          parsed &&
          typeof parsed.access_token === "string" &&
          parsed.access_token.length > 0
        ) {
          setAdmin(parsed);
        } else {
          localStorage.removeItem("admin_auth");
        }
      } catch {
        localStorage.removeItem("admin_auth");
      }
    }
    setLoading(false);
  }, []);

  const login = (session: AuthSession) => {
    setAdmin(session);
    localStorage.setItem("admin_auth", JSON.stringify(session));
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("admin_auth");
  };

  return { admin, loading, login, logout };
}
