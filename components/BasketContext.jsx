"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const BasketContext = createContext(null);
const STORAGE_KEY = "danadine_basket_v1";

function lineKey(item) {
  return [item.productId, item.size || "", item.color || ""].join("::");
}

export function BasketProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full or unavailable
    }
  }, [items, loaded]);

  const addItem = useCallback((product, { size, color, quantity = 1 } = {}) => {
    setItems((prev) => {
      const newLine = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || null,
        size: size || null,
        color: color || null,
        quantity,
      };
      const key = lineKey(newLine);
      const existing = prev.find((i) => lineKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          lineKey(i) === key ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, newLine];
    });
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => lineKey(i) !== key)
        : prev.map((i) => (lineKey(i) === key ? { ...i, quantity } : i))
    );
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((i) => lineKey(i) !== key));
  }, []);

  const clearBasket = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  const value = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearBasket,
    count,
    subtotal,
    lineKey,
    loaded,
  };

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasket must be used inside <BasketProvider>");
  return ctx;
}
