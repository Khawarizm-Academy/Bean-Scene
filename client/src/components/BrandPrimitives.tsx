import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { formatCurrency } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { ArrowRight, Check, CheckCircle2, CircleAlert, Info, LoaderCircle } from "lucide-react";
import { Link } from "wouter";

export type ActionStatusTone = "loading" | "success" | "info" | "error";

type BrandButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { className?: string };

export function BrandButton({ children, className = "", type = "button", ...props }: BrandButtonProps) {
  return <button type={type} {...props} className={`brand-button ${className}`.trim()}>{children}</button>;
}

export function BusyLabel({ children }: { children: ReactNode }) {
  return <span className="button-progress"><LoaderCircle size={16} aria-hidden="true" />{children}</span>;
}

export function ActionStatus({ tone, title, message }: { tone: ActionStatusTone; title: string; message: string }) {
  const Icon = tone === "loading" ? LoaderCircle : tone === "success" ? CheckCircle2 : tone === "error" ? CircleAlert : Info;
  return (
    <div className={`action-status action-status--${tone}`} role={tone === "error" ? "alert" : "status"} aria-live={tone === "error" ? "assertive" : "polite"}>
      <Icon className={tone === "loading" ? "action-status__spinner" : ""} size={19} aria-hidden="true" />
      <div><strong>{title}</strong><p>{message}</p></div>
    </div>
  );
}

export function SectionIntro({ title, copy, light = false }: { title: string; copy?: string; light?: boolean }) {
  return <div className={`section-intro ${light ? "section-intro--light" : ""}`}><h2>{title}</h2>{copy ? <p>{copy}</p> : null}</div>;
}

export function ProductCard({ product, onOrder }: { product: Product; onOrder?: () => void }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  const order = () => {
    addItem(product);
    onOrder?.();
    setAdded(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setAdded(false), 2600);
  };

  return (
    <article className="product-card">
      <Link href={`/product/${product.slug}`} className="product-card__image-link" aria-label={`View ${product.name}`}>
        <picture>{product.desktopImage ? <source media="(min-width: 768px)" srcSet={product.desktopImage} /> : null}<img src={product.image} alt={`${product.name} coffee`} className="product-card__image" /></picture>
      </Link>
      <div className="product-card__details"><h3>{product.name}</h3><p>{product.blend}</p><strong>{formatCurrency(product.price)}</strong></div>
      <BrandButton onClick={order} className="product-card__action" aria-label={added ? `${product.name} added to cart` : `Add ${product.name} to cart`}>
        {added ? <><Check size={16} aria-hidden="true" /> Added</> : "Order Now"}
      </BrandButton>
      <p className="sr-only" role="status" aria-live="polite">{added ? `${product.name} was added to your cart.` : ""}</p>
    </article>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="text-link">{children} <ArrowRight size={16} aria-hidden="true" /></Link>;
}
