import {
  getMockTenants,
  saveMockTenant,
  createMockCheckout,
  getMockOrders,
  simulateOrderStatusProgression,
  getMockQueues,
  updateMockTenantMenus
} from "./mockData";
import type { OrderResult, LoginResponse, MenuItem } from "../types";

const BASE_URL =
  import.meta.env.VITE_API_URL ?? "https://festivaloka-dev.up.railway.app";

// Helper to track if we're in offline/mock mode
let isMockMode = false;

export function getIsMockMode(): boolean {
  return isMockMode;
}

export function setIsMockMode(val: boolean) {
  isMockMode = val;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
      ...options,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed with status ${res.status}`);
    }

    isMockMode = false;
    return res.json() as Promise<T>;
  } catch (error) {
    console.warn(`[API Connection Failed] Path: ${path}. Falling back to mock database.`, error);
    isMockMode = true;
    
    // Simulate slight network delay for premium loader/feel
    await new Promise((resolve) => setTimeout(resolve, 300));
    return resolveMockRequest<T>(path, options);
  }
}

function resolveMockRequest<T>(path: string, options?: RequestInit): T {
  const urlObj = new URL(path, "http://localhost"); // mock url parser
  const pathname = urlObj.pathname;
  const method = options?.method?.toUpperCase() ?? "GET";

  // 1. GET /api/tenants or /api/kolosal-ai/tenantsByAI
  if ((pathname === "/api/tenants" || pathname === "/api/kolosal-ai/tenantsByAI") && method === "GET") {
    const prefQuery = urlObj.searchParams.get("preferences");
    const allTenants = getMockTenants();
    if (prefQuery) {
      const keywords = prefQuery.toLowerCase();
      const filtered = allTenants.filter(
        (t) =>
          t.name.toLowerCase().includes(keywords) ||
          t.category.toLowerCase().includes(keywords) ||
          t.description.toLowerCase().includes(keywords) ||
          t.menus.some((m) => m.name.toLowerCase().includes(keywords))
      );
      // If we filtered down to nothing, just return all tenants instead of showing a blank screen
      return (filtered.length ? filtered : allTenants) as unknown as T;
    }
    return allTenants as unknown as T;
  }

  // 2. GET /api/tenants/:id
  const tenantMatch = pathname.match(/^\/api\/tenants\/([^/]+)$/);
  if (tenantMatch && method === "GET") {
    const id = tenantMatch[1];
    const tenants = getMockTenants();
    const found = tenants.find((t) => String(t.id) === String(id));
    if (!found) throw new Error("Tenant not found in mock database");
    return found as unknown as T;
  }

  // 3. POST /api/tenants
  if (pathname === "/api/tenants" && method === "POST") {
    const payload = JSON.parse(options?.body as string);
    const added = saveMockTenant(payload);
    return added as unknown as T;
  }

  // 4. POST /api/tenants/:id/menus (Create Menu)
  const createMenuMatch = pathname.match(/^\/api\/tenants\/([^/]+)\/menus$/);
  if (createMenuMatch && method === "POST") {
    const tenantId = createMenuMatch[1];
    const menuData = JSON.parse(options?.body as string);
    const tenants = getMockTenants();
    const tenantIndex = tenants.findIndex((t) => String(t.id) === String(tenantId));
    if (tenantIndex === -1) throw new Error("Tenant not found");
    
    const newMenu: MenuItem = {
      id: String(Date.now()),
      tenantId: String(tenantId),
      name: menuData.name,
      price: menuData.price,
      description: menuData.description
    };
    
    const updatedMenus = [...tenants[tenantIndex].menus, newMenu];
    updateMockTenantMenus(tenantId, updatedMenus);
    
    return {
      id: Number(newMenu.id),
      name: newMenu.name,
      price: newMenu.price,
      description: newMenu.description,
      tenantId: Number(tenantId),
      isAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as unknown as T;
  }

  // 5. PUT /api/tenants/menus/:id (Update Menu)
  const updateMenuMatch = pathname.match(/^\/api\/tenants\/menus\/([^/]+)$/);
  if (updateMenuMatch && method === "PUT") {
    const menuId = updateMenuMatch[1];
    const menuData = JSON.parse(options?.body as string);
    const tenants = getMockTenants();
    
    let foundMenu: MenuItem | null = null;
    let targetTenantId = "";
    
    for (const t of tenants) {
      const idx = t.menus.findIndex((m) => String(m.id) === String(menuId));
      if (idx !== -1) {
        t.menus[idx] = { ...t.menus[idx], ...menuData };
        foundMenu = t.menus[idx];
        targetTenantId = t.id;
        break;
      }
    }
    
    if (!foundMenu) throw new Error("Menu not found");
    updateMockTenantMenus(targetTenantId, tenants.find(t => t.id === targetTenantId)!.menus);
    return foundMenu as unknown as T;
  }

  // 6. DELETE /api/tenants/menus/:id (Delete Menu)
  const deleteMenuMatch = pathname.match(/^\/api\/tenants\/menus\/([^/]+)$/);
  if (deleteMenuMatch && method === "DELETE") {
    const menuId = deleteMenuMatch[1];
    const tenants = getMockTenants();
    let targetTenantId = "";
    
    for (const t of tenants) {
      const idx = t.menus.findIndex((m) => String(m.id) === String(menuId));
      if (idx !== -1) {
        t.menus.splice(idx, 1);
        targetTenantId = t.id;
        break;
      }
    }
    
    if (targetTenantId) {
      updateMockTenantMenus(targetTenantId, tenants.find(t => t.id === targetTenantId)!.menus);
    }
    return { success: true } as unknown as T;
  }

  // 7. POST /api/orders/checkout
  if (pathname === "/api/orders/checkout" && method === "POST") {
    const payload = JSON.parse(options?.body as string);
    const checkoutResult = createMockCheckout(payload);
    return checkoutResult as unknown as T;
  }

  // 8. GET /api/orders/result/:id
  const orderResultMatch = pathname.match(/^\/api\/orders\/result\/([^/]+)$/);
  if (orderResultMatch && method === "GET") {
    const orderId = orderResultMatch[1];
    const updated = simulateOrderStatusProgression(orderId);
    if (!updated) {
      // Create a dynamic successful mock order if not found, to prevent blank/not found screen
      const mockOrder: OrderResult = {
        id: orderId,
        totalAmount: 108000,
        status: "PAID",
        queueStatus: "WAITING",
        queueNumber: "42",
        items: [
          { qty: 2, name: "Bakmie Kepiting Spesial", price: 38000 },
          { qty: 1, name: "Es Teler Spesial 77", price: 25000 }
        ],
        tenant: {
          id: 2,
          name: "Bakmie Kepiting Pontianak",
          category: "FOOD",
          description: "Bakmie kepiting khas Pontianak",
          address: "B-02",
          status: "OPEN"
        },
        customer: {
          id: Date.now(),
          email: "demo@festivaloka.com",
          phone: "081234567890"
        }
      };
      return mockOrder as unknown as T;
    }
    return updated as unknown as T;
  }

  // 9. GET /api/queues/dashboard/:tenantId
  const queueDashboardMatch = pathname.match(/^\/api\/queues\/dashboard\/([^/]+)$/);
  if (queueDashboardMatch && method === "GET") {
    const tenantId = queueDashboardMatch[1];
    return getMockQueues(tenantId) as unknown as T;
  }

  // 10. PATCH /api/queues/:id/status
  const queueStatusMatch = pathname.match(/^\/api\/queues\/([^/]+)\/status$/);
  if (queueStatusMatch && method === "PATCH") {
    const queueId = queueStatusMatch[1];
    const payload = JSON.parse(options?.body as string);
    // Find order in mock db and update its queueStatus
    const orders = getMockOrders();
    const order = Object.values(orders).find((o) => o.queueNumber === queueId || o.id === queueId);
    if (order) {
      order.queueStatus = payload.status;
      if (payload.status === "DONE") {
        order.queueStatus = "FINISHED";
      }
      localStorage.setItem("mock_orders", JSON.stringify(orders));
    }
    return { success: true } as unknown as T;
  }

  // 11. POST /api/auth/login
  if (pathname === "/api/auth/login" && method === "POST") {
    const payload = JSON.parse(options?.body as string);
    if (
      (payload.email === "admin@festivaloka.com" && payload.password === "password123") ||
      (payload.email === "admin@toko.com" && payload.password === "rahasia123")
    ) {
      const loginResp: LoginResponse = {
        id: 999,
        email: payload.email,
        role: "TENANT_ADMIN",
        tenantId: "1",
        user: {
          id: 999,
          email: payload.email,
          role: "TENANT_ADMIN",
          tenantId: "1"
        },
        access_token: "mock-jwt-token-xyz"
      };
      return loginResp as unknown as T;
    } else {
      // Check local storage for custom registered admins
      const registeredAdmins = JSON.parse(localStorage.getItem("mock_registered_admins") || "[]");
      const found = registeredAdmins.find(
        (a: any) => a.email === payload.email && a.password === payload.password
      );
      if (found) {
        const loginResp: LoginResponse = {
          id: found.id,
          email: found.email,
          role: found.role,
          tenantId: String(found.tenantId),
          user: {
            id: found.id,
            email: found.email,
            role: found.role,
            tenantId: String(found.tenantId)
          },
          access_token: "mock-jwt-token-" + found.id
        };
        return loginResp as unknown as T;
      }
      throw new Error("Email atau password admin salah (Mock DB)");
    }
  }

  // 12. POST /api/auth/register
  if (pathname === "/api/auth/register" && method === "POST") {
    const payload = JSON.parse(options?.body as string);
    const registeredAdmins = JSON.parse(localStorage.getItem("mock_registered_admins") || "[]");
    const newAdmin = {
      id: Date.now(),
      email: payload.email,
      password: payload.password,
      role: payload.role,
      tenantId: payload.tenantId || 1
    };
    registeredAdmins.push(newAdmin);
    localStorage.setItem("mock_registered_admins", JSON.stringify(registeredAdmins));

    const loginResp: LoginResponse = {
      id: newAdmin.id,
      email: newAdmin.email,
      role: newAdmin.role,
      tenantId: String(newAdmin.tenantId),
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role,
        tenantId: String(newAdmin.tenantId)
      },
      access_token: "mock-jwt-token-" + newAdmin.id
    };
    return loginResp as unknown as T;
  }

  throw new Error(`Endpoint mock tidak didefinisikan: ${method} ${pathname}`);
}

export const apiClient = { request };

