import { X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { CartItem } from "@/components/ui/cart-item";
import { useEffect } from "react";

export function CartSidebar() {
  const { state, toggleCart, clearCart } = useCart();
  const { items, isOpen } = state;
  
  // Prevent scrolling when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Calculate cart totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div 
        className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-lg overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Your Cart</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => toggleCart(false)}
              className="text-neutral-500 hover:text-neutral-900"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1">
            {items.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingBag className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">Your cart is empty</p>
                <Button 
                  variant="default" 
                  className="mt-4 bg-primary hover:bg-secondary text-white"
                  onClick={() => toggleCart(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {items.map(item => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
          
          {items.length > 0 && (
            <div className="mt-auto pt-6">
              <Separator className="mb-6" />
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
              </div>
              
              <div className="flex justify-between text-lg mb-6">
                <span className="font-semibold">Total</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              
              <Button 
                className="w-full bg-primary hover:bg-secondary text-white font-semibold py-6 mb-3"
              >
                Checkout
              </Button>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => toggleCart(false)}
                >
                  Continue Shopping
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex-1 text-error hover:text-error"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
