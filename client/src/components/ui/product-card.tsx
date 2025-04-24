import { Product } from "@shared/schema";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
  showNewBadge?: boolean;
}

export function ProductCard({ product, showNewBadge = false }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative">
        <Link href={`/product/${product.id}`}>
          <div className="relative h-64 overflow-hidden cursor-pointer">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        </Link>
        
        {showNewBadge && product.isNewArrival && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-accent hover:bg-accent/90 text-white">
              New
            </Badge>
          </div>
        )}
        
        <Button 
          size="icon" 
          variant="outline" 
          className="absolute top-4 right-4 bg-white hover:text-primary transition-colors rounded-full"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-neutral-900">
            ${product.price.toFixed(2)}
          </span>
          
          <Button
            size="sm"
            className="bg-primary hover:bg-secondary text-white rounded-lg"
            onClick={() => addToCart(product)}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
