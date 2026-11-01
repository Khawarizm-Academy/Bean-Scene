import { useEffect } from "react";

declare global {
  interface Window { __BEAN_SCENE_PUBLIC_ORIGIN__?: string }
}

type PageMeta = {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown>;
};

const SITE_NAME = "Bean Scene";
export const getPublicOrigin = () => {
  const value = import.meta.env.VITE_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.__BEAN_SCENE_PUBLIC_ORIGIN__ : undefined);
  if (!value) return undefined;
  try {
    const origin = new URL(value);
    return origin.protocol === "https:" ? origin.origin : undefined;
  } catch {
    return undefined;
  }
};

function setMeta(selector: string, attribute: "name" | "property", key: string, value: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.content = value;
}

export function usePageMeta({ title, description, path = "/", noindex = false, structuredData }: PageMeta) {
  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);
    setMeta('meta[property="og:type"]', "property", "og:type", structuredData?.["@type"] === "Product" ? "product" : "website");
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="robots"]', "name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    const origin = getPublicOrigin();
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (origin) {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = `${origin}${path}`;
      setMeta('meta[property="og:url"]', "property", "og:url", `${origin}${path}`);
      setMeta('meta[property="og:image"]', "property", "og:image", `${origin}/assets/figma/1-41.webp`);
      setMeta('meta[property="og:image"]', "property", "og:image", `${origin}/assets/figma/1-41.webp`);
      setMeta('meta[name="twitter:image"]', "name", "twitter:image", `${origin}/assets/figma/1-41.webp`);
    } else {
      canonical?.remove();
      document.head.querySelector('meta[property="og:url"]')?.remove();
      document.head.querySelector('meta[property="og:image"]')?.remove();
      document.head.querySelector('meta[name="twitter:image"]')?.remove();
    }

    const schemaId = "bean-scene-structured-data";
    document.getElementById(schemaId)?.remove();
    if (structuredData) {
      const script = document.createElement("script");
      script.id = schemaId;
      script.type = "application/ld+json";
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => document.getElementById(schemaId)?.remove();
  }, [title, description, path, noindex, structuredData]);
}
