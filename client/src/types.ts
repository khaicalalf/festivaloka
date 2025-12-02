export type FoodPreference = {
  spicyLevel: "mild" | "medium" | "hot";
  halalOnly: boolean;
  notes?: string;
};

export type TenantCategory = "FOOD" | "DRINK";

export type TenantStatus = "RAMAI" | "SEPI" | "OPEN";

export type Tenant = {
  id: string;
  name: string;
  category: TenantCategory;
  description: string;
  isViral: boolean;
  status: TenantStatus;
  menus: MenuItem[]; // menus embedded for simplicity
};

export type MenuItem = {
  id: string;
  tenantId: number;
  name: string;
  price: number;
  description: string;
};

export type CartItem = {
  menuItem: MenuItem;
  quantity: number;
};

export type TransactionStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";

export type TransactionDetail = {
  uuid: string;
  status: TransactionStatus;
  queueNumber?: number;
  etaMinutes?: number; // estimasi selesai
  totalAmount: number;
  tenantName: string;
  createdAt: string;
};
