import "dotenv/config";
import express, { type Response } from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { findProduct, listProducts, saveContact, saveDemoOrder, StorePersistenceError, subscribe } from "../store";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const actionOutcome = (result: { demo: boolean }) => ({
  ...result,
  persistence: result.demo ? "preview-only" as const : "saved" as const,
  emailDelivery: "not-configured" as const,
});
const respondWithStoreError = (res: Response, error: unknown, message: string) => {
  const configuredStoreFailure = error instanceof StorePersistenceError;
  if (!configuredStoreFailure) console.error("[Bean Scene] Unexpected store route failure", error);
  return res.status(configuredStoreFailure ? 503 : 500).json({
    code: configuredStoreFailure ? "store_unavailable" : "store_error",
    message,
  });
};

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "bean-scene" }));
  app.get("/api/platform/config.js", (_req, res) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  });

  app.get("/api/products", async (_req, res) => res.json(await listProducts()));
  app.get("/api/products/:slug", async (req, res) => {
    const result = await findProduct(req.params.slug);
    if (!result.product) return res.status(404).json({ message: "Product not found" });
    return res.json(result);
  });

  app.post("/api/newsletter", async (req, res) => {
    const email = text(req.body?.email).toLowerCase();
    if (!emailPattern.test(email)) return res.status(422).json({ message: "Please enter a valid email address." });
    try {
      return res.status(201).json(actionOutcome(await subscribe(email)));
    } catch (error) {
      return respondWithStoreError(res, error, "We could not confirm that your subscription was saved. Please try again in a moment.");
    }
  });

  app.post("/api/contact", async (req, res) => {
    const input = { name: text(req.body?.name), email: text(req.body?.email).toLowerCase(), subject: text(req.body?.subject), message: text(req.body?.message) };
    if (!input.name || !emailPattern.test(input.email) || !input.subject || input.message.length < 10) {
      return res.status(422).json({ message: "Please complete each field and include a message of at least 10 characters." });
    }
    try {
      return res.status(201).json(actionOutcome(await saveContact(input)));
    } catch (error) {
      return respondWithStoreError(res, error, "We could not confirm that your message was saved. Please try again in a moment.");
    }
  });

  app.post("/api/orders", async (req, res) => {
    const customerName = text(req.body?.customerName);
    const email = text(req.body?.email).toLowerCase();
    const deliveryNote = text(req.body?.deliveryNote);
    const requestedItems = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!customerName || !emailPattern.test(email) || requestedItems.length < 1 || requestedItems.length > 24) {
      return res.status(422).json({ message: "Please add an item and complete the required checkout details." });
    }
    const inventory = (await listProducts()).products;
    const items = [] as { slug: string; name: string; price: number; quantity: number }[];
    for (const item of requestedItems) {
      const slug = text(item?.slug);
      const quantity = Number(item?.quantity);
      const product = inventory.find((entry) => entry.slug === slug);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return res.status(422).json({ message: "One of the selected coffee items or quantities is invalid." });
      }
      items.push({ slug: product.slug, name: product.name, price: product.price, quantity });
    }
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderNumber = `BS-${String(Date.now()).slice(-6)}`;
    try {
      const result = await saveDemoOrder({ orderNumber, customerName, email, deliveryNote, items, subtotal });
      return res.status(201).json({ ...actionOutcome(result), orderNumber });
    } catch (error) {
      return respondWithStoreError(res, error, "We could not confirm the demo order save. Your cart has been kept; please check for a confirmation before retrying.");
    }
  });

  registerOAuthRoutes(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", (error) => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

startServer().catch((error) => { console.error(error); process.exit(1); });
