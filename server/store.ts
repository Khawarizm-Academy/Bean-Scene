import { products } from "../shared/products";
import { getSupabaseConfig, supabaseRequest } from "./supabase";

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  blend: string;
  description: string;
  price: number;
  image: string;
  desktopImage?: string;
  featured: boolean;
  notes: readonly string[];
};

type SupabaseProduct = {
  id: string;
  slug: string;
  name: string;
  blend: string;
  description: string;
  price: number | string;
  image_path: string;
  featured: boolean;
};

const mapDemoProducts = (): StoreProduct[] => products.map((product) => ({ ...product }));

export async function listProducts(): Promise<{ products: readonly StoreProduct[]; demo: boolean }> {
  if (!getSupabaseConfig()) return { products: mapDemoProducts(), demo: true };
  try {
    const result = await supabaseRequest<SupabaseProduct[]>("products", { query: "select=*&order=name.asc" });
    if (!result?.length) return { products: mapDemoProducts(), demo: true };
    const normalized = result.map((row): StoreProduct => {
      const local = products.find((product) => product.slug === row.slug);
      return {
        id: row.id || row.slug,
        slug: row.slug,
        name: row.name,
        blend: row.blend,
        description: row.description,
        price: Number(row.price),
        image: row.image_path?.startsWith("/assets/figma/") ? row.image_path : local?.image || "/assets/figma/2-68.webp",
        desktopImage: local?.desktopImage,
        featured: Boolean(row.featured),
        notes: local?.notes ?? [],
      };
    });
    return { products: normalized, demo: false };
  } catch (error) {
    console.warn("[Bean Scene] Using demo products after Supabase read failure", error);
    return { products, demo: true };
  }
}

export async function findProduct(slug: string) {
  const inventory = await listProducts();
  return { product: inventory.products.find((item) => item.slug === slug) ?? null, demo: inventory.demo };
}

export async function subscribe(email: string) {
  if (!getSupabaseConfig()) return { demo: true };
  try {
    await supabaseRequest("newsletter_subscribers", { method: "POST", body: { email } });
    return { demo: false };
  } catch (error) {
    console.warn("[Bean Scene] Newsletter persistence unavailable", error);
    return { demo: true };
  }
}

export async function saveContact(input: { name: string; email: string; subject: string; message: string }) {
  if (!getSupabaseConfig()) return { demo: true };
  try {
    await supabaseRequest("contact_messages", { method: "POST", body: input });
    return { demo: false };
  } catch (error) {
    console.warn("[Bean Scene] Contact persistence unavailable", error);
    return { demo: true };
  }
}

export async function saveDemoOrder(input: {
  orderNumber: string;
  customerName: string;
  email: string;
  deliveryNote?: string;
  items: unknown[];
  subtotal: number;
}) {
  if (!getSupabaseConfig()) return { demo: true };
  try {
    await supabaseRequest("demo_orders", {
      method: "POST",
      body: {
        order_number: input.orderNumber,
        customer_name: input.customerName,
        email: input.email,
        delivery_note: input.deliveryNote ?? null,
        items: input.items,
        subtotal: input.subtotal,
      },
    });
    return { demo: false };
  } catch (error) {
    console.warn("[Bean Scene] Demo order persistence unavailable", error);
    return { demo: true };
  }
}
