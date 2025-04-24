import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ProductCard } from "@/components/ui/product-card";
import { Product } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ShopPage() {
  const [location] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [display, setDisplay] = useState<number>(12);
  
  // Parse query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split("?")[1]);
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategory(category);
    }
  }, [location]);
  
  // Fetch all products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  // Filter and sort products
  const filteredProducts = products ? products.filter(product => {
    // Category filter
    if (selectedCategory && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    
    // Price range filter
    if (selectedPriceRange) {
      const price = product.price;
      switch (selectedPriceRange) {
        case "under50":
          return price < 50;
        case "50-100":
          return price >= 50 && price <= 100;
        case "100-150":
          return price >= 100 && price <= 150;
        case "over150":
          return price > 150;
        default:
          return true;
      }
    }
    
    return true;
  }) : [];
  
  // Sort products
  const sortedProducts = [...(filteredProducts || [])].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "newest":
      default:
        return b.id - a.id; // Assuming higher id means newer product
    }
  });
  
  const categories = [
    { id: "jackets", label: "Jackets" },
    { id: "jeans", label: "Jeans" },
    { id: "shirts", label: "Shirts" },
    { id: "skirts", label: "Skirts" },
    { id: "accessories", label: "Accessories" }
  ];
  
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-12">Shop Our Collection</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <div className="lg:w-1/4">
            <div className="bg-neutral-100 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Filters</h3>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Categories</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center">
                      <Checkbox 
                        id={`category-${category.id}`}
                        checked={selectedCategory === category.id}
                        onCheckedChange={(checked) => {
                          setSelectedCategory(checked ? category.id : null);
                        }}
                        className="mr-2"
                      />
                      <Label htmlFor={`category-${category.id}`} className="cursor-pointer">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Price Range</h4>
                <RadioGroup 
                  value={selectedPriceRange || ""}
                  onValueChange={setSelectedPriceRange}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="under50" id="price-under50" />
                    <Label htmlFor="price-under50">Under $50</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="50-100" id="price-50-100" />
                    <Label htmlFor="price-50-100">$50 - $100</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="100-150" id="price-100-150" />
                    <Label htmlFor="price-100-150">$100 - $150</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="over150" id="price-over150" />
                    <Label htmlFor="price-over150">Over $150</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h4 className="font-medium mb-2">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL"].map(size => (
                    <Button
                      key={size}
                      variant="outline"
                      className="w-10 h-10 p-0 rounded-full"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedPriceRange(null);
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
          
          {/* Products */}
          <div className="lg:w-3/4">
            {/* Sort controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center">
                <span className="mr-2">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center">
                <span className="mr-2">Show:</span>
                <Select value={display.toString()} onValueChange={(val) => setDisplay(parseInt(val))}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="Show" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="36">36</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Products grid */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-xl font-medium mb-2">No products found</h3>
                <p className="text-neutral-500">Try adjusting your filters to find what you're looking for</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.slice(0, display).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {sortedProducts.length > 0 && (
              <div className="flex justify-center mt-10">
                <nav className="inline-flex">
                  <Button variant="outline" size="icon" className="rounded-l-lg">
                    {"<"}
                  </Button>
                  <Button variant="default" className="rounded-none">1</Button>
                  <Button variant="outline" className="rounded-none">2</Button>
                  <Button variant="outline" className="rounded-none">3</Button>
                  <Button variant="outline" className="rounded-none">4</Button>
                  <Button variant="outline" size="icon" className="rounded-r-lg">
                    {">"}
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
