import { 
  User, 
  InsertUser, 
  Product, 
  InsertProduct, 
  products as productsSchema 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Product filter interface
interface ProductFilters {
  category?: string;
  featured?: boolean;
  newArrivals?: boolean;
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAdminUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProducts(filters?: ProductFilters): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  sessionStore: session.SessionStore;
  private currentUserId: number;
  private currentProductId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with sample products
    this.initializeProducts();
  }

  private initializeProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Premium Denim Jacket",
        description: "High-quality denim jacket with stylish detailing and comfortable fit.",
        price: 79.99,
        imageUrl: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28",
        category: "Jackets",
        stock: 25,
        featured: true,
        isNewArrival: true
      },
      {
        name: "Classic Denim Jeans",
        description: "Timeless denim jeans with perfect fit and durable material.",
        price: 59.99,
        imageUrl: "https://images.unsplash.com/photo-1604176354204-9268737828e4",
        category: "Jeans",
        stock: 32,
        featured: true,
        isNewArrival: true
      },
      {
        name: "Denim Shirt",
        description: "Versatile denim shirt suitable for any casual occasion.",
        price: 44.99,
        imageUrl: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d",
        category: "Shirts",
        stock: 18,
        featured: false,
        isNewArrival: true
      },
      {
        name: "Denim Skirt",
        description: "Stylish denim skirt perfect for summer outings.",
        price: 39.99,
        imageUrl: "https://images.unsplash.com/photo-1582418702059-97ebafb35d09",
        category: "Skirts",
        stock: 15,
        featured: false,
        isNewArrival: true
      },
      {
        name: "Denim Cap",
        description: "Comfortable and stylish denim cap for casual wear.",
        price: 24.99,
        imageUrl: "https://images.unsplash.com/photo-1555689502-c4b22d76c56f",
        category: "Accessories",
        stock: 40,
        featured: false,
        isNewArrival: false
      },
      {
        name: "Denim Tote Bag",
        description: "Spacious and durable denim tote bag for everyday use.",
        price: 34.99,
        imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c",
        category: "Accessories",
        stock: 22,
        featured: false,
        isNewArrival: false
      }
    ];

    // Add sample products to storage
    sampleProducts.forEach(product => {
      this.createProduct(product);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }

  async createAdminUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, isAdmin: true };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    let filteredProducts = Array.from(this.products.values());
    
    if (filters.category) {
      filteredProducts = filteredProducts.filter(
        product => product.category.toLowerCase() === filters.category?.toLowerCase()
      );
    }
    
    if (filters.featured) {
      filteredProducts = filteredProducts.filter(product => product.featured);
    }
    
    if (filters.newArrivals) {
      filteredProducts = filteredProducts.filter(product => product.isNewArrival);
    }
    
    return filteredProducts;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updateData: InsertProduct): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    
    if (!existingProduct) {
      return undefined;
    }
    
    const updatedProduct: Product = { ...updateData, id };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
}

export const storage = new MemStorage();
