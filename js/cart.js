document.addEventListener('DOMContentLoaded', () => {
  // --- Constants ---
  const WHATSAPP_NUMBER = '2349033221858'; // Your WhatsApp number

  // --- DOM Elements ---
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  const cartBtn = document.getElementById('cart-btn');
  const closeCartBtn = document.getElementById('close-cart');
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartCountElement = document.getElementById('cart-count');
  const cartSubtotalElement = document.getElementById('cart-subtotal');
  const cartTotalElement = document.getElementById('cart-total');
  const cartEmptyMessage = document.getElementById('cart-empty');
  const cartFooter = document.getElementById('cart-footer');
  const clearCartBtn = document.getElementById('clear-cart');
  const checkoutBtn = document.querySelector('.checkout-btn'); // Select the checkout button
  const continueShoppingBtns = [
      document.getElementById('continue-shopping'),
      document.getElementById('continue-shopping-footer')
  ].filter(btn => btn);

  // --- Cart State ---
  let cartItems = loadCart(); // Load cart from localStorage or initialize as empty array

  // --- Initialization ---
  updateCartUI(); // Initial UI update based on loaded cart
  setupEventListeners(); // Attach all event listeners

  // --- Event Listeners Setup ---
  function setupEventListeners() {
      // Add to Cart Buttons
      addToCartButtons.forEach(button => {
          button.addEventListener('click', handleAddToCartClick);
      });

      // Open Cart Sidebar
      if (cartBtn) {
          cartBtn.addEventListener('click', openCartSidebar);
      }

      // Close Cart Sidebar
      if (closeCartBtn) {
          closeCartBtn.addEventListener('click', closeCartSidebar);
      }
      if (cartOverlay) {
          cartOverlay.addEventListener('click', closeCartSidebar);
      }
      continueShoppingBtns.forEach(btn => btn.addEventListener('click', closeCartSidebar));


      // Actions within the cart (using event delegation)
      if (cartItemsContainer) {
          cartItemsContainer.addEventListener('click', handleCartItemActions);
      }

      // Clear Cart
      if (clearCartBtn) {
          clearCartBtn.addEventListener('click', () => {
              if (confirm('Are you sure you want to clear your cart?')) {
                  clearCart();
              }
          });
      }

      // *** NEW: Checkout Button Listener ***
      if (checkoutBtn) {
          checkoutBtn.addEventListener('click', handleCheckoutClick);
      }
      // *** END NEW ***
  }

  // --- Event Handlers ---
  function handleAddToCartClick(event) {
      const button = event.target;
      const productCard = button.closest('.product-card');

      if (!productCard) {
          console.error("Could not find product card for button:", button);
          return;
      }

      // Extract product data
      const productId = productCard.dataset.productId;
      const productName = productCard.dataset.productName;
      const productImage = productCard.dataset.productImage || productCard.querySelector('img')?.src; // Fallback to img src
      const priceElement = productCard.querySelector('.product-price');
      const priceString = priceElement ? priceElement.textContent.trim() : '0';
      const price = parseFloat(priceString.replace(/[^0-9.]/g, '')); // Remove currency symbols and commas

      if (!productId || !productName || isNaN(price)) {
          console.error("Missing or invalid product data:", { productId, productName, price, productImage });
          alert("Sorry, there was an issue adding this item.");
          return;
      }

      const productToAdd = {
          id: productId,
          name: productName,
          price: price,
          image: productImage || 'image/placeholder.png' // Provide a default image if none found
      };

      addItemToCart(productToAdd);
      openCartSidebar(); // Optionally open cart when item is added
      // Provide visual feedback (optional)
      button.textContent = 'Added!';
      button.disabled = true;
      setTimeout(() => {
           button.textContent = 'Add to Cart';
           button.disabled = false;
      }, 1500);
  }

  function handleCartItemActions(event) {
      const target = event.target;
      const cartItemDiv = target.closest('.cart-item');
      if (!cartItemDiv) return; // Clicked outside an item

      const productId = cartItemDiv.dataset.productId;

      // Remove item
      if (target.classList.contains('remove-item-btn') || target.closest('.remove-item-btn')) {
          removeItemFromCart(productId);
      }

      // Decrease quantity
      if (target.classList.contains('quantity-decrease') || target.closest('.quantity-decrease')) {
          updateQuantity(productId, -1);
      }

      // Increase quantity
      if (target.classList.contains('quantity-increase') || target.closest('.quantity-increase')) {
           updateQuantity(productId, 1);
      }
  }

  // *** NEW: WhatsApp Checkout Handler ***
  function handleCheckoutClick() {
      if (cartItems.length === 0) {
          alert("Your cart is empty. Please add items before checking out.");
          return; // Don't proceed if cart is empty
      }

      // 1. Format the message
      let message = "Hello Denim by Desewa!\n\nI would like to place an order for the following items:\n\n";

      cartItems.forEach(item => {
          // Include item name and quantity. Optionally include price per item.
          message += `- ${item.name} x ${item.quantity}\n`;
          // Example including price:
          // message += `- ${item.name} x ${item.quantity} (${formatCurrency(item.price)} each)\n`;
      });

      // 2. Add the total
      const { total } = calculateTotals();
      message += `\nTotal Order Value: ${formatCurrency(total)}`;

      // 3. Add closing message (optional)
      message += "\n\nPlease confirm availability and provide payment details.";

      // 4. URL-encode the message for the link
      const encodedMessage = encodeURIComponent(message);

      // 5. Construct the WhatsApp URL
      // Note: Using https://wa.me/ is generally preferred
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

      // 6. Open the URL in a new tab
      window.open(whatsappUrl, '_blank');

      // 7. Optional: Clear cart after sending to WhatsApp?
      // if (confirm("Your order details have been sent to WhatsApp. Clear your cart now?")) {
      //     clearCart();
      // }
  }
  // *** END NEW ***


  // --- Cart Logic Functions ---
  function addItemToCart(product) {
      const existingItemIndex = cartItems.findIndex(item => item.id === product.id);

      if (existingItemIndex > -1) {
          cartItems[existingItemIndex].quantity += 1;
      } else {
          cartItems.push({ ...product, quantity: 1 });
      }

      saveCart();
      updateCartUI();
  }

  function removeItemFromCart(productId) {
      cartItems = cartItems.filter(item => item.id !== productId);
      saveCart();
      updateCartUI();
  }

  function updateQuantity(productId, change) {
       const itemIndex = cartItems.findIndex(item => item.id === productId);
       if (itemIndex > -1) {
           cartItems[itemIndex].quantity += change;
           if (cartItems[itemIndex].quantity <= 0) {
               removeItemFromCart(productId);
           } else {
               saveCart();
               updateCartUI();
           }
       }
  }

  function clearCart() {
      cartItems = [];
      saveCart();
      updateCartUI();
      // Keep the cart sidebar open or close it? Decide based on UX preference.
      // closeCartSidebar();
  }

  function calculateTotals() {
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const total = subtotal;
      return { subtotal, total };
  }

  // --- UI Update Functions ---
  function updateCartUI() {
      renderCartItems();
      updateCartTotals();
      updateCartCount();
      toggleEmptyCartMessage();
      // *** NEW: Enable/disable checkout button based on cart state ***
      if (checkoutBtn) {
          checkoutBtn.disabled = cartItems.length === 0;
      }
      // *** END NEW ***
  }

  function renderCartItems() {
      if (!cartItemsContainer) return;
      cartItemsContainer.innerHTML = '';
      if (cartItems.length === 0) return;

      cartItems.forEach(item => {
          const itemElement = document.createElement('div');
          itemElement.classList.add('cart-item');
          itemElement.dataset.productId = item.id;

          const formattedPrice = formatCurrency(item.price);
          const formattedLineTotal = formatCurrency(item.price * item.quantity);

          itemElement.innerHTML = `
              <img src="${item.image}" alt="${item.name}" class="cart-item-image">
              <div class="cart-item-details">
                  <h4 class="cart-item-title">${item.name}</h4>
                  <p class="cart-item-price">${formattedPrice}</p>
                  <div class="cart-item-quantity">
                      <button class="quantity-btn quantity-decrease" aria-label="Decrease quantity">-</button>
                      <span class="quantity-value">${item.quantity}</span>
                      <button class="quantity-btn quantity-increase" aria-label="Increase quantity">+</button>
                  </div>
              </div>
              <div class="cart-item-subtotal">
                  <span>${formattedLineTotal}</span>
                  <button class="remove-item-btn" aria-label="Remove item">
                      <i class="fas fa-trash-alt"></i>
                  </button>
              </div>
          `;
          cartItemsContainer.appendChild(itemElement);
      });
  }

  function updateCartTotals() {
      const { subtotal, total } = calculateTotals();
      if (cartSubtotalElement) {
          cartSubtotalElement.textContent = formatCurrency(subtotal);
      }
      if (cartTotalElement) {
          cartTotalElement.textContent = formatCurrency(total);
      }
  }

  function updateCartCount() {
      if (!cartCountElement) return;
      const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      cartCountElement.textContent = totalQuantity;
      cartCountElement.style.display = totalQuantity > 0 ? 'flex' : 'none';
  }

  function toggleEmptyCartMessage() {
      const isEmpty = cartItems.length === 0;
      if (cartEmptyMessage) {
          cartEmptyMessage.style.display = isEmpty ? 'flex' : 'none';
      }
      if (cartItemsContainer) {
           cartItemsContainer.style.display = isEmpty ? 'none' : 'block';
      }
      if (cartFooter) {
          cartFooter.style.display = isEmpty ? 'none' : 'block';
      }
  }

  function openCartSidebar() {
      if (cartSidebar) cartSidebar.classList.add('active');
      if (cartOverlay) cartOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
  }

  function closeCartSidebar() {
      if (cartSidebar) cartSidebar.classList.remove('active');
      if (cartOverlay) cartOverlay.classList.remove('active');
      document.body.style.overflow = '';
  }

  // --- Local Storage Functions ---
  function saveCart() {
      try {
          localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
      } catch (e) {
          console.error("Could not save cart to localStorage:", e);
      }
  }

  function loadCart() {
      try {
          const savedCart = localStorage.getItem('shoppingCart');
          return savedCart ? JSON.parse(savedCart) : [];
      } catch (e) {
          console.error("Could not load cart from localStorage:", e);
          localStorage.removeItem('shoppingCart');
          return [];
      }
  }

  // --- Utility Functions ---
  function formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: 'NGN',
          minimumFractionDigits: 2
      }).format(amount);
  }

}); // End DOMContentLoaded
