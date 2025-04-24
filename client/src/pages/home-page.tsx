import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { Product } from "@shared/schema";
import { CategoryItem } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  // Fetch featured products
  const { data: featuredProducts, isLoading: featuredLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { featured: true }],
  });
  
  // Fetch new arrivals
  const { data: newArrivals, isLoading: newArrivalsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { newArrivals: true }],
  });
  
  // Featured categories
  const categories: CategoryItem[] = [
    {
      name: "Denim Jackets",
      image: "https://images.unsplash.com/photo-1560243563-062bfc001d68",
      url: "/shop?category=jackets"
    },
    {
      name: "Denim Jeans",
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246",
      url: "/shop?category=jeans"
    },
    {
      name: "Denim Accessories",
      image: "https://images.unsplash.com/photo-1602293589930-45aad59ba3ab",
      url: "/shop?category=accessories"
    }
  ];
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-neutral-900 text-white">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04" 
            alt="Fashion Store Interior" 
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Premium Denim Collection
            </h1>
            <p className="text-lg md:text-xl mb-8 text-neutral-200">
              Discover our exclusive range of high-quality denim products crafted for style and comfort.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop">
                <Button size="lg" className="bg-primary hover:bg-secondary text-white">
                  Shop Collection
                </Button>
              </Link>
              <Link href="/new-arrivals">
                <Button size="lg" variant="outline" className="bg-white hover:bg-neutral-200 text-neutral-900">
                  New Arrivals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Categories
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link key={index} href={category.url}>
                <div className="relative rounded-xl overflow-hidden group h-64 cursor-pointer">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 to-transparent flex items-end p-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {category.name}
                      </h3>
                      <span className="text-white hover:text-primary inline-flex items-center">
                        Shop Now <span className="ml-2">→</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* New Arrivals */}
      <section id="new-arrivals" className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">New Arrivals</h2>
            <Link href="/shop">
              <a className="text-primary hover:text-secondary font-medium inline-flex items-center">
                View All <span className="ml-2">→</span>
              </a>
            </Link>
          </div>
          
          {newArrivalsLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {newArrivals?.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} showNewBadge />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Newsletter */}
      <section className="py-16 bg-neutral-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">Join Our Newsletter</h2>
          <p className="max-w-md mx-auto mb-8">
            Subscribe to our newsletter to receive updates on new arrivals, special offers, and fashion tips.
          </p>
          
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="px-4 py-3 rounded-lg flex-grow text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <Button type="submit" className="bg-primary hover:bg-secondary text-white font-semibold whitespace-nowrap">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
