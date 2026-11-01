type SupabaseConfig = { url: string; key: string };

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export async function supabaseRequest<T>(
  path: string,
  options: { method?: "GET" | "POST"; body?: unknown; query?: string } = {},
): Promise<T | null> {
  const config = getSupabaseConfig();
  if (!config) return null;
  const url = `${config.url}/rest/v1/${path}${options.query ? `?${options.query}` : ""}`;
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: options.method === "POST" ? "return=representation" : "",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${detail}`);
  }
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : null;
}
