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
  address?: string;
  imageUrl?: string;
};

export type MenuItem = {
  id: string;
  tenantId: string;
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

export type OrderResult = {
  id: string;
  totalAmount: number;
  status: "PAID" | "PENDING" | "FAILED" | "CANCEL";
  queueNumber?: string;
  queueStatus?: "WAITING" | "PROCESSING" | "FINISHED" | "CANCELLED";

  items: {
    qty: number;
    name: string;
    price: number;
  }[];

  tenant: {
    id: number;
    name: string;
    category: string;
    description: string;
    imageUrl?: string;
    address?: string;
    status: string;
  };

  customer?: {
    id: number;
    email: string;
    phone: string;
  };
};

// Admin/auth types
export type AdminProfile = {
  id: number;
  email: string;
  role: string;
  tenantId?: string;
};

export type AuthSession = AdminProfile & {
  // access_token: string;
};

// API response types
export type LoginResponse = {
  access_token: string;
  id: number;
  email: string;
  role: string;
  tenantId?: string;
};

// Transaction API types
export type CreateTransactionPayload = {
  tenantId: string;
  items: { menuItemId: string; quantity: number }[];
  email?: string;
  phone?: string;
  preferences: FoodPreference;
};

export type CreateTransactionResponse = {
  uuid: string;
  redirectUrl: string; // ke Midtrans
};
