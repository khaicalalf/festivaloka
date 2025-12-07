// src/components/history/useOrderHistory.ts
import { useEffect, useState } from "react";

export interface OrderHistoryItemType {
  id: string;
  totalAmount: number;
  status: string;
  queueNumber: string;
  items: { qty: number; name: string; price: number }[];
  createdAt: string;
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

        const data = (await res.json()) as OrderHistoryItemType[];

        // urut dari yang terbaru
        const sorted = data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setHistory(sorted);
      } catch (err) {
        console.error("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [email]);

  return { history, loading };
}
