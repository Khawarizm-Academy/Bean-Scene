export type SubmissionOutcome = {
  demo: boolean;
  persistence: "preview-only" | "saved";
  emailDelivery: "not-configured";
};

async function postJson<T>(path: string, body: unknown, fallbackMessage: string): Promise<T> {
  const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const payload = await response.json().catch(() => null) as { message?: string } | T | null;
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string" ? payload.message : fallbackMessage;
    throw new Error(message);
  }
  return payload as T;
}

export function submitNewsletter(email: string) {
  return postJson<SubmissionOutcome>("/api/newsletter", { email }, "We could not process that email address. Please try again.");
}

export function submitContact(input: { name: string; email: string; subject: string; message: string }) {
  return postJson<SubmissionOutcome>("/api/contact", input, "We could not send your message. Please try again.");
}

export function submitOrder(input: { customerName: string; email: string; deliveryNote?: string; items: unknown[]; subtotal: number }) {
  return postJson<SubmissionOutcome & { orderNumber: string }>("/api/orders", input, "We could not confirm your demo order. Please try again.");
}
