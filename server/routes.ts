import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertProductSchema } from "@shared/schema";

// Middleware to check if user is admin
const isAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Product routes
  app.get("/api/products", async (req, res) => {
    const category = req.query.category as string | undefined;
    const featured = req.query.featured === "true";
    const newArrivals = req.query.newArrivals === "true";
    
    const products = await storage.getProducts({ category, featured, newArrivals });
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const productId = parseInt(req.params.id);
    const product = await storage.getProduct(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  });

  // Admin product management routes
  app.post("/api/products", isAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(productData);
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });

  app.put("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const productData = insertProductSchema.parse(req.body);
      
      const updatedProduct = await storage.updateProduct(productId, productData);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });

  app.delete("/api/products/:id", isAdmin, async (req, res) => {
    const productId = parseInt(req.params.id);
    const success = await storage.deleteProduct(productId);
    
    if (!success) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.status(204).send();
  });

  // Create admin user if it doesn't exist (during first run)
  const adminUser = await storage.getUserByUsername("admin");
  if (!adminUser) {
    await storage.createAdminUser({
      username: "admin",
      password: "admin123", // This would be hashed in auth.ts
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
