/**
 * Admin Panel Functionality for Denim by Desewa
 * Uses localStorage for product data persistence (client-side only).
 * This version focuses on ensuring Add/Edit/Delete actions save correctly
 * and the product table reflects the changes immediately.
 * Assumes direct admin access (no login prompt).
 *
 * REQUIRED HTML: Ensure all element IDs used here match your admin.html.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log("[DOM] Content Loaded. Initializing Admin Script...");

  // --- Constants ---
  const LOCALSTORAGE_PRODUCTS_KEY = 'denimByDesewaAdminProducts'; // Key for localStorage

  // --- Mock API using LocalStorage (Simulates Backend) ---
  const API = {
      _generateId: () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
      async getProducts() { /* ... (Same as your provided code - handles localStorage reading) ... */
          try { const d=localStorage.getItem(LOCALSTORAGE_PRODUCTS_KEY); return d?JSON.parse(d):[]; } catch(e){console.error("[API] E:",e);return [];}
      },
      async getProduct(id) { /* ... (Same as your provided code - finds product by ID) ... */
          const p=await this.getProducts(); return p.find(i=>String(i.id)===String(id))||null;
      },
      async createProduct(data) { /* ... (Same as your provided code - adds product to localStorage) ... */
          console.log("[API] Create:", data); const p=await this.getProducts(); const n={...data,id:this._generateId()}; p.push(n); try {localStorage.setItem(LOCALSTORAGE_PRODUCTS_KEY,JSON.stringify(p));return n;} catch(e){console.error("[API] E:",e);throw new Error("Save failed.");}
      },
      async updateProduct(id, data) { /* ... (Same as your provided code - updates product in localStorage) ... */
           console.log(`[API] Update ${id}:`, data); let p=await this.getProducts(); const idx=p.findIndex(i=>String(i.id)===String(id)); if(idx===-1)throw new Error("Not found."); p[idx]={...p[idx], ...data}; try {localStorage.setItem(LOCALSTORAGE_PRODUCTS_KEY,JSON.stringify(p));return p[idx];} catch(e){console.error("[API] E:",e);throw new Error("Update failed.");}
      },
      async deleteProduct(id) { /* ... (Same as your provided code - removes product from localStorage) ... */
          console.log("[API] Delete:", id); let p=await this.getProducts(); p=p.filter(i=>String(i.id)!==String(id)); try {localStorage.setItem(LOCALSTORAGE_PRODUCTS_KEY,JSON.stringify(p));return!0;} catch(e){console.error("[API] E:",e);throw new Error("Delete failed.");}
      }
  };

  // --- Placeholders (Ensure these are available or replaced) ---
  const Toast = {
      success: (message) => { console.log("✔️ SUCCESS:", message); /* e.g., Show a success popup */ },
      error: (message) => { console.error("❌ ERROR:", message); /* e.g., Show an error popup */ },
  };
  function formatCurrency(amount) {
      return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(amount || 0);
  }

  // --- Admin Panel Logic ---
  const Admin = {
      products: [], // Local cache of products, updated by loadProducts
      currentProduct: null, // Holds product being edited/deleted

      // Initialize: Setup listeners and load initial data
      init() {
          console.log("[Admin] Initializing...");
          if (!this.verifyElementsExist()) { // Verify crucial HTML elements before proceeding
              return;
          }
          this.setupEventListeners();
          this.loadProducts(); // Load products from localStorage on page load
      },

      // Helper to check if essential HTML elements are present
      verifyElementsExist() {
           const requiredIds = ['product-form', 'product-table-body', 'product-modal', 'delete-modal', 'add-product-btn', 'loading-products', 'no-products'];
           let allExist = true;
           requiredIds.forEach(id => {
               if (!document.getElementById(id)) {
                   console.error(`CRITICAL ERROR: HTML Element with ID '${id}' not found! Admin panel cannot function correctly.`);
                   allExist = false;
               }
           });
           if (!allExist) {
               Toast.error("Admin page elements missing. Please check HTML structure.");
           }
           return allExist;
      },


      // Setup all necessary event listeners
      setupEventListeners() {
          console.log("[Setup] Setting up event listeners...");

          const addProductBtn = document.getElementById('add-product-btn');
          const addFirstProductBtn = document.getElementById('add-first-product-btn');
          const productForm = document.getElementById('product-form');
          const imageInput = document.getElementById('product-image');
          const tableBody = document.getElementById('product-table-body');
          const productModal = document.getElementById('product-modal');
          const deleteModal = document.getElementById('delete-modal');

          // Add buttons
          if (addProductBtn) addProductBtn.addEventListener('click', () => this.showAddProductModal());
          if (addFirstProductBtn) addFirstProductBtn.addEventListener('click', () => this.showAddProductModal());

          // Form submission
          productForm.addEventListener('submit', (e) => {
              e.preventDefault();
              this.handleProductSubmit(productForm);
          });

          // Image preview
          if (imageInput) imageInput.addEventListener('change', this.handleImagePreview.bind(this));

          // Modal interactions (close/cancel/confirm) using delegation
          productModal.addEventListener('click', (e) => {
              if (e.target.matches('.modal-close, .modal-close i, #cancel-product-btn') || (e.target.classList.contains('modal-overlay') && e.target === productModal.querySelector('.modal-overlay'))) {
                  this.hideProductModal();
              }
          });
          deleteModal.addEventListener('click', (e) => {
              if (e.target.matches('.modal-close, .modal-close i, #cancel-delete-btn') || (e.target.classList.contains('modal-overlay') && e.target === deleteModal.querySelector('.modal-overlay'))) {
                  this.hideDeleteModal();
              } else if (e.target.closest('#confirm-delete-btn')) { // Handle click on button or children
                  this.deleteProduct();
              }
          });

          // Table actions (Edit/Delete) - Event Delegation on table body
          tableBody.addEventListener('click', (e) => {
              const editButton = e.target.closest('.edit-btn');
              const deleteButton = e.target.closest('.delete-btn');
              if (editButton) {
                  const productId = editButton.dataset.id;
                  if (productId) this.editProduct(productId);
                  else console.error("Edit button missing data-id.");
              } else if (deleteButton) {
                  const productId = deleteButton.dataset.id;
                  if (productId) this.showDeleteConfirmation(productId);
                  else console.error("Delete button missing data-id.");
              }
          });

          console.log("[Setup] Event listeners attached.");
      },

      // Load products from API (localStorage) and update the table
      async loadProducts() {
          console.log("[Data] Loading products...");
          const tableBody = document.getElementById('product-table-body');
          const loadingElement = document.getElementById('loading-products');
          const noProductsElement = document.getElementById('no-products');
          const addProductBtn = document.getElementById('add-product-btn');
          const addFirstProductBtn = document.getElementById('add-first-product-btn');

          loadingElement.classList.remove('hidden');
          tableBody.innerHTML = '';
          noProductsElement.classList.add('hidden');

          try {
              // Fetch data using the mock API
              this.products = await API.getProducts();
              console.log(`[Data] ${this.products.length} products loaded.`);
              this.renderProductsTable(); // Render the fetched data

              // Toggle "Add" button visibility based on whether products exist
               const hasProducts = this.products.length > 0;
               noProductsElement.classList.toggle('hidden', hasProducts);
               if (addProductBtn) addProductBtn.style.display = hasProducts ? 'inline-block' : 'none';
               if (addFirstProductBtn) addFirstProductBtn.style.display = hasProducts ? 'none' : 'inline-block';

          } catch (error) {
              console.error('[Data] Error loading products:', error);
              Toast.error('Failed to load products.');
              noProductsElement.textContent = 'Error loading products.';
              noProductsElement.classList.remove('hidden');
          } finally {
              loadingElement.classList.add('hidden'); // Hide loading indicator regardless of outcome
          }
      },

      // Render the product data into the HTML table
      renderProductsTable() {
          console.log("[UI] Rendering products table...");
          const tableBody = document.getElementById('product-table-body');

          if (this.products.length === 0) {
              // Handled by loadProducts showing the 'noProductsElement'
              tableBody.innerHTML = ''; // Ensure table is empty
              return;
          }

          // Create table rows from product data
          tableBody.innerHTML = this.products.map(product => `
            <tr data-product-id="${product.id}">
              <td class="product-image-cell">
                <img src="${product.imageUrl || 'image/placeholder.png'}" alt="${product.name || ''}" onerror="this.onerror=null;this.src='image/placeholder.png';">
              </td>
              <td>${product.name || 'N/A'}</td>
              <td>${product.category || 'N/A'}</td>
              <td>${formatCurrency(product.price)}</td>
              <td>${product.stock ?? 'N/A'}</td>
              <td>
                <div class="product-actions-cell">
                  <button class="action-btn edit-btn" data-id="${product.id}" title="Edit" aria-label="Edit ${product.name || ''}">
                    <i class="fas fa-pencil" aria-hidden="true"></i>
                  </button>
                  <button class="action-btn delete-btn" data-id="${product.id}" title="Delete" aria-label="Delete ${product.name || ''}">
                    <i class="fas fa-trash" aria-hidden="true"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('');
          console.log("[UI] Table rendered.");
      },

      // --- Modal Display ---
      showAddProductModal() { /* ... (Same as your provided code - resets form, sets title/button text, shows modal) ... */
          console.log("[Modal] Showing Add Product modal..."); this.currentProduct=null; const f=document.getElementById('product-form'), pI=document.getElementById('image-preview'), pId=document.getElementById('product-id'), mT=document.getElementById('modal-title'), sBT=document.getElementById('submit-button-text'), m=document.getElementById('product-modal'); if(!m||!f)return; f.reset(); if(pId)pId.value=''; if(mT)mT.textContent='Add New Product'; if(sBT)sBT.textContent='Save Product'; if(pI){pI.src='#';pI.classList.add('hidden');} m.querySelectorAll('.error-message').forEach(el=>el.textContent=''); m.classList.add('active');
      },
      hideProductModal() { /* ... (Same as your provided code - hides modal, resets form/preview) ... */
          console.log("[Modal] Hiding product modal."); const m=document.getElementById('product-modal'); if(m){m.classList.remove('active'); const f=document.getElementById('product-form'); if(f)f.reset(); const pI=document.getElementById('image-preview'); if(pI){pI.src='#';pI.classList.add('hidden');} m.querySelectorAll('.error-message').forEach(el=>el.textContent='');}
      },
      async editProduct(productId) { /* ... (Same as your provided code - fetches product, populates form/preview, shows modal) ... */
          console.log(`[Modal] Opening edit modal for ID: ${productId}`); const m=document.getElementById('product-modal'), f=document.getElementById('product-form'), pI=document.getElementById('image-preview'), mT=document.getElementById('modal-title'), sBT=document.getElementById('submit-button-text'); if(!m||!f)return; m.querySelectorAll('.error-message').forEach(el=>el.textContent=''); try{const p=await API.getProduct(productId); if(!p){Toast.error('Not found');return;} this.currentProduct=p; document.getElementById('product-id').value=p.id; f.elements.name.value=p.name||''; f.elements.description.value=p.description||''; f.elements.price.value=p.price||0; f.elements.stock.value=p.stock??0; f.elements.category.value=p.category||''; f.elements.featured.checked=p.featured||!1; f.elements.isNewArrival.checked=p.isNewArrival||!1; if(pI){if(p.imageUrl){pI.src=p.imageUrl;pI.classList.remove('hidden');}else{pI.src='#';pI.classList.add('hidden');}} if(mT)mT.textContent='Edit Product'; if(sBT)sBT.textContent='Update Product'; m.classList.add('active');} catch(e){console.error(e);Toast.error('Load failed.');}
      },
      showDeleteConfirmation(productId) { /* ... (Same as your provided code - finds product, sets name, shows modal) ... */
          console.log(`[Modal] Showing delete confirmation for ID: ${productId}`); const m=document.getElementById('delete-modal'), pNE=document.getElementById('delete-product-name'); if(!m||!pNE)return; const p=this.products.find(i=>String(i.id)===String(productId)); if(!p){this.currentProduct={id:productId};pNE.textContent='this product';}else{this.currentProduct=p;pNE.textContent=`"${p.name}"`;} m.classList.add('active');
      },
      hideDeleteModal() { /* ... (Same as your provided code - hides modal, clears currentProduct) ... */
          console.log("[Modal] Hiding delete modal."); const m=document.getElementById('delete-modal'); if(m)m.classList.remove('active'); this.currentProduct=null;
      },

      // --- Image Handling ---
      handleImagePreview(e) { /* ... (Same as your provided code - reads file, shows preview) ... */
           const i=e.target, p=document.getElementById('image-preview'), f=i.files[0]; if(f&&p){if(!f.type.startsWith('image/')){Toast.error('Invalid type');i.value='';p.src='#';p.classList.add('hidden');return;} if(f.size>5*1024*1024){Toast.error('Too large');i.value='';p.src='#';p.classList.add('hidden');return;} const r=new FileReader();r.onload=ev=>{p.src=ev.target.result;p.classList.remove('hidden');};r.onerror=er=>{console.error(er);Toast.error("Read fail");p.classList.add('hidden');};r.readAsDataURL(f);}else if(p){p.src='#';p.classList.add('hidden');}
      },
      readFileAsDataURL(file) { /* ... (Same as your provided code - converts file to Base64 promise) ... */
          return new Promise((res, rej)=>{if(!file)return rej(new Error("No file"));if(!file.type.startsWith('image/'))return rej(new Error('Invalid type')); if(file.size>5*1024*1024)return rej(new Error('>5MB')); const r=new FileReader();r.onload=e=>res(e.target.result); r.onerror=e=>{console.error(e);rej(new Error("Read fail"));}; r.readAsDataURL(file);});
      },

      // --- Core Actions: Submit & Delete ---
      // Handle form submission for ADDING or UPDATING a product
      async handleProductSubmit(form) {
          console.log("[Action] Handling product form submission...");
          const formData = new FormData(form);
          const imageFile = form.elements['product-image']?.files[0];
          const productId = formData.get('id');
          const isEditing = !!productId;

          form.querySelectorAll('.error-message').forEach(el => el.textContent = ''); // Clear errors

          // Process image (get Base64 or keep existing)
          let imageBase64Url = null;
          try {
              if (imageFile) { imageBase64Url = await this.readFileAsDataURL(imageFile); }
              else if (isEditing && this.currentProduct?.imageUrl) { imageBase64Url = this.currentProduct.imageUrl; }
          } catch (error) {
              document.getElementById('product-image-error').textContent = error.message || 'Failed to process image.';
              return;
          }

          // Prepare data object
          const productData = {
              name: formData.get('name')?.trim() || '', description: formData.get('description')?.trim() || '',
              price: parseFloat(formData.get('price')) || 0, stock: parseInt(formData.get('stock')) ?? 0,
              imageUrl: imageBase64Url, category: formData.get('category') || '',
              featured: form.elements.featured.checked, isNewArrival: form.elements.isNewArrival.checked
          };

          // Validate
          if (!this.validateProductData(productData, isEditing)) {
              Toast.error("Please check the form for errors."); return;
          }

          // Setup button loading state
          const submitBtn = form.querySelector('button[type="submit"]');
          const btnText = submitBtn?.querySelector('.btn-text');
          const btnLoader = submitBtn?.querySelector('.btn-loader');
          const originalButtonText = btnText?.textContent || (isEditing ? 'Update Product' : 'Save Product');
          const setButtonLoading = (isLoading) => {
              if (!submitBtn) return; submitBtn.disabled = isLoading;
              if (btnText) btnText.textContent = isLoading ? 'Saving...' : originalButtonText;
              if (btnLoader) btnLoader.classList.toggle('hidden', !isLoading);
          };

          setButtonLoading(true); // Show loading
          try {
              // Call API to save data
              if (isEditing) {
                  await API.updateProduct(productId, productData);
                  Toast.success('Product updated successfully!');
              } else {
                  await API.createProduct(productData);
                  Toast.success('Product added successfully!');
              }
              this.hideProductModal();    // <-- Close modal on success
              await this.loadProducts(); // <-- Reload products to REFRESH table
          } catch (error) {
              console.error('[Action] Error saving product:', error);
              Toast.error(error.message || 'Failed to save product.');
          } finally {
              setButtonLoading(false); // Hide loading
          }
      },

      // Validate the product data object before saving
      validateProductData(data, isEditing) { /* ... (Same as your provided code - checks required fields, image on add) ... */
          let ok=true; const setE=(id,msg)=>{const el=document.getElementById(`${id}-error`);if(el)el.textContent=msg; else console.error(`No #${id}-error`); ok=false;}; if(!data.name)setE('product-name','Req'); if(!data.category)setE('product-category','Req'); if(isNaN(data.price)||data.price<=0)setE('product-price','>0 Num'); if(isNaN(data.stock)||data.stock<0||!Number.isInteger(data.stock))setE('product-stock','>=0 Int'); if(!data.description)setE('product-description','Req'); if(!isEditing&&!data.imageUrl)setE('product-image','Req'); return ok;
      },

      // Delete the currently selected product
      async deleteProduct() {
          if (!this.currentProduct || !this.currentProduct.id) {
              Toast.error('No product selected for deletion.');
              this.hideDeleteModal(); return;
          }
          const productId = this.currentProduct.id;
          console.log(`[Action] Deleting product ID: ${productId}`);

          // Setup button loading state
          const confirmBtn = document.getElementById('confirm-delete-btn');
          const btnText = confirmBtn?.querySelector('.btn-text');
          const btnLoader = confirmBtn?.querySelector('.btn-loader');
          const setButtonLoading = (isLoading) => {
              if (!confirmBtn) return; confirmBtn.disabled = isLoading;
              if (btnText) btnText.textContent = isLoading ? 'Deleting...' : 'Delete';
              if (btnLoader) btnLoader.classList.toggle('hidden', !isLoading);
          };

          setButtonLoading(true); // Show loading
          try {
              // Call API to delete data
              await API.deleteProduct(productId);
              Toast.success('Product deleted successfully.');
              this.hideDeleteModal();      // <-- Close modal on success
              await this.loadProducts();   // <-- Reload products to REFRESH table
          } catch (error) {
              console.error('[Action] Error deleting product:', error);
              Toast.error(error.message || 'Failed to delete product.');
          } finally {
              setButtonLoading(false); // Hide loading
          }
      }

  }; // --- End Admin Object ---

  // --- Initialize the Admin Panel ---
  Admin.init(); // Start the application

}); // --- End DOMContentLoaded ---