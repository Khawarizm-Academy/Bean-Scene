import { ActionStatus, BrandButton } from "@/components/BrandPrimitives";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/data/products";
import { Menu, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

const navigation = [
  ["Home", "/"],
  ["Menu", "/shop"],
  ["About Us", "/about"],
  ["Contact Us", "/contact"],
] as const;

export function Wordmark({ light = false }: { light?: boolean }) {
  return <span className={`wordmark ${light ? "wordmark--light" : ""}`}>Bean Scene</span>;
}

export function SiteHeader() {
  const [location] = useLocation();
  const { itemCount, setCartOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" aria-label="Bean Scene home"><Wordmark /></Link>
        <nav className="site-nav" aria-label="Primary navigation">
          {navigation.map(([label, href]) => <Link key={href} href={href} className={location === href ? "active" : ""}>{label}</Link>)}
        </nav>
        <div className="header-actions">
          <Link href="/contact" className="signin-link">Sign In</Link>
          <button className="header-cart" onClick={() => setCartOpen(true)} aria-label={`Open cart with ${itemCount} items`}>
            <ShoppingBag size={19} strokeWidth={1.7} aria-hidden="true" /><span>{itemCount}</span>
          </button>
          <button className="mobile-menu-trigger" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-site-menu">
            <Menu size={18} aria-hidden="true" /> <span>Menu</span>
          </button>
        </div>
      </div>
      {menuOpen ? <nav id="mobile-site-menu" className="mobile-site-menu" aria-label="Mobile navigation">
        {navigation.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        <button onClick={() => setCartOpen(true)}>Cart ({itemCount})</button>
      </nav> : null}
    </header>
  );
}

export function CartDrawer() {
  const { items, subtotal, updateQuantity, removeItem, isCartOpen, setCartOpen, cartPersistence, cartPersistenceMessage, retryCartPersistence } = useCart();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [setCartOpen]);

  if (!isCartOpen) return null;
  return (
    <div className="cart-drawer-layer" role="presentation">
      <button className="cart-drawer__backdrop" aria-label="Close cart" onClick={() => setCartOpen(false)} />
      <aside className="cart-drawer" aria-label="Shopping cart" role="dialog" aria-modal="true">
        <header><h2>Your Cart</h2><button onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={22} /></button></header>
        {items.length ? <div className="cart-drawer__items">
          {items.map((item) => <div className="cart-line" key={item.id}>
            <img src={item.image} alt="" />
            <div><h3>{item.name}</h3><p>{formatCurrency(item.price)}</p>
              <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Reduce ${item.name} quantity`}><Minus size={14} /></button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`}><Plus size={14} /></button>
              </div>
            </div>
            <button className="cart-line__remove" onClick={() => removeItem(item.id)}>Remove</button>
          </div>)}
        </div> : <div className="cart-empty"><ShoppingBag size={32} /><p>Your cart is waiting for a beautiful cup of coffee.</p><BrandButton onClick={() => { setCartOpen(false); setLocation("/shop"); }}>Browse coffee</BrandButton></div>}
        {items.length ? <footer><div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>{cartPersistence === "session-only" ? <><ActionStatus tone="error" title="Cart is session-only" message={cartPersistenceMessage} /><BrandButton className="cart-drawer__retry" onClick={retryCartPersistence}>Retry saving cart</BrandButton></> : null}<BrandButton onClick={() => { setCartOpen(false); setLocation("/checkout"); }}>Demo checkout</BrandButton><Link href="/cart" onClick={() => setCartOpen(false)}>View full cart</Link></footer> : null}
      </aside>
    </div>
  );
}

export function SiteFooter() {
  return <footer className="site-footer">
    <picture><source media="(max-width: 767px)" srcSet="/assets/figma/105-10061.webp" /><img src="/assets/figma/4-92.webp" alt="" className="site-footer__texture" /></picture>
    <div className="site-footer__inner">
      <div className="footer-brand"><Wordmark light /><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
        <div className="footer-socials" aria-label="Social links">
          <a href="https://www.facebook.com" aria-label="Facebook"><img src="/assets/figma/4-70.svg" alt="" /></a>
          <a href="https://www.instagram.com" aria-label="Instagram"><img src="/assets/figma/4-74.svg" alt="" /></a>
          <a href="https://www.youtube.com" aria-label="YouTube"><img src="/assets/figma/4-78.svg" alt="" /></a>
          <a href="https://x.com" aria-label="Twitter"><img src="/assets/figma/4-82.svg" alt="" /></a>
        </div>
      </div>
      <div className="footer-group"><h3>About</h3><Link href="/shop">Menu</Link><Link href="/about">Features</Link><a href="/#newsletter">News & Blogs</a><Link href="/contact">Help & Supports</Link></div>
      <div className="footer-group"><h3>Company</h3><Link href="/about">How we work</Link><Link href="/about">Terms of service</Link><Link href="/shop">Pricing</Link><Link href="/contact">FAQ</Link></div>
      <div className="footer-group footer-contact"><h3>Contact Us</h3><p>Akshya Nagar 1st Block 1st Cross, Rammurthy nagar, Bangalore-560016</p><a href="tel:+12029182132">+1 202-918-2132</a><a href="mailto:beanscene@mail.com">beanscene@mail.com</a><a href="https://www.beanscene.com">www.beanscene.com</a></div>
    </div>
  </footer>;
}
