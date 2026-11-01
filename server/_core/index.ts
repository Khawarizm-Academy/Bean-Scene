import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { findProduct, listProducts, saveContact, saveDemoOrder, subscribe } from "../store";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

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
    return res.status(201).json(await subscribe(email));
  });

  app.post("/api/contact", async (req, res) => {
    const input = { name: text(req.body?.name), email: text(req.body?.email).toLowerCase(), subject: text(req.body?.subject), message: text(req.body?.message) };
    if (!input.name || !emailPattern.test(input.email) || !input.subject || input.message.length < 10) {
      return res.status(422).json({ message: "Please complete each field and include a message of at least 10 characters." });
    }
    return res.status(201).json(await saveContact(input));
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
    const result = await saveDemoOrder({ orderNumber, customerName, email, deliveryNote, items, subtotal });
    return res.status(201).json({ ...result, orderNumber });
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
