// Home page specific JavaScript for Denim by Desewa

// Function to render product cards
function renderProductCard(product) {
  return `
    <div class="product-card">
      <div class="product-image">
        <img src="${product.imageUrl}" alt="${product.name}">
        ${product.isNewArrival ? '<span class="product-badge">New Arrival</span>' : ''}
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

// Load new arrivals for homepage
async function loadNewArrivals() {
  const newArrivalsGrid = document.getElementById('new-arrivals-grid');
  
  if (!newArrivalsGrid) return;
  
  try {
    const products = await API.getProducts({ newArrivals: true });
    
    if (products && products.length > 0) {
      // Display only the first 4 products
      const displayProducts = products.slice(0, 4);
      
      newArrivalsGrid.innerHTML = displayProducts.map(renderProductCard).join('');
      
      // Setup add to cart buttons
      setupAddToCartButtons();
    } else {
      newArrivalsGrid.innerHTML = '<p class="no-products">No new arrivals found</p>';
    }
  } catch (error) {
    console.error('Error loading new arrivals:', error);
    newArrivalsGrid.innerHTML = '<p class="error">Failed to load products. Please try again later.</p>';
  }
}

// Load content when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Load new arrivals
  loadNewArrivals();
});