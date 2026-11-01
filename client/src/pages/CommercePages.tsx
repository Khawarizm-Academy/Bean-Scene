import { BrandButton, ProductCard, SectionIntro, TextLink } from "@/components/BrandPrimitives";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/data/products";
import { useProducts } from "@/data/useProducts";
import { submitContact, submitOrder } from "@/lib/storeApi";
import { getPublicOrigin, usePageMeta } from "@/lib/usePageMeta";
import { Check, ChevronLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation, useRoute } from "wouter";

function PageShell({ children }: { children: React.ReactNode }) {
  return <><SiteHeader /><main className="inner-page">{children}</main><SiteFooter /></>;
}

export function ShopPage() {
  const { items: inventory, demo } = useProducts();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "featured">("all");
  const visibleProducts = useMemo(() => inventory.filter((product) => {
    const queryMatch = `${product.name} ${product.notes.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    return queryMatch && (filter === "all" || product.featured);
  }), [inventory, query, filter]);
  usePageMeta({ title: "Shop Coffee | Bean Scene Coffee Favorites", description: "Browse coffee favorites from Bean Scene, including Cappuccino, Chai Latte, Macchiato and Expresso.", path: "/shop" });
  return <PageShell><section className="page-hero page-hero--shop"><div><p className="eyebrow">The Bean Scene selection</p><h1>Find a cup worth experiencing</h1><p>Explore the coffee ritual that fits your pace, your palate, and your morning.</p></div></section><section className="shop-section"><div className="shop-toolbar"><div><span className="eyebrow">Coffee menu</span><h2>Our signature cups</h2>{demo ? <p className="data-mode-note">Demo menu — connect Supabase to use persisted inventory.</p> : null}</div><div className="shop-controls"><label><span className="sr-only">Search coffee</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search coffee" /></label><div className="filter-set" aria-label="Product filter"><button className={filter === "all" ? "is-selected" : ""} onClick={() => setFilter("all")}>All cups</button><button className={filter === "featured" ? "is-selected" : ""} onClick={() => setFilter("featured")}>Featured</button></div></div></div>{visibleProducts.length ? <div className="shop-product-grid">{visibleProducts.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <div className="empty-state"><ShoppingBag size={38} /><h3>No coffee found</h3><p>Try another word or see the complete menu.</p><BrandButton onClick={() => { setQuery(""); setFilter("all"); }}>Show all cups</BrandButton></div>}</section></PageShell>;
}

export function ProductPage() {
  const [, params] = useRoute("/product/:slug");
  const { items: inventory, loading } = useProducts();
  const product = inventory.find((item) => item.slug === params?.slug);
  const publicOrigin = getPublicOrigin();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  usePageMeta({ title: product ? `${product.name} Coffee | Bean Scene` : "Coffee Product | Bean Scene", description: product?.description ?? "Explore coffee from Bean Scene.", path: `/product/${params?.slug ?? ""}`, structuredData: product && publicOrigin ? { "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description, image: `${publicOrigin}${product.image}`, offers: { "@type": "Offer", priceCurrency: "USD", price: product.price, availability: "https://schema.org/InStock" } } : undefined });
  if (!product) return <PageShell><section className="empty-state"><h1>{loading ? "Loading coffee..." : "Coffee not found"}</h1><p>{loading ? "Please wait while we read the Bean Scene menu." : "This coffee may no longer be available."}</p><Link href="/shop"><BrandButton>Browse coffee</BrandButton></Link></section></PageShell>;
  return <PageShell><section className="product-detail"><Link href="/shop" className="back-link"><ChevronLeft size={18} /> Back to Menu</Link><div className="product-detail__grid"><div className="product-detail__image"><img src={product.image} alt={`${product.name} coffee`} /></div><div className="product-detail__content"><p className="eyebrow">Bean Scene coffee</p><h1>{product.name}</h1><p className="product-detail__blend">{product.blend}</p><strong className="product-detail__price">{formatCurrency(product.price)}</strong><p>{product.description}</p><ul>{product.notes.map((note) => <li key={note}><Check size={17} /> {note}</li>)}</ul><div className="detail-actions"><div className="quantity-control quantity-control--large" aria-label="Choose quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus size={16} /></button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><Plus size={16} /></button></div><BrandButton onClick={() => addItem(product, quantity)}>Add to cart</BrandButton></div><p className="demo-note">Every order in this portfolio storefront uses demo checkout—no payment details are requested.</p></div></div></section></PageShell>;
}

export function AboutPage() {
  usePageMeta({ title: "About Bean Scene | Coffee and Hospitality", description: "Learn how Bean Scene brings quality coffee, warm hospitality and unhurried rituals together.", path: "/about" });
  return <PageShell><section className="page-hero page-hero--about"><div><p className="eyebrow">Our coffee story</p><h1>We make room for the unhurried morning.</h1><p>Bean Scene is a coffee shop shaped around flavour, thoughtful craft, and a little more time for yourself.</p></div></section><section className="about-story"><div><SectionIntro title="Discover the best coffee" copy="Bean Scene is a coffee shop that provides you with quality coffee that helps boost your productivity and helps build your mood. Having a cup of coffee is good, but having a cup of real coffee is greater." /><TextLink href="/shop">Explore the menu</TextLink></div><img src="/assets/figma/2-52.webp" alt="Coffee beans arranged around a cup" /></section><section className="values-section"><SectionIntro title="Why our coffee feels different" copy="We don’t just make your coffee, we make your day!" /><div className="values-grid"><article><img src="/assets/figma/2-127.webp" alt="" /><h3>Supreme Beans</h3><p>Beans that provides great taste</p></article><article><img src="/assets/figma/2-128.webp" alt="" /><h3>High Quality</h3><p>We provide the highest quality</p></article><article><img src="/assets/figma/2-129.webp" alt="" /><h3>Extraordinary</h3><p>Coffee like you have never tasted</p></article><article><img src="/assets/figma/2-130.webp" alt="" /><h3>Affordable Price</h3><p>Our Coffee prices are easy to afford</p></article></div></section></PageShell>;
}

export function ContactPage() {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  usePageMeta({ title: "Contact Bean Scene | Coffee Questions and Support", description: "Contact Bean Scene for thoughtful coffee conversations, menu questions and support.", path: "/contact" });
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setIsSending(true);
    try { const result = await submitContact({ name: String(form.get("name") ?? ""), email: String(form.get("email") ?? ""), subject: String(form.get("subject") ?? ""), message: String(form.get("message") ?? "") }); setSent(true); formElement.reset(); toast.success(result.demo ? "Demo message received — connect Supabase to persist it." : "Your message has been sent."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Something went wrong."); }
    finally { setIsSending(false); }
  };
  return <PageShell><section className="page-hero page-hero--contact"><div><p className="eyebrow">Let’s talk coffee</p><h1>We’d love to hear from you.</h1><p>Ask a question, share a coffee moment, or tell us what you would like to taste next.</p></div></section><section className="contact-layout"><div className="contact-details"><SectionIntro title="Find your Bean Scene" copy="Akshya Nagar 1st Block 1st Cross, Rammurthy nagar, Bangalore-560016" /><a href="tel:+12029182132">+1 202-918-2132</a><a href="mailto:beanscene@mail.com">beanscene@mail.com</a><p>Monday–Sunday · 8:00 AM–8:00 PM</p><img src="/assets/figma/2-165.webp" alt="" /></div><form className="contact-form" onSubmit={submit}><h2>Send a message</h2><p>We reply with care. Required fields are marked with an asterisk.</p><label>Name *<input name="name" required minLength={2} autoComplete="name" /></label><label>Email address *<input name="email" type="email" required autoComplete="email" /></label><label>Subject *<input name="subject" required minLength={2} /></label><label>Message *<textarea name="message" required minLength={10} rows={5} /></label>{sent ? <p className="form-success" role="status">Thank you—your message has been received in {" "}demo mode.</p> : null}<BrandButton type="submit" disabled={isSending}>{isSending ? "Sending..." : "Send message"}</BrandButton></form></section></PageShell>;
}

export function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const [, setLocation] = useLocation();
  usePageMeta({ title: "Your Cart | Bean Scene Coffee", description: "Review the Bean Scene coffee selection in your cart before demo checkout.", path: "/cart", noindex: true });
  return <PageShell><section className="cart-page"><SectionIntro title="Your coffee cart" copy="Review your selections before continuing to our clearly-labelled demo checkout." />{items.length ? <div className="cart-page__grid"><div className="cart-page__items">{items.map((item) => <article className="cart-page-line" key={item.id}><img src={item.image} alt="" /><div><h2>{item.name}</h2><p>{item.blend}</p><strong>{formatCurrency(item.price)}</strong></div><div className="quantity-control"><button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Reduce ${item.name} quantity`}><Minus size={14} /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`}><Plus size={14} /></button></div><button className="remove-button" onClick={() => removeItem(item.id)}><Trash2 size={17} /> Remove</button></article>)}</div><aside className="cart-summary"><h2>Order summary</h2><div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div><p>Taxes and payment are not collected in this demo experience.</p><BrandButton onClick={() => setLocation("/checkout")}>Continue to demo checkout</BrandButton></aside></div> : <div className="empty-state"><ShoppingBag size={38} /><h2>Your cart is empty</h2><p>Let’s find a cup worth experiencing.</p><BrandButton onClick={() => setLocation("/shop")}>Explore coffee</BrandButton></div>}</section></PageShell>;
}

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  usePageMeta({ title: "Demo Checkout | Bean Scene Coffee", description: "Confirm your Bean Scene demo coffee order without entering payment information.", path: "/checkout", noindex: true });
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!items.length) { setLocation("/shop"); return; } const form = new FormData(event.currentTarget); setIsSubmitting(true); try { const result = await submitOrder({ customerName: String(form.get("name") ?? ""), email: String(form.get("email") ?? ""), deliveryNote: String(form.get("note") ?? ""), items, subtotal }); sessionStorage.setItem("bean-scene-last-order", JSON.stringify({ orderNumber: result.orderNumber, customerName: form.get("name"), demo: result.demo })); clearCart(); setLocation("/order-confirmed"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not confirm your order."); } finally { setIsSubmitting(false); } };
  return <PageShell><section className="checkout-page"><div className="checkout-copy"><p className="eyebrow">Portfolio checkout</p><h1>Finish your demo order</h1><p>This checkout illustrates a complete ordering flow. It never asks for payment details and will only store a demo record when Supabase is configured.</p><div className="checkout-trust"><Check size={18} /> No card details</div><div className="checkout-trust"><Check size={18} /> Accessible field validation</div><div className="checkout-trust"><Check size={18} /> Clear demo-mode feedback</div></div><form className="checkout-form" onSubmit={submit}><h2>Contact details</h2><label>Full name *<input name="name" required minLength={2} autoComplete="name" /></label><label>Email address *<input name="email" required type="email" autoComplete="email" /></label><label>Delivery note <textarea name="note" rows={3} placeholder="A short demo note for the barista" /></label><div className="checkout-total"><span>Demo order total</span><strong>{formatCurrency(subtotal)}</strong></div><BrandButton type="submit" disabled={isSubmitting || !items.length}>{isSubmitting ? "Confirming..." : "Confirm demo order"}</BrandButton></form></section></PageShell>;
}

export function OrderConfirmedPage() {
  const [order] = useState<{ orderNumber: string; customerName: string; demo: boolean } | null>(() => { try { if (typeof window === "undefined") return null; const raw = window.sessionStorage.getItem("bean-scene-last-order"); return raw ? JSON.parse(raw) : null; } catch { return null; } });
  usePageMeta({ title: "Demo Order Confirmed | Bean Scene", description: "Your Bean Scene demo coffee order has been confirmed.", path: "/order-confirmed", noindex: true });
  return <PageShell><section className="confirmed-page"><div className="confirmed-icon"><Check size={34} /></div><p className="eyebrow">Demo order confirmed</p><h1>Thank you{order?.customerName ? `, ${order.customerName}` : ""}.</h1><p>{order ? `Your reference is ${order.orderNumber}.` : "Your order preview is ready."} This portfolio flow has not processed a payment or placed a real coffee order.</p><Link href="/shop"><BrandButton>Continue exploring</BrandButton></Link></section></PageShell>;
}
