// src/hooks/useTenants.ts
import { useState, useEffect } from "react";
import { getTenantsByAI } from "../api/tenants";
import type { Tenant } from "../types";

export function useTenants(preferences: string) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  useEffect(() => {
    setLoadingTenants(true);

    // tampilkan skeleton instan
    requestAnimationFrame(() => {
      (async () => {
        try {
          const aiTenants = await getTenantsByAI(preferences);
          setTenants(aiTenants ?? []);
        } catch (error) {
          console.error("AI error:", error);
          setTenants([]);
        } finally {
          setLoadingTenants(false);
        }
      })();
    });
  }, [preferences]);

  return { tenants, loadingTenants };
}
