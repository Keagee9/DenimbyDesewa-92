// Authentication functionality for Denim by Desewa website

// Auth state management
const Auth = {
  user: null,
  
  // Initialize auth
  init() {
    this.setupTabSwitching();
    this.setupFormSubmissions();
    this.checkAuthStatus();
  },
  
  // Setup tab switching between login and register
  setupTabSwitching() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form-container');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Get the tab target
        const target = tab.dataset.tab;
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding form
        forms.forEach(form => {
          form.classList.remove('active');
          if (form.id === `${target}-form`) {
            form.classList.add('active');
          }
        });
      });
    });
  },
  
  // Setup login and registration form submissions
  setupFormSubmissions() {
    // Login form submission
    const loginForm = document.getElementById('login-form-element');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin(loginForm);
      });
    }
    
    // Register form submission
    const registerForm = document.getElementById('register-form-element');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegistration(registerForm);
      });
    }
  },
  
  // Check if user is already logged in
  async checkAuthStatus() {
    try {
      const user = await API.getCurrentUser();
      
      if (user) {
        this.user = user;
        
        // Redirect to home page or dashboard if already logged in
        if (user.isAdmin) {
          window.location.href = 'admin.html';
        } else {
          window.location.href = '/';
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  },
  
  // Handle login form submission
  async handleLogin(form) {
    // Reset error messages
    this.clearErrorMessages(form);
    
    // Get form data
    const username = form.elements.username.value;
    const password = form.elements.password.value;
    
    // Show loading state
    this.setFormLoading(form, true);
    
    try {
      const user = await API.login(username, password);
      
      if (user) {
        this.user = user;
        Toast.success('Login successful!');
        
        // Redirect based on user role
        setTimeout(() => {
          if (user.isAdmin) {
            window.location.href = 'admin.html';
          } else {
            window.location.href = '/';
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Show error message
      const usernameError = document.getElementById('login-username-error');
      if (usernameError) {
        usernameError.textContent = 'Invalid username or password';
      }
      
      Toast.error('Login failed. Please check your credentials.');
    } finally {
      this.setFormLoading(form, false);
    }
  },
  
  // Handle registration form submission
  async handleRegistration(form) {
    // Reset error messages
    this.clearErrorMessages(form);
    
    // Get form data
    const username = form.elements.username.value;
    const password = form.elements.password.value;
    const confirmPassword = form.elements.confirmPassword.value;
    
    // Validate password match
    if (password !== confirmPassword) {
      const confirmPasswordError = document.getElementById('register-confirm-password-error');
      if (confirmPasswordError) {
        confirmPasswordError.textContent = 'Passwords do not match';
      }
      return;
    }
    
    // Show loading state
    this.setFormLoading(form, true);
    
    try {
      const user = await API.register(username, password);
      
      if (user) {
        this.user = user;
        Toast.success('Registration successful!');
        
        // Redirect to home page
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Show error message
      const usernameError = document.getElementById('register-username-error');
      if (usernameError) {
        usernameError.textContent = 'Username already exists or registration failed';
      }
      
      Toast.error('Registration failed. Please try another username.');
    } finally {
      this.setFormLoading(form, false);
    }
  },
  
  // Clear error messages in a form
  clearErrorMessages(form) {
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(el => {
      el.textContent = '';
    });
  },
  
  // Set form loading state
  setFormLoading(form, isLoading) {
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (submitBtn) {
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoader = submitBtn.querySelector('.btn-loader');
      
      if (isLoading) {
        submitBtn.disabled = true;
        btnText.style.opacity = '0.5';
        btnLoader.classList.remove('hidden');
      } else {
        submitBtn.disabled = false;
        btnText.style.opacity = '1';
        btnLoader.classList.add('hidden');
      }
    }
  },
  
  // Logout user
  async logout() {
    try {
      await API.logout();
      this.user = null;
      
      // Redirect to home page
      window.location.href = '/';
      
      Toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      Toast.error('Failed to logout. Please try again.');
    }
  }
};

// Initialize auth functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});

// Make Auth available globally
window.Auth = Auth;