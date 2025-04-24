import { CartItem as CartItemType } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { removeFromCart, updateQuantity } = useCart();
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (newQuantity > 0) {
      updateQuantity(item.id, newQuantity);
    }
  };
  
  return (
    <div className="py-4 flex items-center gap-4 border-b border-neutral-200">
      <img 
        src={item.imageUrl} 
        alt={item.name} 
        className="w-16 h-16 object-cover rounded"
      />
      
      <div className="flex-1">
        <h4 className="font-medium text-sm">{item.name}</h4>
        <div className="flex text-sm text-neutral-500 mt-1">
          <span>Category: {item.category}</span>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
            <span className="text-xs text-neutral-500">
              (${item.price.toFixed(2)} each)
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={item.quantity}
              onChange={handleQuantityChange}
              min="1"
              className="w-16 h-8 text-center text-sm py-1 px-2"
            />
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-neutral-500 hover:text-error hover:bg-transparent p-0"
              onClick={() => removeFromCart(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
