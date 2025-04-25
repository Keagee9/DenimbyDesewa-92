// Main JavaScript for Denim by Desewa website

// Set current year in footer copyright
document.getElementById('current-year').textContent = new Date().getFullYear();

// Mobile menu toggle
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuToggle && mobileMenu) {
  mobileMenuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    
    // Change icon
    const icon = mobileMenuToggle.querySelector('i');
    if (icon) {
      if (mobileMenu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    }
  });
}

// Set active navigation links based on current page
const setActiveNavLinks = () => {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  
  const allLinks = [...navLinks, ...mobileNavLinks];
  
  allLinks.forEach(link => {
    link.classList.remove('active');
    
    const linkPath = link.getAttribute('href');
    
    if (currentPath === '/' && linkPath === '/') {
      link.classList.add('active');
    } else if (currentPath !== '/' && linkPath !== '/' && currentPath.includes(linkPath)) {
      link.classList.add('active');
    }
  });
};

// API functions
const API = {
  // Base URL for API requests
  baseUrl: '/api',
  
  // Fetch API wrapper with standard options
  async fetch(endpoint, options = {}) {
    const url = this.baseUrl + endpoint;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    };
    
    const fetchOptions = {
      ...defaultOptions,
      ...options
    };
    
    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized, user not logged in
          return null;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      
      // For 204 No Content responses
      if (response.status === 204) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },
  
  // Get all products or filtered products
  async getProducts(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    return this.fetch(endpoint);
  },
  
  // Get a specific product by ID
  async getProduct(id) {
    return this.fetch(`/products/${id}`);
  },
  
  // Get current user
  async getCurrentUser() {
    return this.fetch('/user').catch(() => null);
  },
  
  // Login user
  async login(username, password) {
    return this.fetch('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },
  
  // Register user
  async register(username, password) {
    return this.fetch('/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },
  
  // Logout user
  async logout() {
    return this.fetch('/logout', {
      method: 'POST'
    });
  },
  
  // Create a product (admin only)
  async createProduct(productData) {
    return this.fetch('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },
  
  // Update a product (admin only)
  async updateProduct(id, productData) {
    return this.fetch(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },
  
  // Delete a product (admin only)
  async deleteProduct(id) {
    return this.fetch(`/products/${id}`, {
      method: 'DELETE'
    });
  }
};

// Toast notification system
const Toast = {
  container: null,
  
  init() {
    // Create toast container if it doesn't exist
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
      
      // Add style for toast container
      const style = document.createElement('style');
      style.textContent = `
        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .toast {
          padding: 12px 16px;
          border-radius: 4px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-width: 300px;
          max-width: 400px;
          animation: toast-in 0.3s ease forwards;
        }
        
        .toast-success {
          background-color: #4caf50;
          color: white;
        }
        
        .toast-error {
          background-color: #f44336;
          color: white;
        }
        
        .toast-info {
          background-color: #2196f3;
          color: white;
        }
        
        .toast-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          margin-left: 10px;
          opacity: 0.8;
        }
        
        .toast-close:hover {
          opacity: 1;
        }
        
        @keyframes toast-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes toast-out {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  },
  
  show(message, type = 'info', duration = 3000) {
    this.init();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const content = document.createElement('div');
    content.className = 'toast-content';
    content.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => this.dismiss(toast);
    
    toast.appendChild(content);
    toast.appendChild(closeBtn);
    
    this.container.appendChild(toast);
    
    setTimeout(() => this.dismiss(toast), duration);
    
    return toast;
  },
  
  dismiss(toast) {
    toast.style.animation = 'toast-out 0.3s ease forwards';
    setTimeout(() => {
      if (toast.parentNode === this.container) {
        this.container.removeChild(toast);
      }
    }, 300);
  },
  
  success(message, duration) {
    return this.show(message, 'success', duration);
  },
  
  error(message, duration) {
    return this.show(message, 'error', duration);
  },
  
  info(message, duration) {
    return this.show(message, 'info', duration);
  }
};

// Initialize active nav links
document.addEventListener('DOMContentLoaded', () => {
  setActiveNavLinks();
});

// Format currency to Naira
function formatCurrency(amount) {
  return '₦' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Export to make available to other scripts
window.API = API;
window.Toast = Toast;
window.formatCurrency = formatCurrency;