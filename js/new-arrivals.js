document.addEventListener('DOMContentLoaded', () => {
    console.log("New Arrivals Page Script Initializing...");
  
    // Corrected ID to match HTML
    const productGrid = document.getElementById('new-arrivals-list');
    if (!productGrid) {
        console.error("Element with ID 'new-arrivals-list' not found. Cannot add cart functionality.");
        return;
    }
  
    // --- Cart Interaction Check ---
    // Ensure the Cart object and its addToCart method are available globally
    if (typeof Cart === 'undefined' || typeof Cart.addToCart !== 'function') {
        console.error("Cart object or Cart.addToCart function not found. Make sure cart.js is loaded *before* new-arrivals.js and defines 'window.Cart'.");
        // Disable buttons or show a message if cart isn't functional
        productGrid.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.disabled = true;
            button.textContent = 'Cart Unavailable';
            button.style.backgroundColor = '#ccc'; // Example disabled style
        });
        return; // Stop execution if cart isn't available
    }
    // --- End Cart Interaction Check ---
  
    // Use event delegation on the grid container
    productGrid.addEventListener('click', (event) => {
        // Check if the clicked element is an add-to-cart button or inside one
        const clickedButton = event.target.closest('.add-to-cart-btn');
  
        if (clickedButton) {
            // Find the parent product card to get data attributes
            const productCard = clickedButton.closest('.product-card');
            if (!productCard) {
                console.error("Could not find parent '.product-card' for clicked button.");
                return; // Should not happen if HTML is correct
            }
  
            // Extract product details from the product card's data attributes
            const productId = productCard.dataset.productId;
            const productName = productCard.dataset.productName;
            const productPriceString = productCard.dataset.productPrice;
            // Get the image URL expected by cart.js
            const productImageUrl = productCard.dataset.productImage;
             // Get category if available, otherwise it will be undefined
            const productCategory = productCard.dataset.productCategory;
  
  
            // Validate extracted data
            const productPrice = parseFloat(productPriceString);
            if (!productId || !productName || isNaN(productPrice) || !productImageUrl) {
                console.error('Missing or invalid product data on card:', productCard.dataset);
                // Use the placeholder Toast or alert
                if(typeof Toast !== 'undefined' && Toast.error) {
                   Toast.error('Sorry, cannot add item (invalid data).');
                } else {
                   alert('Sorry, cannot add item (invalid data).');
                }
                return; // Prevent adding incomplete data
            }
  
            // Prepare the product data object (matching structure Cart.addToCart expects)
            const productData = {
                id: productId, // Keep ID as string or parse if needed
                name: productName,
                price: productPrice,
                imageUrl: productImageUrl, // Correct key name
                category: productCategory, // Will be undefined if attribute missing, cart.js handles default
                // quantity is handled by Cart.addToCart default parameter
            };
  
            console.log('Adding to cart:', productData);
  
            // Call the addToCart method on the global Cart object
            try {
                Cart.addToCart(productData); // <-- Corrected function call
  
                // --- Visual Feedback (Optional but Recommended) ---
                clickedButton.textContent = 'Added!';
                clickedButton.disabled = true;
                // Use CSS variable for success color from main.css
                clickedButton.style.backgroundColor = 'var(--success-color, #4caf50)'; // Fallback color
                clickedButton.style.borderColor = 'var(--success-color, #4caf50)'; // Match border
  
                setTimeout(() => {
                    clickedButton.textContent = 'Add to Cart';
                    clickedButton.disabled = false;
                    clickedButton.style.backgroundColor = ''; // Revert to CSS default
                    clickedButton.style.borderColor = ''; // Revert to CSS default
                }, 1500); // 1.5 seconds
                // --- End Visual Feedback ---
  
            } catch (error) {
                console.error("Error executing Cart.addToCart function:", error);
                 if(typeof Toast !== 'undefined' && Toast.error) {
                    Toast.error('An error occurred adding the item.');
                } else {
                   alert('An error occurred adding the item.');
                }
            }
        }
    });
  
    console.log("Event listener attached to product grid for Add to Cart buttons.");
  
     // Add current year to footer (if not already handled elsewhere)
      const currentYearSpan = document.getElementById('current-year');
      if (currentYearSpan && !currentYearSpan.textContent.includes(new Date().getFullYear())) {
          currentYearSpan.textContent = new Date().getFullYear();
      }
  
  }); // End DOMContentLoaded