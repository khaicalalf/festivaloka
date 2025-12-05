import { useState } from "react";
import { fetchTenantMenu } from "../api/tenants";
import type { MenuItem, Tenant } from "../types";

export function useTenantMenu() {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);

  const loadMenu = async (tenant: Tenant) => {
    setLoadingMenu(true);
    try {
      const fullTenant = await fetchTenantMenu(tenant.id);
      setSelectedTenant(fullTenant);
      setMenu(fullTenant.menus);
    } finally {
      setLoadingMenu(false);
    }
  };

  return { selectedTenant, menu, loadingMenu, loadMenu };
}
