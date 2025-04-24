// Cart management for Denim by Desewa website

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
        this.state = JSON.parse(savedCart);
      } catch (e) {
        console.error('Error loading cart from localStorage:', e);
        this.state = { items: [], isOpen: false };
      }
    }
  },
  
  // Save cart to localStorage
  saveCart() {
    localStorage.setItem('denimCart', JSON.stringify(this.state));
    this.updateCartDisplay();
  },
  
  // Add item to cart
  addToCart(product, quantity = 1) {
    // Check if product already exists in cart
    const existingItemIndex = this.state.items.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      this.state.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      this.state.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
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
    this.state.items = this.state.items.filter(item => item.id !== id);
    this.saveCart();
  },
  
  // Update item quantity
  updateQuantity(id, quantity) {
    const item = this.state.items.find(item => item.id === id);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCart();
    }
  },
  
  // Clear all items from cart
  clearCart() {
    this.state.items = [];
    this.saveCart();
  },
  
  // Toggle cart open/closed
  toggleCart(forceState) {
    this.state.isOpen = forceState !== undefined ? forceState : !this.state.isOpen;
    this.saveCart();
    
    // Update DOM elements
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (this.state.isOpen) {
      cartSidebar.classList.add('active');
      cartOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      cartSidebar.classList.remove('active');
      cartOverlay.classList.remove('active');
      document.body.style.overflow = '';
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
    return {
      subtotal,
      total: subtotal // You can add tax, shipping, etc. here
    };
  },
  
  // Update cart count badge and items
  updateCartDisplay() {
    // Update cart count badge
    const cartCount = document.getElementById('cart-count');
    const itemCount = this.state.items.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartCount) {
      cartCount.textContent = itemCount;
      cartCount.style.display = itemCount > 0 ? 'flex' : 'none';
    }
    
    // Update cart items
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartFooter = document.getElementById('cart-footer');
    
    if (cartItemsContainer && cartEmpty && cartFooter) {
      if (this.state.items.length === 0) {
        cartItemsContainer.innerHTML = '';
        cartEmpty.style.display = 'flex';
        cartFooter.style.display = 'none';
      } else {
        cartEmpty.style.display = 'none';
        cartFooter.style.display = 'block';
        
        // Render cart items
        cartItemsContainer.innerHTML = this.state.items.map(item => `
          <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
              <img src="${item.imageUrl}" alt="${item.name}">
            </div>
            <div class="cart-item-content">
              <h4 class="cart-item-title">${item.name}</h4>
              <div class="cart-item-category">Category: ${item.category}</div>
              <div class="cart-item-price">
                ${formatCurrency(item.price * item.quantity)}
                <span class="unit-price">(${formatCurrency(item.price)} each)</span>
              </div>
              <div class="cart-item-actions">
                <div class="cart-item-quantity">
                  <button class="quantity-btn quantity-decrease">-</button>
                  <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                  <button class="quantity-btn quantity-increase">+</button>
                </div>
                <button class="remove-item">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('');
        
        // Update totals
        const totals = this.getCartTotals();
        document.getElementById('cart-subtotal').textContent = formatCurrency(totals.subtotal);
        document.getElementById('cart-total').textContent = formatCurrency(totals.total);
        
        // Add event listeners to cart item controls
        this.addCartItemEventListeners();
      }
    }
  },
  
  // Setup event listeners for cart controls
  setupEventListeners() {
    // Cart toggle button
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
      cartBtn.addEventListener('click', () => this.openCart());
    }
    
    // Close cart button
    const closeCartBtn = document.getElementById('close-cart');
    if (closeCartBtn) {
      closeCartBtn.addEventListener('click', () => this.closeCart());
    }
    
    // Cart overlay (click to close)
    const cartOverlay = document.getElementById('cart-overlay');
    if (cartOverlay) {
      cartOverlay.addEventListener('click', () => this.closeCart());
    }
    
    // Continue shopping buttons
    const continueShoppingBtns = document.querySelectorAll('#continue-shopping, #continue-shopping-footer');
    continueShoppingBtns.forEach(btn => {
      btn.addEventListener('click', () => this.closeCart());
    });
    
    // Clear cart button
    const clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your cart?')) {
          this.clearCart();
          Toast.info('Cart cleared');
        }
      });
    }
  },
  
  // Add event listeners to cart item controls
  addCartItemEventListeners() {
    // Quantity decrease buttons
    document.querySelectorAll('.quantity-decrease').forEach(btn => {
      btn.addEventListener('click', e => {
        const cartItem = e.target.closest('.cart-item');
        const id = parseInt(cartItem.dataset.id);
        const item = this.state.items.find(item => item.id === id);
        
        if (item && item.quantity > 1) {
          this.updateQuantity(id, item.quantity - 1);
        }
      });
    });
    
    // Quantity increase buttons
    document.querySelectorAll('.quantity-increase').forEach(btn => {
      btn.addEventListener('click', e => {
        const cartItem = e.target.closest('.cart-item');
        const id = parseInt(cartItem.dataset.id);
        const item = this.state.items.find(item => item.id === id);
        
        if (item) {
          this.updateQuantity(id, item.quantity + 1);
        }
      });
    });
    
    // Quantity input fields
    document.querySelectorAll('.quantity-input').forEach(input => {
      input.addEventListener('change', e => {
        const cartItem = e.target.closest('.cart-item');
        const id = parseInt(cartItem.dataset.id);
        const newQuantity = parseInt(e.target.value);
        
        if (!isNaN(newQuantity) && newQuantity > 0) {
          this.updateQuantity(id, newQuantity);
        } else {
          this.updateCartDisplay(); // Reset display to valid value
        }
      });
    });
    
    // Remove item buttons
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', e => {
        const cartItem = e.target.closest('.cart-item');
        const id = parseInt(cartItem.dataset.id);
        
        this.removeFromCart(id);
        Toast.info('Item removed from cart');
      });
    });
  }
};

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
});

// Add to cart functionality for product buttons
function setupAddToCartButtons() {
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      
      const productId = parseInt(btn.dataset.productId);
      const quantity = parseInt(btn.dataset.quantity || 1);
      
      // Fetch product data and add to cart
      API.getProduct(productId)
        .then(product => {
          if (product) {
            Cart.addToCart(product, quantity);
          }
        })
        .catch(error => {
          Toast.error('Error adding product to cart');
          console.error('Error adding to cart:', error);
        });
    });
  });
}

// Make Cart available globally
window.Cart = Cart;
window.setupAddToCartButtons = setupAddToCartButtons;