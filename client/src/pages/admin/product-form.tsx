import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProductSchema, Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Add validation rules to product schema
const productFormSchema = insertProductSchema.extend({
  price: z.coerce.number().positive("Price must be a positive number"),
  stock: z.coerce.number().int().min(0, "Stock must be a positive number"),
  // For the form, we'll handle image URLs differently
  imageUrl: z.string().url("Please enter a valid image URL")
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function ProductForm() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditMode = id !== "new";
  
  // Fetch product details if editing
  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    enabled: isEditMode,
  });
  
  // Define form with zod validation
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      category: "",
      stock: 0,
      featured: false,
      isNewArrival: false,
    }
  });
  
  // Update form values when product data is fetched
  useEffect(() => {
    if (product && isEditMode) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        stock: product.stock,
        featured: product.featured,
        isNewArrival: product.isNewArrival,
      });
    }
  }, [product, form, isEditMode]);
  
  // Create product mutation
  const createMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product created",
        description: "The product has been created successfully.",
      });
      navigate("/admin/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create product: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const response = await apiRequest("PUT", `/api/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
      });
      navigate("/admin/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update product: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: ProductFormValues) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };
  
  if (productLoading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-6">
          {isEditMode ? "Edit Product" : "Add New Product"}
        </h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Jackets">Jackets</SelectItem>
                        <SelectItem value="Jeans">Jeans</SelectItem>
                        <SelectItem value="Shirts">Shirts</SelectItem>
                        <SelectItem value="Skirts">Skirts</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)*</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        placeholder="0.00" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity*</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="0" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description*</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter product description" 
                      className="min-h-[120px]" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Image URL*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter image URL" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a valid URL to an image (e.g., https://example.com/image.jpg)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured Product</FormLabel>
                      <FormDescription>
                        Display this product in featured sections
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isNewArrival"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>New Arrival</FormLabel>
                      <FormDescription>
                        Mark this product as a new arrival
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/dashboard")}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-primary hover:bg-secondary"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? "Update Product" : "Save Product"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
