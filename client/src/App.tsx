import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartDrawer } from "@/components/SiteChrome";
import { CartProvider } from "@/contexts/CartContext";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { AboutPage, CartPage, CheckoutPage, ContactPage, OrderConfirmedPage, ProductPage, ShopPage } from "./pages/CommercePages";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={ShopPage} />
      <Route path="/product/:slug" component={ProductPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/order-confirmed" component={OrderConfirmedPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <CartProvider>
            <Router />
            <CartDrawer />
          </CartProvider>
          <Toaster richColors position="top-center" />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
