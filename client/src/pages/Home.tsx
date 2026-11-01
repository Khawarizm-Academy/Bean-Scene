import { BrandButton, ProductCard, SectionIntro } from "@/components/BrandPrimitives";
import { SiteFooter, Wordmark } from "@/components/SiteChrome";
import { useCart } from "@/contexts/CartContext";
import { products } from "@/data/products";
import { useProducts } from "@/data/useProducts";
import { submitNewsletter } from "@/lib/storeApi";
import { usePageMeta } from "@/lib/usePageMeta";
import { ChevronLeft, ChevronRight, Menu, ShoppingBag, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

const benefits = [
  { title: "Supreme Beans", copy: "Beans that provides great taste", image: "/assets/figma/2-127.webp" },
  { title: "High Quality", copy: "We provide the highest quality", image: "/assets/figma/2-128.webp" },
  { title: "Extraordinary", copy: "Coffee like you have never tasted", image: "/assets/figma/2-129.webp" },
  { title: "Affordable Price", copy: "Our Coffee prices are easy to afford", image: "/assets/figma/2-130.webp" },
];

function HomeHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, setCartOpen } = useCart();
  const [, setLocation] = useLocation();
  const goShop = () => setLocation("/shop");
  const previewMember = () => toast("Member sign-in is part of the next Bean Scene release.");
  return <>
    <div className="home-header">
      <Link href="/" aria-label="Bean Scene home"><Wordmark light /></Link>
      <nav aria-label="Main navigation"><a href="#home">Home</a><a href="#menu">Menu</a><a href="#story">About Us</a><a href="#footer-contact">Contact Us</a></nav>
      <div className="home-header__actions"><button className="home-signin" onClick={previewMember}>Sign In</button><BrandButton onClick={previewMember} className="home-signup">SingUp</BrandButton></div>
      <button className="home-mobile-menu" aria-expanded={mobileOpen} aria-controls="home-mobile-navigation" onClick={() => setMobileOpen(!mobileOpen)}><Menu size={18} aria-hidden="true" /> Menu</button>
    </div>
    {mobileOpen ? <nav id="home-mobile-navigation" className="home-mobile-navigation" aria-label="Mobile navigation"><button className="home-mobile-navigation__close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={20} /></button><a href="#home" onClick={() => setMobileOpen(false)}>Home</a><a href="#menu" onClick={() => setMobileOpen(false)}>Menu</a><a href="#story" onClick={() => setMobileOpen(false)}>About Us</a><a href="#footer-contact" onClick={() => setMobileOpen(false)}>Contact Us</a><button onClick={() => { setMobileOpen(false); setCartOpen(true); }}><ShoppingBag size={17} /> Cart ({itemCount})</button><BrandButton onClick={goShop}>Order Now</BrandButton></nav> : null}
  </>;
}

export default function Home() {
  const { addItem } = useCart();
  const { items: menuProducts } = useProducts();
  const [, setLocation] = useLocation();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState("");
  usePageMeta({ title: "Bean Scene | Coffee Shop & Roastery", description: "Bean Scene brings beautifully roasted coffee and a warm, unhurried morning ritual to every cup.", path: "/", structuredData: { "@context": "https://schema.org", "@type": "CafeOrCoffeeShop", name: "Bean Scene", description: "A warm coffee shop for beautifully roasted coffee and unhurried rituals.", servesCuisine: "Coffee", telephone: "+1 202-918-2132", email: "beanscene@mail.com" } });

  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");
    setIsSubscribing(true); setSubscriptionMessage("");
    try { const result = await submitNewsletter(email); const message = result.demo ? "You’re on the list in demo mode. Connect Supabase to store subscriptions." : "Thank you — you’re on the Bean Scene list."; setSubscriptionMessage(message); form.reset(); toast.success(message); }
    catch (error) { const message = error instanceof Error ? error.message : "Please try again."; setSubscriptionMessage(message); toast.error(message); }
    finally { setIsSubscribing(false); }
  };

  return <div className="home-page">
    <section className="hero" id="home">
      <picture><source media="(max-width: 767px)" srcSet="/assets/figma/105-9920.webp" /><img className="hero__photo" src="/assets/figma/1-41.webp" alt="Steaming coffee beside roasted beans" /></picture>
      <div className="hero__scrim" />
      <HomeHeader />
      <div className="hero__content"><p>We’ve got your morning covered with</p><h1>Coffee</h1><p className="hero__description">It is best to start your day with a cup of coffee. Discover the best flavours coffee you will ever have. We provide the best for our customers.</p><BrandButton onClick={() => setLocation("/shop")}>Order Now</BrandButton></div>
    </section>

    <section className="story-section home-rail" id="story">
      <div className="story-section__copy"><h2>Discover the best coffee</h2><p>Bean Scene is a coffee shop that provides you with quality coffee that helps boost your productivity and helps build your mood. Having a cup of coffee is good, but having a cup of real coffee is greater. There is no doubt that you will enjoy this coffee more than others you have ever tasted.</p><BrandButton onClick={() => setLocation("/about")}>Learn More</BrandButton></div>
      <picture className="story-section__image"><source media="(max-width: 767px)" srcSet="/assets/figma/105-9934.webp" /><img src="/assets/figma/2-52.webp" alt="Coffee beans arranged in the shape of a cup" /></picture>
    </section>

    <section className="selection-section" id="menu">
      <img className="selection-section__flourish" src="/assets/figma/2-165.webp" alt="" aria-hidden="true" />
      <div className="home-rail"><SectionIntro title="Enjoy a new blend of coffee style" copy="Explore all flavours of coffee with us. There is always a new cup worth experiencing" /><div className="home-product-grid">{menuProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div></div>
    </section>

    <section className="why-section home-rail"><SectionIntro title="Why are we different?" copy="We don’t just make your coffee, we make your day!" /><div className="benefit-grid">{benefits.map((benefit, index) => <article className={`benefit-card ${index === 0 ? "benefit-card--highlight" : ""}`} key={benefit.title}><img src={benefit.image} alt="" /><h3>{benefit.title}</h3><p>{benefit.copy}</p></article>)}</div><div className="join-invitation"><p>Great ideas start with great coffee, Lets help you achieve that</p><h3>Get started today.</h3><BrandButton onClick={() => setLocation("/shop")}>Join Us</BrandButton></div></section>

    <section className="morning-section"><picture><source media="(max-width: 767px)" srcSet="/assets/figma/105-10019.webp" /><img className="morning-section__photo" src="/assets/figma/2-147.webp" alt="Coffee beans and a warm coffee background" /></picture><div className="morning-section__overlay" /><div className="morning-section__content home-rail"><div><h2>Get a chance to have an<br className="desktop-only" /> Amazing morning</h2><p>We are giving you are one time opportunity to experience a better life with coffee.</p><BrandButton onClick={() => addItem(products[0])}>Order Now</BrandButton></div><div className="takeaway-composition"><img src="/assets/figma/2-166.webp" className="takeaway-composition__beans" alt="" aria-hidden="true" /><img src="/assets/figma/2-161.webp" className="takeaway-composition__cup" alt="Bean Scene takeaway coffee cup" /></div></div></section>

    <section className="feedback-section"><img className="feedback-flourish feedback-flourish--top" src="/assets/figma/4-21.webp" alt="" aria-hidden="true" /><img className="feedback-flourish feedback-flourish--bottom" src="/assets/figma/4-22.webp" alt="" aria-hidden="true" /><div className="home-rail"><SectionIntro title="Our coffee perfection feedback" copy="Our customers has amazing things to say about us" /><article className="testimonial"><span className="testimonial__quote">“</span><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset.....</p><h3>Jonny Thomas</h3><span>Project Manager</span><img src="/assets/figma/4-10.webp" alt="Jonny Thomas" /><button className="testimonial__previous" onClick={() => toast("Feedback 1 of 1")} aria-label="Previous feedback"><ChevronLeft size={22} /></button><button className="testimonial__next" onClick={() => toast("Feedback 1 of 1")} aria-label="Next feedback"><ChevronRight size={22} /></button></article></div></section>

    <section className="newsletter-section" id="newsletter"><picture><source media="(max-width: 767px)" srcSet="/assets/figma/105-10045.webp" /><img className="newsletter-section__photo" src="/assets/figma/4-25.webp" alt="Coffee background" /></picture><div className="newsletter-section__overlay" /><img className="newsletter-cup newsletter-cup--left" src="/assets/figma/4-40.webp" alt="" aria-hidden="true" /><img className="newsletter-cup newsletter-cup--right" src="/assets/figma/4-41.webp" alt="" aria-hidden="true" /><div className="newsletter-section__content"><SectionIntro light title="Subscribe to get the Latest News" copy="Don’t miss out on our latest news, updates, tips and special offers" /><form onSubmit={subscribe}><label className="newsletter-label" htmlFor="newsletter-email">Email address</label><div><input id="newsletter-email" name="email" type="email" placeholder="Enter your mail" required autoComplete="email" /><BrandButton type="submit" disabled={isSubscribing}><span className="subscribe-desktop">Suscribe</span><span className="subscribe-mobile">Subscribe</span></BrandButton></div></form>{subscriptionMessage ? <p className="newsletter-status" role="status">{subscriptionMessage}</p> : null}</div></section>

    <div id="footer-contact"><SiteFooter /></div>
  </div>;
}
