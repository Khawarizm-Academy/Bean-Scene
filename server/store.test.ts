import { afterEach, describe, expect, it, vi } from "vitest";
import { findProduct, listProducts } from "./store";

afterEach(() => vi.unstubAllEnvs());

describe("Bean Scene product catalogue fallback", () => {
  it("returns the local Figma-matched catalogue when Supabase credentials are unavailable", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    const result = await listProducts();

    expect(result.demo).toBe(true);
    expect(result.products).toHaveLength(4);
    expect(result.products.map((product) => product.slug)).toEqual(["cappuccino", "chai-latte", "macchiato", "expresso"]);
    expect(result.products.every((product) => product.image.startsWith("/assets/figma/"))).toBe(true);
    expect(result.products.every((product) => product.desktopImage?.startsWith("/assets/figma/"))).toBe(true);
  });

  it("finds a known product and returns null for an unknown product in demo mode", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    await expect(findProduct("cappuccino")).resolves.toMatchObject({ demo: true, product: { slug: "cappuccino", price: 8.5 } });
    await expect(findProduct("not-a-coffee")).resolves.toMatchObject({ demo: true, product: null });
  });
});
