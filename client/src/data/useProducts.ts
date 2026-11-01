import { useCallback, useEffect, useState } from "react";
import { products as demoProducts, type Product } from "@/data/products";

export type ProductSource = "loading" | "demo" | "supabase" | "empty-fallback" | "unavailable-fallback";
type ProductResponse = { products: Product[]; demo: boolean; source: Exclude<ProductSource, "loading">; message?: string };

export function useProducts() {
  const [items, setItems] = useState<Product[]>(demoProducts);
  const [demo, setDemo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<ProductSource>("loading");
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/products", { headers: { Accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to read the Bean Scene coffee menu.");
        return response.json() as Promise<ProductResponse>;
      })
      .then((result) => {
        if (!active) return;
        if (!Array.isArray(result.products) || result.products.length === 0) throw new Error("The Bean Scene menu returned no products.");
        setItems(result.products);
        setDemo(result.demo);
        setSource(result.source ?? (result.demo ? "demo" : "supabase"));
        setMessage(result.message ?? "");
      })
      .catch(() => {
        if (!active) return;
        setItems(demoProducts);
        setDemo(true);
        setSource("unavailable-fallback");
        setMessage("The menu service could not be reached. Sample coffees are shown for now; try refreshing the menu.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [attempt]);

  return { items, demo, loading, source, message, retry };
}
