// src/components/history/useOrderHistory.ts
import { useEffect, useState } from "react";

export interface OrderHistoryItemType {
  id: string;
  totalAmount: number;
  status: string;
  queueNumber: string;
  items: { qty: number; name: string; price: number }[];
  createdAt: string;
  pointsEarned: number;
  tenant: {
    name: string;
    imageUrl?: string;
    address?: string;
  };
  queue?: {
    status: string;
  };
}

export function useOrderHistory(email: string | null) {
  const [history, setHistory] = useState<OrderHistoryItemType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!email) return;
      setLoading(true);

      try {
        const res = await fetch(
          `https://festivaloka-dev.up.railway.app/api/orders/history?email=${email}`
        );

        if (!res.ok) throw new Error("History fetch response not OK");

        const data = (await res.json()) as OrderHistoryItemType[];

        // urut dari yang terbaru
        const sorted = data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setHistory(sorted);
      } catch (err) {
        console.warn("History fetch error, resolving from mock database:", err);
        // Load mock orders
        const mockOrdersObj = localStorage.getItem("mock_orders");
        const mockOrdersList = mockOrdersObj ? Object.values(JSON.parse(mockOrdersObj)) as any[] : [];
        
        const matched = mockOrdersList
          .filter((o) => o.customer?.email?.toLowerCase() === email.toLowerCase())
          .map((o) => ({
            id: o.id,
            totalAmount: o.totalAmount,
            status: o.status,
            queueNumber: o.queueNumber || "0",
            items: o.items,
            createdAt: new Date(o.customer?.id || Date.now()).toISOString(),
            pointsEarned: Math.floor(o.totalAmount / 10000),
            tenant: {
              name: o.tenant.name,
              imageUrl: o.tenant.imageUrl,
              address: o.tenant.address
            },
            queue: {
              status: o.queueStatus || "WAITING"
            }
          }));

        const sortedMock = matched.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setHistory(sortedMock);
      } finally {
        setLoading(false);
      }

    };

    load();
  }, [email]);

  return { history, loading };
}
