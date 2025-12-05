// src/hooks/useCart.ts
import { useState } from "react";
import type { CartItem, MenuItem } from "../types";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const changeQty = (menu: MenuItem, qty: number) => {
    setCart((prev) => {
      if (qty === 0) return prev.filter((c) => c.menuItem.id !== menu.id);
      const exist = prev.find((c) => c.menuItem.id === menu.id);
      if (!exist) return [...prev, { menuItem: menu, quantity: qty }];
      return prev.map((c) =>
        c.menuItem.id === menu.id ? { ...c, quantity: qty } : c
      );
    });
  };

  return { cart, setCart, changeQty };
}
