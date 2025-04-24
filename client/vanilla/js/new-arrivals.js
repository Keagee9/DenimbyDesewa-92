// New arrivals page functionality for Denim by Desewa

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
async function loadNewArrivals() {
  const productsGrid = document.getElementById('new-arrivals-grid');
  
  if (!productsGrid) return;
  
  try {
    // Show loading indicator
    productsGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i></div>';
    
    // Get products with newArrivals filter
    const products = await API.getProducts({ newArrivals: true });
    
    if (products && products.length > 0) {
      // Render products
      productsGrid.innerHTML = products.map(renderProductCard).join('');
      
      // Setup add to cart buttons
      setupAddToCartButtons();
    } else {
      // No products found
      productsGrid.innerHTML = `
        <div class="no-products-message">
          <p>No new arrivals found at the moment. Check back soon!</p>
          <a href="shop.html" class="btn btn-primary mt-4">Browse All Products</a>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading new arrivals:', error);
    productsGrid.innerHTML = `
      <div class="error-message">
        <p>Failed to load products. Please try again later.</p>
        <button class="btn btn-primary mt-4" onclick="loadNewArrivals()">Retry</button>
      </div>
    `;
  }
}

// Load content when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Load new arrivals
  loadNewArrivals();
});