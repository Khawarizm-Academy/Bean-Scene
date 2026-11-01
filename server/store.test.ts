import { afterEach, describe, expect, it, vi } from "vitest";
import { findProduct, listProducts, saveContact, saveDemoOrder, StorePersistenceError, subscribe } from "./store";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const useConfiguredFakeSupabase = () => {
  vi.stubEnv("SUPABASE_URL", "https://beanscene-test.supabase.example.test");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-only-key");
};

describe("Bean Scene product catalogue fallback", () => {
  it("returns the local Figma-matched catalogue when Supabase credentials are unavailable", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    const result = await listProducts();

    expect(result.demo).toBe(true);
    expect(result.source).toBe("demo");
    expect(result.products).toHaveLength(4);
    expect(result.products.map((product) => product.slug)).toEqual(["cappuccino", "chai-latte", "macchiato", "expresso"]);
    expect(result.products.every((product) => product.image.startsWith("/assets/figma/"))).toBe(true);
    expect(result.products.every((product) => product.desktopImage?.startsWith("/assets/figma/"))).toBe(true);
  });

  it("finds a known product and returns null for an unknown product in demo mode", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    await expect(findProduct("cappuccino")).resolves.toMatchObject({ demo: true, source: "demo", product: { slug: "cappuccino", price: 8.5 } });
    await expect(findProduct("not-a-coffee")).resolves.toMatchObject({ demo: true, source: "demo", product: null });
  });

  it("distinguishes a configured catalogue outage and returns a retryable local fallback", async () => {
    useConfiguredFakeSupabase();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("simulated offline service"));

    const result = await listProducts();

    expect(result).toMatchObject({ demo: true, source: "unavailable-fallback" });
    expect(result.message).toMatch(/try again/i);
    expect(result.products).toHaveLength(4);
  });

  it("treats an empty configured catalogue as an informative sample-menu fallback", async () => {
    useConfiguredFakeSupabase();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("[]", { status: 200 }));

    const result = await listProducts();

    expect(result).toMatchObject({ demo: true, source: "empty-fallback" });
    expect(result.message).toMatch(/empty/i);
    expect(result.products).toHaveLength(4);
  });
});

describe("Bean Scene persistence failures", () => {
  it("returns retryable errors instead of demo success when configured Supabase writes fail", async () => {
    useConfiguredFakeSupabase();
    const fetch = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("simulated offline service"));

    await expect(subscribe("coffee@example.test")).rejects.toBeInstanceOf(StorePersistenceError);
    await expect(saveContact({ name: "Test Person", email: "coffee@example.test", subject: "Test", message: "This is only an isolated unit-test request." })).rejects.toBeInstanceOf(StorePersistenceError);
    await expect(saveDemoOrder({ orderNumber: "BS-TEST", customerName: "Test Person", email: "coffee@example.test", items: [], subtotal: 0 })).rejects.toBeInstanceOf(StorePersistenceError);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
