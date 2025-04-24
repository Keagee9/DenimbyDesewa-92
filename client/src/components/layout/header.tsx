import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Search, Menu, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { state, toggleCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "New Arrivals", path: "/new-arrivals" }
  ];
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <a className="text-2xl font-bold text-primary">
            Denim<span className="text-secondary">by</span>Desewa
          </a>
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          {navLinks.map((link) => (
            <Link key={link.path} href={link.path}>
              <a className={`font-medium hover:text-primary transition-colors ${
                location === link.path ? "text-primary" : "text-neutral-900"
              }`}>
                {link.name}
              </a>
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:text-primary transition-colors"
          >
            <Search className="h-5 w-5" />
          </Button>
          
          <Link href={user ? "/admin/dashboard" : "/auth"}>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:text-primary transition-colors"
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:text-primary transition-colors relative"
            onClick={() => toggleCart()}
          >
            <ShoppingCart className="h-5 w-5" />
            {state.items.length > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-accent text-white text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full">
                {state.items.reduce((acc, item) => acc + item.quantity, 0)}
              </Badge>
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden hover:text-primary transition-colors"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200">
          <div className="container mx-auto px-4 py-2 flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a 
                  className={`py-2 font-medium hover:text-primary transition-colors ${
                    location === link.path ? "text-primary" : "text-neutral-900"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
