export async function submitNewsletter(email: string) {
  const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
  if (!response.ok) throw new Error("We could not process that email address. Please try again.");
  return response.json() as Promise<{ demo: boolean }>;
}

export async function submitContact(input: { name: string; email: string; subject: string; message: string }) {
  const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error("We could not send your message. Please try again.");
  return response.json() as Promise<{ demo: boolean }>;
}

export async function submitOrder(input: { customerName: string; email: string; deliveryNote?: string; items: unknown[]; subtotal: number }) {
  const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error("We could not confirm your demo order. Please try again.");
  return response.json() as Promise<{ demo: boolean; orderNumber: string }>;
}
