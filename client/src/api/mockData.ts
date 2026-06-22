import type { Tenant, MenuItem, OrderResult, QueueItem } from "../types";

// Helper to generate unique string ID
const generateId = () => Math.random().toString(36).substring(2, 9);

const DEFAULT_TENANTS: Tenant[] = [
  {
    id: "1",
    name: "Sate Khas Senayan",
    category: "FOOD",
    description: "Sate ayam premium dengan bumbu kacang lembut legendaris khas Jawa Tengah.",
    isViral: true,
    status: "RAMAI",
    address: "A-01",
    imageUrl: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=500&auto=format&fit=crop&q=60",
    menus: [
      { id: "101", tenantId: "1", name: "Sate Ayam Premium", price: 45000, description: "10 tusuk sate ayam empuk disajikan dengan bumbu kacang khas." },
      { id: "102", tenantId: "1", name: "Sate Kambing Campur", price: 55000, description: "10 tusuk sate kambing muda empuk dengan kecap manis dan irisan bawang merah." },
      { id: "103", tenantId: "1", name: "Tahu Telur", price: 28000, description: "Tahu goreng telur dadar tebal disiram bumbu kacang manis gurih." }
    ]
  },
  {
    id: "2",
    name: "Bakmie Kepiting Pontianak",
    category: "FOOD",
    description: "Mie kuning kenyal khas Pontianak dengan topping daging kepiting segar melimpah.",
    isViral: true,
    status: "OPEN",
    address: "B-02",
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60",
    menus: [
      { id: "201", tenantId: "2", name: "Bakmie Kepiting Spesial", price: 38000, description: "Bakmie kepiting lengkap dengan bakso ikan, kekian, empang, dan capit kepiting asli." },
      { id: "202", tenantId: "2", name: "Bakmie Ayam Jamur", price: 28000, description: "Bakmie gurih dengan cincangan daging ayam kecap dan jamur merang segar." },
      { id: "203", tenantId: "2", name: "Pangsit Goreng Crispy", price: 18000, description: "5 pcs pangsit goreng renyah dengan isian ayam giling bumbu rempah." }
    ]
  },
  {
    id: "3",
    name: "Kopi Kenangan",
    category: "DRINK",
    description: "Kopi susu kekinian yang manis dan menyegarkan dengan racikan gula aren murni.",
    isViral: false,
    status: "SEPI",
    address: "C-01",
    imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=60",
    menus: [
      { id: "301", tenantId: "3", name: "Kopi Kenangan Mantan", price: 18000, description: "Kopi espresso dipadukan susu segar dan gula aren cair premium asli Indonesia." },
      { id: "302", tenantId: "3", name: "Latte Susu Oat", price: 24000, description: "Kopi susu premium menggunakan alternatif susu oat ramah vegan." },
      { id: "303", tenantId: "3", name: "Matcha Latte", price: 28000, description: "Green tea matcha jepang grade tinggi yang diseduh dengan susu segar hangat/dingin." }
    ]
  },
  {
    id: "4",
    name: "Gudeg Yu Djum",
    category: "FOOD",
    description: "Nasi gudeg otentik manis gurih khas Yogyakarta dengan resep legendaris.",
    isViral: false,
    status: "OPEN",
    address: "A-02",
    imageUrl: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=60",
    menus: [
      { id: "401", tenantId: "4", name: "Nasi Gudeg Komplit", price: 35000, description: "Nasi, gudeg nangka, krecek pedas, telur bacem utuh, dan suwiran ayam kampung." },
      { id: "402", tenantId: "4", name: "Nasi Gudeg Telur Tahu", price: 25000, description: "Nasi, gudeg nangka, sambel goreng krecek gurih, telur bacem, dan tahu bacem." }
    ]
  },
  {
    id: "5",
    name: "Es Teler 77",
    category: "DRINK",
    description: "Pioneer es teler segar dengan potongan alpukat mentega, kelapa muda, nangka, dan susu.",
    isViral: false,
    status: "RAMAI",
    address: "B-01",
    imageUrl: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=500&auto=format&fit=crop&q=60",
    menus: [
      { id: "501", tenantId: "5", name: "Es Teler Spesial 77", price: 25000, description: "Alpukat segar, kelapa serut, potongan nangka wangi disiram susu kental manis legendaris." },
      { id: "502", tenantId: "5", name: "Es Teler Durian", price: 32000, description: "Es teler klasik dilengkapi dengan 2 buah daging durian Medan manis beraroma kuat." },
      { id: "503", tenantId: "5", name: "Bakso Super Urat", price: 30000, description: "Bakso sapi urat besar gurih kenyal disajikan dengan mie kuning halus dan bihun kuah kaldu panas." }
    ]
  },
  {
    id: "6",
    name: "Martabak Pecenongan 78",
    category: "FOOD",
    description: "Martabak manis tebal mentega premium Wijsman dengan topping padat melimpah ruah.",
    isViral: true,
    status: "OPEN",
    address: "C-02",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df056fb49785?w=500&auto=format&fit=crop&q=60",
    menus: [
      { id: "601", tenantId: "6", name: "Martabak Klasik Cokelat Keju", price: 65000, description: "Martabak manis ukuran besar bertabur meises cokelat melimpah dan keju parut gurih berkualitas." },
      { id: "602", tenantId: "6", name: "Martabak Telur Bebek Spesial", price: 55000, description: "Martabak telur bebek tebal renyah berisi daun bawang wangi dan daging sapi cincang bumbu kari." }
    ]
  }
];

// Local state initialization helpers
export function getMockTenants(): Tenant[] {
  const local = localStorage.getItem("mock_tenants");
  if (!local) {
    localStorage.setItem("mock_tenants", JSON.stringify(DEFAULT_TENANTS));
    return DEFAULT_TENANTS;
  }
  return JSON.parse(local);
}

export function saveMockTenant(tenantPayload: any): Tenant {
  const tenants = getMockTenants();
  const newTenant: Tenant = {
    id: String(tenants.length + 1),
    name: tenantPayload.name,
    category: tenantPayload.category as any,
    description: tenantPayload.description,
    isViral: false,
    status: "OPEN",
    address: tenantPayload.address,
    imageUrl: tenantPayload.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60",
    menus: []
  };
  tenants.push(newTenant);
  localStorage.setItem("mock_tenants", JSON.stringify(tenants));
  return newTenant;
}

export function updateMockTenantMenus(tenantId: string, menus: MenuItem[]) {
  const tenants = getMockTenants();
  const updated = tenants.map((t) => {
    if (String(t.id) === String(tenantId)) {
      return { ...t, menus };
    }
    return t;
  });
  localStorage.setItem("mock_tenants", JSON.stringify(updated));
}

// Order helpers
export function getMockOrders(): Record<string, OrderResult> {
  const local = localStorage.getItem("mock_orders");
  return local ? JSON.parse(local) : {};
}

export function saveMockOrder(order: OrderResult) {
  const orders = getMockOrders();
  orders[order.id] = order;
  localStorage.setItem("mock_orders", JSON.stringify(orders));
}

// Queue simulator & status progress generator
export function simulateOrderStatusProgression(orderId: string): OrderResult | null {
  const orders = getMockOrders();
  const order = orders[orderId];
  if (!order) return null;

  const creationTime = new Date(order.customer?.id || Date.now()).getTime(); // simulate timestamp using customer.id
  const elapsedSeconds = (Date.now() - creationTime) / 1000;

  let changed = false;

  // Progression thresholds
  if (order.status === "PENDING" && elapsedSeconds > 8) {
    order.status = "PAID";
    order.queueStatus = "WAITING";
    order.queueNumber = String(Math.floor(Math.random() * 90) + 10);
    changed = true;
  } else if (order.queueStatus === "WAITING" && elapsedSeconds > 25) {
    order.queueStatus = "PROCESSING";
    changed = true;
  } else if (order.queueStatus === "PROCESSING" && elapsedSeconds > 50) {
    order.queueStatus = "FINISHED";
    changed = true;
  }

  if (changed) {
    saveMockOrder(order);
  }
  return order;
}

export function createMockCheckout(payload: {
  email: string;
  phone: string;
  tenantId: number;
  totalAmount: number;
  items: { name: string; price: number; qty: number }[];
}): { snapToken: string; orderId: string } {
  const tenants = getMockTenants();
  const tenant = tenants.find((t) => Number(t.id) === Number(payload.tenantId)) || DEFAULT_TENANTS[0];

  const orderId = "order-" + generateId();
  const snapToken = "snap-" + generateId();

  const mockOrder: OrderResult = {
    id: orderId,
    totalAmount: payload.totalAmount,
    status: "PENDING",
    queueStatus: "WAITING",
    items: payload.items,
    tenant: {
      id: Number(tenant.id),
      name: tenant.name,
      category: tenant.category,
      description: tenant.description,
      address: tenant.address,
      imageUrl: tenant.imageUrl,
      status: tenant.status
    },
    customer: {
      id: Date.now(), // abuse id field as creation timestamp
      email: payload.email,
      phone: payload.phone
    }
  };

  saveMockOrder(mockOrder);
  return { snapToken, orderId };
}

// Queue list for dashboard admin
export function getMockQueues(tenantId: number | string): QueueItem[] {
  const orders = getMockOrders();
  const filteredOrders = Object.values(orders).filter(
    (o) => Number(o.tenant.id) === Number(tenantId)
  );

  return filteredOrders.map((order, index) => ({
    id: index + 1000,
    number: order.queueNumber || `Q-${index + 1}`,
    status: order.queueStatus === "FINISHED" ? "CALLED" : "WAITING",
    orderId: order.id,
    tenantId: order.tenant.id,
    createdAt: new Date().toISOString(),
    order: {
      id: order.id,
      items: order.items,
      totalAmount: order.totalAmount,
      customer: {
        email: order.customer?.email || "",
        phone: order.customer?.phone || ""
      }
    }
  }));
}

// Client NLP AI voice match logic
export function parseLocalVoiceCommand(queryText: string): {
  tenantId: number;
  menuId: number;
  quantity: number;
  reason: string;
} {
  const text = queryText.toLowerCase();
  const tenants = getMockTenants();

  // 1. Try to find the matching menu item inside any tenant
  for (const tenant of tenants) {
    for (const menu of tenant.menus) {
      if (text.includes(menu.name.toLowerCase()) || 
          text.includes(menu.description.toLowerCase()) ||
          (text.includes("sate") && tenant.id === "1") ||
          (text.includes("kepiting") && tenant.id === "2") ||
          (text.includes("bakmie") && tenant.id === "2") ||
          (text.includes("kopi") && tenant.id === "3") ||
          (text.includes("gudeg") && tenant.id === "4") ||
          (text.includes("teler") && tenant.id === "5") ||
          (text.includes("teller") && tenant.id === "5") ||
          (text.includes("martabak") && tenant.id === "6")) {
        
        // Extract quantity from text if available
        let qty = 1;
        const matches = text.match(/(\d+)\s*(porsi|gelas|mangkok|buah|biji|pcs|pc)?/);
        if (matches) {
          qty = Number(matches[1]);
        } else if (text.includes("dua")) {
          qty = 2;
        } else if (text.includes("tiga")) {
          qty = 3;
        }

        return {
          tenantId: Number(tenant.id),
          menuId: Number(menu.id),
          quantity: qty,
          reason: `Terdeteksi kata kunci cocok dengan menu "${menu.name}" di tenant "${tenant.name}".`
        };
      }
    }
  }

  // Fallback to Sate Ayam (first item of first tenant)
  return {
    tenantId: 1,
    menuId: 101,
    quantity: 1,
    reason: "Maaf, AI tidak memahami detail pesanan Anda. Kami merekomendasikan Sate Ayam Premium dari Sate Khas Senayan."
  };
}
