import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";
import { ThemeProvider } from "next-themes";
import { ProtectedRoute } from "@/lib/protected-route";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartSidebar } from "@/components/layout/cart-sidebar";

import HomePage from "@/pages/home-page";
import ShopPage from "@/pages/shop-page";
import ProductDetail from "@/pages/product-detail";
import AdminDashboard from "@/pages/admin/dashboard";
import ProductForm from "@/pages/admin/product-form";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/shop" component={ShopPage} />
      <Route path="/new-arrivals" component={() => <ShopPage />} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin routes - protected */}
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} adminOnly />
      <ProtectedRoute path="/admin/product/:id" component={ProductForm} adminOnly />
      <ProtectedRoute path="/admin/product/new" component={ProductForm} adminOnly />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Header />
              <CartSidebar />
              <Router />
              <Footer />
              <Toaster />
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
