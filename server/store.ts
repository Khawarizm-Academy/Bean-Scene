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

export type ProductSource = "demo" | "supabase" | "empty-fallback" | "unavailable-fallback";
export type ProductCatalogue = {
  products: readonly StoreProduct[];
  demo: boolean;
  source: ProductSource;
  message?: string;
};

export class StorePersistenceError extends Error {
  readonly operation: string;

  constructor(operation: string) {
    super(`Bean Scene could not confirm the ${operation} write.`);
    this.name = "StorePersistenceError";
    this.operation = operation;
  }
}

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

export async function listProducts(): Promise<ProductCatalogue> {
  if (!getSupabaseConfig()) return { products: mapDemoProducts(), demo: true, source: "demo" };

  try {
    const result = await supabaseRequest<SupabaseProduct[]>("products", { query: "select=*&order=name.asc" });
    if (!result?.length) {
      return {
        products: mapDemoProducts(),
        demo: true,
        source: "empty-fallback",
        message: "The configured Supabase catalogue is empty. Showing the sample coffee menu until products are added.",
      };
    }
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
    return { products: normalized, demo: false, source: "supabase" };
  } catch (error) {
    console.warn("[Bean Scene] Supabase menu unavailable; returning local fallback", error);
    return {
      products: mapDemoProducts(),
      demo: true,
      source: "unavailable-fallback",
      message: "The Supabase menu could not be refreshed. Sample coffees are shown for now; try again when the connection is restored.",
    };
  }
}

export async function findProduct(slug: string) {
  const inventory = await listProducts();
  return { ...inventory, product: inventory.products.find((item) => item.slug === slug) ?? null };
}

async function persist(operation: string, table: string, body: unknown): Promise<{ demo: boolean }> {
  if (!getSupabaseConfig()) return { demo: true };
  try {
    const inserted = await supabaseRequest<unknown[]>(table, { method: "POST", body });
    if (!Array.isArray(inserted) || inserted.length === 0) throw new Error("Supabase did not return a saved row.");
    return { demo: false };
  } catch (error) {
    console.error(`[Bean Scene] ${operation} was not persisted`, error);
    throw new StorePersistenceError(operation);
  }
}

export function subscribe(email: string) {
  return persist("newsletter subscription", "newsletter_subscribers", { email });
}

export function saveContact(input: { name: string; email: string; subject: string; message: string }) {
  return persist("contact message", "contact_messages", input);
}

export function saveDemoOrder(input: {
  orderNumber: string;
  customerName: string;
  email: string;
  deliveryNote?: string;
  items: unknown[];
  subtotal: number;
}) {
  return persist("demo order", "demo_orders", {
    order_number: input.orderNumber,
    customer_name: input.customerName,
    email: input.email,
    delivery_note: input.deliveryNote ?? null,
    items: input.items,
    subtotal: input.subtotal,
  });
}
