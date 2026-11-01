import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { createSeoMiddleware } from "../seo";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  const projectRoot = path.resolve(import.meta.dirname, "../..");
  const clientTemplate = path.resolve(projectRoot, "client", "index.html");
  app.use(createSeoMiddleware(
    async () => {
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace('src="/src/main.tsx"', `src="/src/main.tsx?v=${nanoid()}"`);
      return template;
    },
    (template, url) => vite.transformIndexHtml(url, template),
  ));

  app.use(vite.middlewares);
}

export function serveStatic(app: Express) {
  const distPath = process.env.NODE_ENV === "development"
    ? path.resolve(import.meta.dirname, "../..", "dist", "public")
    : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
  }

  app.use(createSeoMiddleware(async () => fs.promises.readFile(path.resolve(distPath, "index.html"), "utf-8")));
  app.use(express.static(distPath));

  // All HTML page requests and missing page routes are handled by the SEO middleware.
  // This final fallback is only for environments that do not send an HTML Accept header.
  app.use("*", (_req, res) => {
    res.status(404).sendFile(path.resolve(distPath, "index.html"));
  });
}
