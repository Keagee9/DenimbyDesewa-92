import { createContext, ReactNode, useContext, useReducer, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CartItem } from "@/lib/types";
import { Product } from "@shared/schema";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction = 
  | { type: "ADD_ITEM"; payload: Product; quantity?: number }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART"; payload?: boolean };

interface CartContextType {
  state: CartState;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (forceState?: boolean) => void;
}

const initialState: CartState = {
  items: [],
  isOpen: false
};

// Load cart from localStorage if available
const loadCart = (): CartState => {
  if (typeof window === "undefined") return initialState;
  
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    try {
      return JSON.parse(savedCart);
    } catch (e) {
      console.error("Failed to parse cart from localStorage:", e);
    }
  }
  return initialState;
};

// Cart reducer function
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const product = action.payload;
      const quantity = action.quantity || 1;
      const existingItemIndex = state.items.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return { ...state, items: updatedItems };
      } else {
        // New item
        return {
          ...state,
          items: [...state.items, {
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity,
            category: product.category
          }]
        };
      }
    }
    
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
      
    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      return {
        ...state,
        items: state.items.map(item => 
          item.id === id ? { ...item, quantity } : item
        )
      };
    }
    
    case "CLEAR_CART":
      return {
        ...state,
        items: []
      };
      
    case "TOGGLE_CART":
      return {
        ...state,
        isOpen: action.payload !== undefined ? action.payload : !state.isOpen
      };
      
    default:
      return state;
  }
};

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, loadCart);
  const { toast } = useToast();
  
  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state));
  }, [state]);
  
  const addToCart = (product: Product, quantity = 1) => {
    dispatch({ type: "ADD_ITEM", payload: product, quantity });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };
  
  const removeFromCart = (id: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
    });
  };
  
  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };
  
  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };
  
  const toggleCart = (forceState?: boolean) => {
    dispatch({ type: "TOGGLE_CART", payload: forceState });
  };
  
  return (
    <CartContext.Provider value={{
      state,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
