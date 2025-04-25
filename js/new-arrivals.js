
// New arrivals page functionality for Denim by Desewa

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Function to render product cards
function renderProductCard(product) {
  return `
    <div class="product-card">
      <div class="product-image">
        <img src="${product.imageUrl}" alt="${product.name}">
        <span class="product-badge">New Arrival</span>
      </div>
      <div class="product-content">
        <div class="product-category">${product.category}</div>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-price">${formatCurrency(product.price)}</div>
        <div class="product-actions">
          <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}

// Load new arrivals
function loadNewArrivals() {
  const productsGrid = document.getElementById('new-arrivals-grid');
  
  if (!productsGrid) return;

  // Sample static products for testing
  const sampleProducts = [
    {
      id: 1,
      name: "Classic Denim Jacket",
      category: "Jackets",
      price: 99.99,
      imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d"
    },
    {
      id: 2,
      name: "Vintage Jeans",
      category: "Jeans",
      price: 79.99,
      imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246"
    },
    {
      id: 3,
      name: "Denim Shirt",
      category: "Shirts",
      price: 59.99,
      imageUrl: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f"
    },
    {
      id: 4,
      name: "Distressed Denim",
      category: "Jeans",
      price: 89.99,
      imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246"
    }
  ];

  // Render products
  productsGrid.innerHTML = sampleProducts.map(renderProductCard).join('');

  // Setup add to cart buttons
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute('data-product-id');
      // Add to cart functionality can be implemented here
      console.log('Adding product to cart:', productId);
    });
  });
}

// Load content when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  loadNewArrivals();
});
