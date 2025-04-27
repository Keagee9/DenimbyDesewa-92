// Cart management for Denim by Desewa website

// --- START: Added Helper Functions ---

/**
 * Formats a number as Nigerian Naira currency.
 * @param {number} amount - The amount to format.
 * @returns {string} Formatted currency string (e.g., "₦1,234.56").
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number') {
    amount = 0; // Default to 0 if not a number
  }
  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  });
  // Return the standard format which includes NGN for clarity,
  // or use .replace('NGN', '₦') if you strictly want only the symbol.
  return formatter.format(amount);
}

/**
 * Placeholder for a Toast notification system.
 * Replace with your actual toast library (e.g., Toastify, Notyf).
 */
const Toast = {
  success: (message) => {
    console.log('Toast Success:', message);
    alert(`SUCCESS: ${message}`); // Simple alert placeholder
  },
  info: (message) => {
    console.log('Toast Info:', message);
    alert(`INFO: ${message}`); // Simple alert placeholder
  },
  error: (message) => {
    console.error('Toast Error:', message);
    alert(`ERROR: ${message}`); // Simple alert placeholder
  },
};
// --- END: Added Helper Functions ---


// Cart state management
const Cart = {
  // Initial cart state
  state: {
    items: [],
    isOpen: false
  },

  // Initialize cart from localStorage
  init() {
    this.loadCart();
    this.setupEventListeners();
    this.updateCartDisplay();
  },

  // Load cart from localStorage
  loadCart() {
    const savedCart = localStorage.getItem('denimCart');
    if (savedCart) {
      try {
        // Basic validation: ensure it's an object with 'items' array
        const parsed = JSON.parse(savedCart);
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
           this.state = parsed;
           // Ensure isOpen is always false on initial load
           this.state.isOpen = false;
        } else {
           throw new Error("Invalid cart structure in localStorage");
        }
      } catch (e) {
        console.error('Error loading or validating cart from localStorage:', e);
        // Reset to default state if loading fails
        this.state = { items: [], isOpen: false };
        localStorage.removeItem('denimCart'); // Clear corrupted data
      }
    } else {
       // Initialize if no cart exists
       this.state = { items: [], isOpen: false };
    }
  },

  // Save cart to localStorage
  saveCart() {
    try {
       localStorage.setItem('denimCart', JSON.stringify(this.state));
    } catch (e) {
       console.error("Error saving cart to localStorage:", e);
       // Handle potential storage full errors if necessary
    }
    this.updateCartDisplay(); // Update display AFTER saving
  },

  // Add item to cart
  addToCart(product, quantity = 1) {
     // Basic validation for the product object
    if (!product || typeof product !== 'object' || !product.id || !product.name || typeof product.price !== 'number') {
        console.error("Invalid product data passed to addToCart:", product);
        Toast.error("Could not add item: Invalid product data.");
        return;
    }

    const existingItemIndex = this.state.items.findIndex(item => item.id === product.id);

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      this.state.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      // Ensure all expected properties are included
      this.state.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        // Use product.imageUrl IF PROVIDED, otherwise use a fallback/placeholder
        imageUrl: product.imageUrl || 'img/placeholder_product.png', // Add a default placeholder path if needed
        category: product.category || 'Uncategorized', // Use provided category or default
        quantity
      });
    }

    // Save and show cart
    this.saveCart();
    this.openCart();

    // Show toast notification
    Toast.success(`${product.name} added to cart`);
  },

  // Remove item from cart
  removeFromCart(id) {
    const itemToRemove = this.state.items.find(item => item.id === id);
    this.state.items = this.state.items.filter(item => item.id !== id);
    this.saveCart();
    // Add feedback only if an item was actually removed
    if (itemToRemove) {
       Toast.info(`${itemToRemove.name} removed from cart`);
    }
  },

  // Update item quantity
  updateQuantity(id, quantity) {
    const itemIndex = this.state.items.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
        // Ensure quantity is at least 1
       const newQuantity = Math.max(1, quantity);
       if (this.state.items[itemIndex].quantity !== newQuantity) {
            this.state.items[itemIndex].quantity = newQuantity;
            this.saveCart(); // Save only if quantity actually changed
       } else {
           // If quantity didn't change (e.g., tried to go below 1),
           // still call updateCartDisplay to ensure input field resets visually
           this.updateCartDisplay();
       }
    }
  },

  // Clear all items from cart
  clearCart() {
    if (this.state.items.length > 0) { // Only clear and show toast if not already empty
        this.state.items = [];
        this.saveCart();
        Toast.info('Cart cleared');
    }
  },

  // Toggle cart open/closed
  toggleCart(forceState) {
    this.state.isOpen = forceState !== undefined ? forceState : !this.state.isOpen;
    // NOTE: We DON'T save state.isOpen to localStorage here,
    // as the cart should always be closed on page load.

    // Update DOM elements
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');

    if (cartSidebar && cartOverlay) { // Check if elements exist
        if (this.state.isOpen) {
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        } else {
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore background scroll
        }
    } else {
        console.error("Cart sidebar or overlay element not found.");
    }
  },

  // Open cart
  openCart() {
    this.toggleCart(true);
  },

  // Close cart
  closeCart() {
    this.toggleCart(false);
  },

  // Calculate cart totals
  getCartTotals() {
    const subtotal = this.state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Add tax, shipping calculations here if needed
    const total = subtotal; // For now, total equals subtotal
    return {
      subtotal,
      total
    };
  },

  // Update cart count badge and items
  updateCartDisplay() {
    // Update cart count badge
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
      const itemCount = this.state.items.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = itemCount;
      cartCount.style.display = itemCount > 0 ? 'flex' : 'none';
    }

    // Update cart items container
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartFooter = document.getElementById('cart-footer');

    if (cartItemsContainer && cartEmpty && cartFooter) {
      if (this.state.items.length === 0) {
        cartItemsContainer.innerHTML = ''; // Clear items
        cartEmpty.style.display = 'flex'; // Show empty message
        cartFooter.style.display = 'none'; // Hide footer
      } else {
        cartEmpty.style.display = 'none'; // Hide empty message
        cartFooter.style.display = 'block'; // Show footer

        // Render cart items using the formatCurrency function
        cartItemsContainer.innerHTML = this.state.items.map(item => `
          <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
              <img src="${item.imageUrl || 'img/placeholder_product.png'}" alt="${item.name || 'Product'}">
            </div>
            <div class="cart-item-content">
              <h4 class="cart-item-title">${item.name || 'Unnamed Product'}</h4>
              ${item.category ? `<div class="cart-item-category">Category: ${item.category}</div>` : ''}
              <div class="cart-item-price">
                ${formatCurrency(item.price * item.quantity)}
                ${item.quantity > 1 ? `<span class="unit-price">(${formatCurrency(item.price)} each)</span>` : ''}
              </div>
              <div class="cart-item-actions">
                <div class="cart-item-quantity">
                  <button class="quantity-btn quantity-decrease" aria-label="Decrease quantity">-</button>
                  <input type="number" class="quantity-input" value="${item.quantity}" min="1" aria-label="Quantity">
                  <button class="quantity-btn quantity-increase" aria-label="Increase quantity">+</button>
                </div>
                <button class="remove-item" aria-label="Remove item">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('');

        // Update totals
        const totals = this.getCartTotals();
        const cartSubtotalEl = document.getElementById('cart-subtotal');
        const cartTotalEl = document.getElementById('cart-total');
        if (cartSubtotalEl) cartSubtotalEl.textContent = formatCurrency(totals.subtotal);
        if (cartTotalEl) cartTotalEl.textContent = formatCurrency(totals.total);

        // Add event listeners AFTER rendering items
        this.addCartItemEventListeners();
      }
    } else {
        console.error("One or more cart display elements not found (cart-items, cart-empty, cart-footer).");
    }
  },

  // Setup event listeners for general cart controls
  setupEventListeners() {
    // Use event delegation for dynamically added elements where possible
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) cartBtn.addEventListener('click', () => this.openCart());

    const closeCartBtn = document.getElementById('close-cart');
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => this.closeCart());

    const cartOverlay = document.getElementById('cart-overlay');
    if (cartOverlay) cartOverlay.addEventListener('click', () => this.closeCart());

    // Continue shopping buttons (using querySelectorAll)
    document.querySelectorAll('#continue-shopping, #continue-shopping-footer').forEach(btn => {
      if(btn) btn.addEventListener('click', () => this.closeCart());
    });

    // Clear cart button
    const clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', () => {
        // Add confirmation dialog
        if (this.state.items.length > 0 && confirm('Are you sure you want to clear your cart?')) {
          this.clearCart();
        }
      });
    }

     // Add listener for checkout button if needed
     const checkoutBtn = document.querySelector('.checkout-btn');
     if (checkoutBtn) {
         checkoutBtn.addEventListener('click', () => {
             if (this.state.items.length > 0) {
                 alert(`Proceeding to checkout with ${this.state.items.length} items. Total: ${formatCurrency(this.getCartTotals().total)} (Demo - No actual checkout)`);
                 // Add actual checkout logic here (e.g., redirect to checkout page)
             } else {
                 alert("Your cart is empty.");
             }
         });
     }
  },

  // Add event listeners specifically for controls within cart items
  addCartItemEventListeners() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return; // Exit if container not found

    // Use event delegation on the container for item controls
    cartItemsContainer.addEventListener('click', (event) => {
      const target = event.target;
      const cartItemElement = target.closest('.cart-item');
      if (!cartItemElement) return; // Click wasn't inside a cart item

      const id = cartItemElement.dataset.id; // Get ID from parent item
       // Ensure ID is treated consistently (e.g., as string if product IDs are strings)
       // If product IDs are numbers, parse it: const id = parseInt(cartItemElement.dataset.id);


      if (target.classList.contains('quantity-decrease') || target.closest('.quantity-decrease')) {
          const item = this.state.items.find(i => i.id === id);
          if (item) {
             this.updateQuantity(id, item.quantity - 1);
          }
      } else if (target.classList.contains('quantity-increase') || target.closest('.quantity-increase')) {
          const item = this.state.items.find(i => i.id === id);
          if (item) {
             this.updateQuantity(id, item.quantity + 1);
          }
      } else if (target.classList.contains('remove-item') || target.closest('.remove-item')) {
          this.removeFromCart(id);
      }
    });

     // Add separate listeners for quantity input changes (blur or enter key)
     cartItemsContainer.querySelectorAll('.quantity-input').forEach(input => {
         input.addEventListener('change', (event) => { // 'change' fires on blur or Enter
             const cartItemElement = event.target.closest('.cart-item');
             if (!cartItemElement) return;
             const id = cartItemElement.dataset.id;
             const newQuantity = parseInt(event.target.value);

             if (!isNaN(newQuantity)) {
                 this.updateQuantity(id, newQuantity); // updateQuantity handles clamping to min 1
             } else {
                 // If input is invalid, revert display
                 this.updateCartDisplay();
             }
         });
     });
  }
};

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
});

// Make Cart available globally for other scripts (like new-arrivals.js)
window.Cart = Cart;


// --- COMMENTED OUT - This section is for dynamic product loading, not needed for static new-arrivals.html ---
/*
// Add to cart functionality for product buttons (if using dynamic product loading)
function setupAddToCartButtons() {
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();

      const productId = parseInt(btn.dataset.productId);
      const quantity = parseInt(btn.dataset.quantity || 1);

      // Fetch product data (Requires an API object/function)
      // Example:
      // API.getProduct(productId)
      //   .then(product => {
      //     if (product) {
      //       Cart.addToCart(product, quantity);
      //     }
      //   })
      //   .catch(error => {
      //     Toast.error('Error adding product to cart');
      //     console.error('Error adding to cart:', error);
      //   });

      console.warn("setupAddToCartButtons called, but API.getProduct is not defined. This function is intended for dynamic product loading.");
      Toast.error("Cannot add item dynamically - Feature not implemented.");
    });
  });
}
// Expose if needed for dynamic pages, but not for new-arrivals.html
// window.setupAddToCartButtons = setupAddToCartButtons;
*/
// --- END COMMENTED OUT SECTION ---

// Inside cart.js, within the Cart object:
init() {
  console.log("Cart.init starting..."); // Add log
  this.loadCart();
  console.log("Cart.init after loadCart."); // Add log
  this.setupEventListeners();
  console.log("Cart.init after setupEventListeners."); // Add log
  this.updateCartDisplay();
  console.log("Cart.init finished."); // Add log
},