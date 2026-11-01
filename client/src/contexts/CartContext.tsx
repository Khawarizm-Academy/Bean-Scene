import type { Product } from "@/data/products";
import { formatCurrency } from "@/data/products";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";

export type CartItem = Product & { quantity: number };
export type CartPersistence = "checking" | "saved" | "session-only";
export type CompletedOrder = {
  orderNumber: string;
  customerName: string;
  demo: boolean;
  persistence: "preview-only" | "saved";
  emailDelivery: "not-configured";
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  cartPersistence: CartPersistence;
  cartPersistenceMessage: string;
  cartAnnouncement: string;
  lastOrder: CompletedOrder | null;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  retryCartPersistence: () => void;
  setCartOpen: (isOpen: boolean) => void;
  setLastOrder: Dispatch<SetStateAction<CompletedOrder | null>>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "bean-scene-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [cartPersistence, setCartPersistence] = useState<CartPersistence>("checking");
  const [cartPersistenceMessage, setCartPersistenceMessage] = useState("Checking this browser's cart storage.");
  const [cartAnnouncement, setCartAnnouncement] = useState("");
  const [lastOrder, setLastOrder] = useState<CompletedOrder | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (!Array.isArray(parsed)) throw new Error("The saved cart is not valid.");
        setItems(parsed as CartItem[]);
      }
      setCartPersistence("saved");
      setCartPersistenceMessage("Cart changes are saved in this browser.");
    } catch {
      setCartPersistence("session-only");
      setCartPersistenceMessage("Browser storage is unavailable or the saved cart could not be read. Your cart is session-only in this tab.");
      try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* Keep the session cart usable. */ }
    } finally {
      setHydrated(true);
    }
  }, []);

  const commitItems = useCallback((nextItems: CartItem[], action: string) => {
    setItems(nextItems);
    let nextPersistence: CartPersistence = "saved";
    let storageMessage = "Cart saved on this device.";
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
      setCartPersistence("saved");
      setCartPersistenceMessage("Cart changes are saved in this browser.");
    } catch {
      nextPersistence = "session-only";
      storageMessage = "Browser storage is unavailable; this cart is session-only and may be lost when this tab closes.";
      setCartPersistence("session-only");
      setCartPersistenceMessage(storageMessage);
    }
    const count = nextItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = nextItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCartAnnouncement(`${action} ${count} ${count === 1 ? "item" : "items"} in cart. Subtotal ${formatCurrency(subtotal)}. ${nextPersistence === "saved" ? "Cart saved on this device." : storageMessage}`);
  }, []);

  const addItem = useCallback((product: Product, quantity = 1) => {
    const existing = items.find((item) => item.id === product.id);
    const nextItems = existing
      ? items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
      : [...items, { ...product, quantity }];
    commitItems(nextItems, `${quantity} ${product.name} ${quantity === 1 ? "added" : "added"}.`);
    setCartOpen(true);
  }, [items, commitItems]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    const nextItems = quantity <= 0
      ? items.filter((entry) => entry.id !== id)
      : items.map((entry) => entry.id === id ? { ...entry, quantity } : entry);
    const message = quantity <= 0 ? `${item.name} removed.` : `${item.name} quantity changed to ${quantity}.`;
    commitItems(nextItems, message);
  }, [items, commitItems]);

  const removeItem = useCallback((id: string) => {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    commitItems(items.filter((entry) => entry.id !== id), `${item.name} removed.`);
  }, [items, commitItems]);

  const clearCart = useCallback(() => {
    commitItems([], "Cart cleared after order confirmation.");
  }, [commitItems]);

  const retryCartPersistence = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setCartPersistence("saved");
      setCartPersistenceMessage("Cart saved on this device.");
      setCartAnnouncement("Cart saved on this device. Your current selections are preserved.");
    } catch {
      setCartPersistence("session-only");
      setCartPersistenceMessage("Browser storage is still unavailable. Keep this tab open or copy your selections before closing it.");
      setCartAnnouncement("Cart could not be saved. It is still available for this session only.");
    }
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const value = useMemo(() => ({
    items,
    itemCount,
    subtotal,
    isCartOpen,
    cartPersistence,
    cartPersistenceMessage,
    cartAnnouncement,
    lastOrder,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    retryCartPersistence,
    setCartOpen,
    setLastOrder,
  }), [items, itemCount, subtotal, isCartOpen, cartPersistence, cartPersistenceMessage, cartAnnouncement, lastOrder, addItem, updateQuantity, removeItem, clearCart, retryCartPersistence]);

  return <CartContext.Provider value={value}>
    {children}
    {hydrated ? <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{cartAnnouncement}</p> : null}
  </CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
