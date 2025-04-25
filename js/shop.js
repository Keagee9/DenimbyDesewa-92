// Shop page JavaScript for Denim by Desewa

// State management for shop page
const ShopState = {
  products: [],
  filteredProducts: [],
  currentPage: 1,
  productsPerPage: 12,
  sortBy: 'newest',
  filters: {
    categories: [],
    priceRange: null,
    size: null
  },
  
  // Update filters and refresh products
  updateFilters(filterType, value, checked = null) {
    // Handle category filter (multiple selection)
    if (filterType === 'category') {
      if (checked === true && !this.filters.categories.includes(value)) {
        this.filters.categories.push(value);
      } else if (checked === false) {
        this.filters.categories = this.filters.categories.filter(cat => cat !== value);
      }
    } 
    // Handle price range filter (single selection)
    else if (filterType === 'price') {
      this.filters.priceRange = value;
    } 
    // Handle size filter (single selection)
    else if (filterType === 'size') {
      this.filters.size = this.filters.size === value ? null : value;
    }
    
    this.currentPage = 1;
    this.filterProducts();
  },
  
  // Clear all filters
  clearFilters() {
    this.filters = {
      categories: [],
      priceRange: null,
      size: null
    };
    
    // Reset UI checkboxes and radio buttons
    document.querySelectorAll('#category-filters input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    document.querySelectorAll('#price-filters input[type="radio"]').forEach(radio => {
      radio.checked = false;
    });
    
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    this.currentPage = 1;
    this.filterProducts();
  },
  
  // Update sorting and refresh products
  updateSort(sortValue) {
    this.sortBy = sortValue;
    this.filterProducts();
  },
  
  // Update products per page and refresh
  updateProductsPerPage(count) {
    this.productsPerPage = parseInt(count);
    this.currentPage = 1;
    this.renderProducts();
  },
  
  // Filter products based on current filters
  filterProducts() {
    // Start with all products
    let filtered = [...this.products];
    
    // Apply category filter
    if (this.filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        this.filters.categories.includes(product.category.toLowerCase())
      );
    }
    
    // Apply price range filter
    if (this.filters.priceRange) {
      const price = this.filters.priceRange;
      filtered = filtered.filter(product => {
        const productPrice = product.price;
        
        switch (price) {
          case 'under50':
            return productPrice < 5000;
          case '50-100':
            return productPrice >= 5000 && productPrice <= 10000;
          case '100-150':
            return productPrice >= 10000 && productPrice <= 15000;
          case 'over150':
            return productPrice > 15000;
          default:
            return true;
        }
      });
    }
    
    // Apply size filter (if implemented in the API)
    // In a real implementation, this would filter by size if the API supported it
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
        default:
          return b.id - a.id; // Assuming higher ID means newer product
      }
    });
    
    this.filteredProducts = filtered;
    this.renderProducts();
  },
  
  // Get pagination info
  getPaginationInfo() {
    const totalProducts = this.filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / this.productsPerPage);
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = Math.min(startIndex + this.productsPerPage, totalProducts);
    
    return {
      totalProducts,
      totalPages,
      startIndex,
      endIndex,
      currentPage: this.currentPage
    };
  },
  
  // Change current page
  goToPage(page) {
    if (page >= 1 && page <= this.getPaginationInfo().totalPages) {
      this.currentPage = page;
      this.renderProducts();
      // Scroll to top of product grid
      document.getElementById('products-grid').scrollIntoView({ behavior: 'smooth' });
    }
  },
  
  // Render pagination controls
  renderPagination() {
    const paginationElement = document.getElementById('pagination');
    if (!paginationElement) return;
    
    const { totalPages, currentPage } = this.getPaginationInfo();
    
    if (totalPages <= 1) {
      paginationElement.innerHTML = '';
      return;
    }
    
    let paginationHTML = '<div class="pagination-controls">';
    
    // Previous button
    paginationHTML += `
      <button class="pagination-btn pagination-prev ${currentPage === 1 ? 'disabled' : ''}" 
        ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
        <i class="fas fa-chevron-left"></i>
      </button>
    `;
    
    // Page numbers
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
          ${i}
        </button>
      `;
    }
    
    // Next button
    paginationHTML += `
      <button class="pagination-btn pagination-next ${currentPage === totalPages ? 'disabled' : ''}" 
        ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
        <i class="fas fa-chevron-right"></i>
      </button>
    `;
    
    paginationHTML += '</div>';
    paginationElement.innerHTML = paginationHTML;
    
    // Add event listeners to pagination buttons
    document.querySelectorAll('.pagination-btn').forEach(btn => {
      if (!btn.disabled) {
        btn.addEventListener('click', () => {
          const page = parseInt(btn.dataset.page);
          this.goToPage(page);
        });
      }
    });
  },
  
  // Render product cards
  renderProductCard(product) {
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
  },
  
  // Render products grid
  renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    const { startIndex, endIndex, totalProducts } = this.getPaginationInfo();
    
    if (totalProducts === 0) {
      productsGrid.innerHTML = `
        <div class="no-products">
          <p>No products found matching your filters.</p>
          <button class="btn btn-outline" id="reset-filters">Reset Filters</button>
        </div>
      `;
      
      document.getElementById('reset-filters')?.addEventListener('click', () => {
        this.clearFilters();
      });
      
      // Hide pagination
      document.getElementById('pagination').innerHTML = '';
      return;
    }
    
    const currentPageProducts = this.filteredProducts.slice(startIndex, endIndex);
    
    productsGrid.innerHTML = currentPageProducts.map(product => this.renderProductCard(product)).join('');
    
    // Update pagination
    this.renderPagination();
    
    // Setup add to cart buttons
    setupAddToCartButtons();
  },
  
  // Initialize shop page
  async init() {
    // Setup event listeners for filters, sorting, etc.
    this.setupEventListeners();
    
    // Get URL query parameters for initial filters
    this.setInitialFiltersFromUrl();
    
    // Load products
    await this.loadProducts();
  },
  
  // Setup all event listeners
  setupEventListeners() {
    // Category filter checkboxes
    document.querySelectorAll('#category-filters input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.updateFilters('category', e.target.value.toLowerCase(), e.target.checked);
      });
    });
    
    // Price range radio buttons
    document.querySelectorAll('#price-filters input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.updateFilters('price', e.target.value);
      });
    });
    
    // Size buttons
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.toggle('active');
        this.updateFilters('size', btn.dataset.size);
      });
    });
    
    // Sort dropdown
    document.getElementById('sort-by')?.addEventListener('change', (e) => {
      this.updateSort(e.target.value);
    });
    
    // Display count dropdown
    document.getElementById('display-count')?.addEventListener('change', (e) => {
      this.updateProductsPerPage(e.target.value);
    });
    
    // Clear filters button
    document.getElementById('clear-filters')?.addEventListener('click', () => {
      this.clearFilters();
    });
  },
  
  // Set initial filters from URL query parameters
  setInitialFiltersFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for category filter
    const category = urlParams.get('category');
    if (category) {
      const checkbox = document.getElementById(`category-${category.toLowerCase()}`);
      if (checkbox) {
        checkbox.checked = true;
        this.updateFilters('category', category.toLowerCase(), true);
      }
    }
    
    // Check for featured filter
    const featured = urlParams.get('featured');
    if (featured === 'true') {
      // Note: In a real implementation, we'd have a featured filter checkbox
      // For now, we'll just load featured products directly
    }
  },
  
  // Load products from API
  async loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    try {
      // Get URL parameters to pass to the API
      const urlParams = new URLSearchParams(window.location.search);
      const filters = {};
      
      if (urlParams.has('category')) {
        filters.category = urlParams.get('category');
      }
      
      if (urlParams.has('featured') && urlParams.get('featured') === 'true') {
        filters.featured = true;
      }
      
      // Get all products
      this.products = await API.getProducts(filters);
      
      // Apply filters to get initial filtered products
      this.filterProducts();
    } catch (error) {
      console.error('Error loading products:', error);
      productsGrid.innerHTML = `
        <div class="error">
          <p>Failed to load products. Please try again later.</p>
        </div>
      `;
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  ShopState.init();
});