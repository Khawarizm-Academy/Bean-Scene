import type { Product } from "@/data/products";
import { formatCurrency } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function BrandButton({
  children,
  className = "",
  type = "button",
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`brand-button ${className}`}>
      {children}
    </button>
  );
}

export function SectionIntro({
  title,
  copy,
  light = false,
}: {
  title: string;
  copy?: string;
  light?: boolean;
}) {
  return (
    <div className={`section-intro ${light ? "section-intro--light" : ""}`}>
      <h2>{title}</h2>
      {copy ? <p>{copy}</p> : null}
    </div>
  );
}

export function ProductCard({ product, onOrder }: { product: Product; onOrder?: () => void }) {
  const { addItem } = useCart();
  const order = () => {
    addItem(product);
    onOrder?.();
  };

  return (
    <article className="product-card">
      <Link href={`/product/${product.slug}`} className="product-card__image-link" aria-label={`View ${product.name}`}>
        <picture>
          {product.desktopImage ? <source media="(min-width: 768px)" srcSet={product.desktopImage} /> : null}
          <img src={product.image} alt={`${product.name} coffee`} className="product-card__image" />
        </picture>
      </Link>
      <div className="product-card__details">
        <h3>{product.name}</h3>
        <p>{product.blend}</p>
        <strong>{formatCurrency(product.price)}</strong>
      </div>
      <BrandButton onClick={order} className="product-card__action">
        Order Now
      </BrandButton>
    </article>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-link">
      {children} <ArrowRight size={16} aria-hidden="true" />
    </Link>
  );
}
