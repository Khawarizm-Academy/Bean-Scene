import { useEffect, useState } from "react";
import { products as demoProducts, type Product } from "@/data/products";

type ProductResponse = { products: Product[]; demo: boolean };

export function useProducts() {
  const [items, setItems] = useState<Product[]>(demoProducts);
  const [demo, setDemo] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/products", { headers: { Accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to read coffee menu");
        return response.json() as Promise<ProductResponse>;
      })
      .then((result) => {
        if (!active) return;
        if (Array.isArray(result.products) && result.products.length) setItems(result.products);
        setDemo(result.demo);
      })
      .catch(() => {
        if (active) setDemo(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return { items, demo, loading };
}
