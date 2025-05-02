document.addEventListener('DOMContentLoaded', () => { // Ensure DOM is loaded
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', handleAddToCartClick);
    });
});

function handleAddToCartClick(event) {
    console.log('Add to Cart button clicked!'); // **DEBUGGING STEP 1**
    const button = event.target;
    const productCard = button.closest('.product-card'); // Find the parent product card

    if (!productCard) {
        console.error("Could not find product card for button:", button);
        return;
    }

    // Extract data from the product card's data attributes
    const productId = productCard.dataset.productId;
    const productName = productCard.dataset.productName;
    // Get price correctly (remove currency symbol and convert to number)
    const priceElement = productCard.querySelector('.product-price');
    const priceString = priceElement ? priceElement.textContent.trim() : '0'; // e.g., "₦15,000.00"
    const price = parseFloat(priceString.replace(/[^0-9.]/g, '')); // Remove ₦ and , -> 15000.00
    const productImage = productCard.dataset.productImage; // Or maybe from the img src itself

     if (!productId || !productName || isNaN(price)) {
         console.error("Missing product data:", { productId, productName, price, productImage });
         return;
     }

    console.log('Product Data:', { id: productId, name: productName, price: price, image: productImage }); // **DEBUGGING STEP 2**

    // --- THIS IS WHERE YOU CALL YOUR CART LOGIC ---
    // Example: Assuming you have an addToCart function defined elsewhere (e.g., in cart.js)
     if (typeof addToCart === 'function') {
         addToCart({
             id: productId,
             name: productName,
             price: price,
             image: productImage,
             quantity: 1 // Start with quantity 1
         });
     } else {
         console.error('addToCart function is not defined!');
     }
     // --- END CART LOGIC CALL ---
}

// --- Make sure your actual cart functions are defined ---
// --- e.g., in cart.js ---
let cart = []; // Or load from localStorage

function addToCart(product) {
     console.log('addToCart function called with:', product); // **DEBUGGING STEP 3**
     // Add logic here to:
     // 1. Check if product already exists in `cart` array
     // 2. If yes, increment quantity
     // 3. If no, add the product object to the `cart` array
     // 4. Update the cart display (counter, sidebar items, totals)
     // 5. Optionally save the cart to localStorage
     updateCartDisplay(); // Example function call
}

function updateCartDisplay() {
    console.log('Updating cart display...'); // **DEBUGGING STEP 4**
    // Add logic here to:
    // - Update the cart count in the header (#cart-count)
    // - Render items in the sidebar (#cart-items)
    // - Calculate and display subtotal/total (#cart-subtotal, #cart-total)
    // - Show/hide empty cart message vs. cart items/footer
    const cartCountElement = document.getElementById('cart-count');
    if(cartCountElement) {
        // Calculate total quantity from `cart` array
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalQuantity;
    }
     // ... more display logic ...
}

// Add functions to handle quantity changes, removal, clearing cart, etc.
// Add functions to load cart from localStorage on page load.