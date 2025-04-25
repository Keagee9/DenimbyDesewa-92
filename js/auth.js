// Admin panel functionality for Denim by Desewa website

// Admin state management
const Admin = {
  products: [],
  currentProduct: null,
  
  // Initialize admin panel
  init() {
    this.checkAdminStatus();
    this.setupEventListeners();
    this.loadProducts();
  },
  
  // Check if user is admin
  async checkAdminStatus() {
    try {
      const response = await fetch('/api/user');
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      
      const user = await response.json();
      if (!user || !user.isAdmin) {
        window.location.href = 'auth.html';
        return;
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      window.location.href = 'auth.html';
    }
  },
  
  // Setup event listeners
  setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          await API.logout();
          window.location.href = 'auth.html';
        } catch (error) {
          console.error('Error logging out:', error);
          Toast.error('Failed to logout. Please try again.');
        }
      });
    }
    
    // Add product button
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
      addProductBtn.addEventListener('click', () => this.showAddProductModal());
    }
    
    // Add first product button (shown when no products exist)
    const addFirstProductBtn = document.getElementById('add-first-product-btn');
    if (addFirstProductBtn) {
      addFirstProductBtn.addEventListener('click', () => this.showAddProductModal());
    }
    
    // Close product modal button
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => this.hideProductModal());
    }
    
    // Close delete modal button
    const closeDeleteModalBtn = document.getElementById('close-delete-modal');
    if (closeDeleteModalBtn) {
      closeDeleteModalBtn.addEventListener('click', () => this.hideDeleteModal());
    }
    
    // Cancel product form button
    const cancelProductBtn = document.getElementById('cancel-product-btn');
    if (cancelProductBtn) {
      cancelProductBtn.addEventListener('click', () => this.hideProductModal());
    }
    
    // Cancel delete button
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener('click', () => this.hideDeleteModal());
    }
    
    // Confirm delete button
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', () => this.deleteProduct());
    }
    
    // Product form submission
    const productForm = document.getElementById('product-form');
    if (productForm) {
      productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleProductSubmit(productForm);
      });
    }
    
    // Modal overlays (click to close)
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    modalOverlays.forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          const modal = overlay.closest('.modal');
          if (modal.id === 'product-modal') {
            this.hideProductModal();
          } else if (modal.id === 'delete-modal') {
            this.hideDeleteModal();
          }
        }
      });
    });
  },
  
  // Load all products
  async loadProducts() {
    const tableBody = document.getElementById('product-table-body');
    const loadingElement = document.getElementById('loading-products');
    const noProductsElement = document.getElementById('no-products');
    
    if (!tableBody || !loadingElement || !noProductsElement) return;
    
    try {
      // Show loading
      loadingElement.classList.remove('hidden');
      tableBody.innerHTML = '';
      noProductsElement.classList.add('hidden');
      
      // Get all products
      this.products = await API.getProducts();
      
      // Hide loading
      loadingElement.classList.add('hidden');
      
      if (this.products.length === 0) {
        // Show no products message
        noProductsElement.classList.remove('hidden');
      } else {
        // Render products
        this.renderProductsTable();
      }
    } catch (error) {
      console.error('Error loading products:', error);
      loadingElement.classList.add('hidden');
      Toast.error('Failed to load products. Please try again.');
    }
  },
  
  // Render products table
  renderProductsTable() {
    const tableBody = document.getElementById('product-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = this.products.map(product => `
      <tr>
        <td class="product-image-cell">
          <img src="${product.imageUrl}" alt="${product.name}">
        </td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>${formatCurrency(product.price)}</td>
        <td>${product.stock}</td>
        <td>
          <div class="product-actions-cell">
            <button class="action-btn edit-btn" data-id="${product.id}" title="Edit">
              <i class="fas fa-pencil"></i>
            </button>
            <button class="action-btn delete-btn" data-id="${product.id}" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    
    // Add event listeners to action buttons
    this.setupActionButtons();
  },
  
  // Setup edit and delete buttons
  setupActionButtons() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = parseInt(btn.dataset.id);
        this.editProduct(productId);
      });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = parseInt(btn.dataset.id);
        this.showDeleteConfirmation(productId);
      });
    });
  },
  
  // Show add product modal
  showAddProductModal() {
    // Reset form
    const productForm = document.getElementById('product-form');
    if (productForm) {
      productForm.reset();
    }
    
    // Clear hidden ID field
    const productIdField = document.getElementById('product-id');
    if (productIdField) {
      productIdField.value = '';
    }
    
    // Update modal title
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) {
      modalTitle.textContent = 'Add New Product';
    }
    
    // Update submit button text
    const submitButtonText = document.getElementById('submit-button-text');
    if (submitButtonText) {
      submitButtonText.textContent = 'Save Product';
    }
    
    // Clear current product
    this.currentProduct = null;
    
    // Show modal
    const modal = document.getElementById('product-modal');
    if (modal) {
      modal.classList.add('active');
    }
  },
  
  // Hide product modal
  hideProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  },
  
  // Edit product
  async editProduct(productId) {
    try {
      // Get product details
      const product = await API.getProduct(productId);
      if (!product) {
        Toast.error('Product not found');
        return;
      }
      
      // Store current product
      this.currentProduct = product;
      
      // Fill form with product data
      const form = document.getElementById('product-form');
      if (form) {
        // Set ID field
        const idField = document.getElementById('product-id');
        if (idField) {
          idField.value = product.id.toString();
        }
        
        // Set text fields
        form.elements.name.value = product.name;
        form.elements.description.value = product.description;
        form.elements.price.value = product.price;
        form.elements.stock.value = product.stock;
        form.elements.imageUrl.value = product.imageUrl;
        form.elements.category.value = product.category;
        
        // Set checkboxes
        form.elements.featured.checked = product.featured;
        form.elements.isNewArrival.checked = product.isNewArrival;
      }
      
      // Update modal title
      const modalTitle = document.getElementById('modal-title');
      if (modalTitle) {
        modalTitle.textContent = 'Edit Product';
      }
      
      // Update submit button text
      const submitButtonText = document.getElementById('submit-button-text');
      if (submitButtonText) {
        submitButtonText.textContent = 'Update Product';
      }
      
      // Show modal
      const modal = document.getElementById('product-modal');
      if (modal) {
        modal.classList.add('active');
      }
    } catch (error) {
      console.error('Error editing product:', error);
      Toast.error('Failed to load product details');
    }
  },
  
  // Show delete confirmation modal
  showDeleteConfirmation(productId) {
    // Get product
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      Toast.error('Product not found');
      return;
    }
    
    // Store current product
    this.currentProduct = product;
    
    // Set product name in confirmation text
    const productNameElement = document.getElementById('delete-product-name');
    if (productNameElement) {
      productNameElement.textContent = product.name;
    }
    
    // Show modal
    const modal = document.getElementById('delete-modal');
    if (modal) {
      modal.classList.add('active');
    }
  },
  
  // Hide delete modal
  hideDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  },
  
  // Delete product
  async deleteProduct() {
    if (!this.currentProduct) {
      Toast.error('No product selected for deletion');
      return;
    }
    
    const confirmBtn = document.getElementById('confirm-delete-btn');
    const btnText = confirmBtn.querySelector('.btn-text');
    const btnLoader = confirmBtn.querySelector('.btn-loader');
    
    try {
      // Show loading state
      confirmBtn.disabled = true;
      btnText.style.opacity = '0.5';
      btnLoader.classList.remove('hidden');
      
      // Delete product
      await API.deleteProduct(this.currentProduct.id);
      
      // Hide modal
      this.hideDeleteModal();
      
      // Reload products
      await this.loadProducts();
      
      Toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      Toast.error('Failed to delete product');
    } finally {
      // Reset button state
      confirmBtn.disabled = false;
      btnText.style.opacity = '1';
      btnLoader.classList.add('hidden');
    }
  },
  
  // Handle product form submission
  async handleProductSubmit(form) {
    // Get form data
    const formData = new FormData(form);
    const productData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      stock: parseInt(formData.get('stock')),
      imageUrl: formData.get('imageUrl'),
      category: formData.get('category'),
      featured: formData.get('featured') === 'on',
      isNewArrival: formData.get('isNewArrival') === 'on'
    };
    
    // Validate form data
    if (!this.validateProductData(productData)) {
      return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    try {
      // Show loading state
      submitBtn.disabled = true;
      btnText.style.opacity = '0.5';
      btnLoader.classList.remove('hidden');
      
      // Check if editing or adding
      const productId = formData.get('id');
      
      if (productId) {
        // Update existing product
        await API.updateProduct(parseInt(productId), productData);
        Toast.success('Product updated successfully');
      } else {
        // Create new product
        await API.createProduct(productData);
        Toast.success('Product added successfully');
      }
      
      // Hide modal
      this.hideProductModal();
      
      // Reload products
      await this.loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      Toast.error('Failed to save product');
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      btnText.style.opacity = '1';
      btnLoader.classList.add('hidden');
    }
  },
  
  // Validate product data
  validateProductData(data) {
    let isValid = true;
    
    // Clear previous error messages
    document.querySelectorAll('.error-message').forEach(el => {
      el.textContent = '';
    });
    
    // Validate name
    if (!data.name || data.name.trim() === '') {
      document.getElementById('product-name-error').textContent = 'Product name is required';
      isValid = false;
    }
    
    // Validate category
    if (!data.category) {
      document.getElementById('product-category-error').textContent = 'Category is required';
      isValid = false;
    }
    
    // Validate price
    if (isNaN(data.price) || data.price <= 0) {
      document.getElementById('product-price-error').textContent = 'Price must be a positive number';
      isValid = false;
    }
    
    // Validate stock
    if (isNaN(data.stock) || data.stock < 0) {
      document.getElementById('product-stock-error').textContent = 'Stock must be a non-negative number';
      isValid = false;
    }
    
    // Validate description
    if (!data.description || data.description.trim() === '') {
      document.getElementById('product-description-error').textContent = 'Description is required';
      isValid = false;
    }
    
    // Validate image URL
    if (!data.imageUrl || data.imageUrl.trim() === '') {
      document.getElementById('product-image-error').textContent = 'Image URL is required';
      isValid = false;
    } else {
      try {
        new URL(data.imageUrl);
      } catch (e) {
        document.getElementById('product-image-error').textContent = 'Invalid URL format';
        isValid = false;
      }
    }
    
    return isValid;
  }
};

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  Admin.init();
});