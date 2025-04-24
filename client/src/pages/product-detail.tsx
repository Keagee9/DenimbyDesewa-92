import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, Heart, ShoppingCart, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ui/product-card";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  // Fetch product details
  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
  });
  
  // Fetch related products (same category)
  const { data: relatedProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!product,
    select: (data) => 
      data.filter(p => p.category === product?.category && p.id !== product?.id).slice(0, 4),
  });
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-8">Sorry, the product you're looking for doesn't exist.</p>
        <Link href="/shop">
          <Button className="bg-primary hover:bg-secondary">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-16">
        <Link href="/shop">
          <a className="inline-flex items-center text-neutral-600 hover:text-primary mb-8">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Shop
          </a>
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Product Image */}
          <div className="lg:w-1/2">
            <div className="aspect-square rounded-lg overflow-hidden bg-neutral-100">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Product Details */}
          <div className="lg:w-1/2">
            <div className="mb-2 flex items-center gap-2">
              {product.isNewArrival && (
                <Badge className="bg-accent hover:bg-accent/90 text-white">
                  New Arrival
                </Badge>
              )}
              <span className="text-neutral-600">{product.category}</span>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            <div className="text-2xl font-bold text-primary mb-6">
              ${product.price.toFixed(2)}
            </div>
            
            <p className="text-neutral-600 mb-8">
              {product.description}
            </p>
            
            <Separator className="my-6" />
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL"].map(size => (
                    <Button
                      key={size}
                      variant="outline"
                      className="w-12 h-12 p-0 rounded-full"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Quantity</h3>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </Button>
                  <span className="ml-4 text-neutral-500">
                    {product.stock} items available
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-primary hover:bg-secondary text-white flex-1 py-6"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                >
                  <Heart className="mr-2 h-5 w-5" /> Add to Wishlist
                </Button>
              </div>
              
              <div className="flex items-center text-success">
                <Check className="mr-2 h-5 w-5" /> 
                <span>Free shipping on orders over $100</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
