import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Redirect to product form for adding new product
  const handleAddProduct = () => {
    navigate("/admin/product/new");
  };
  
  // Redirect to product form for editing product
  const handleEditProduct = (productId: number) => {
    navigate(`/admin/product/${productId}`);
  };
  
  // Fetch all products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully.",
      });
      setProductToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Confirm product deletion
  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/");
  };
  
  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-6">You don't have permission to access this page.</p>
          <Button onClick={() => navigate("/")}>Return to Homepage</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-neutral-100 min-h-screen">
      <header className="bg-secondary text-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Denim by Desewa - Admin Dashboard</h1>
          <Button 
            variant="outline" 
            className="bg-white text-secondary hover:bg-neutral-200"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Product Management</h2>
            <Button 
              className="bg-primary hover:bg-secondary text-white"
              onClick={handleAddProduct}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Product
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-neutral-500 mb-4">Add your first product to get started</p>
              <Button 
                className="bg-primary hover:bg-secondary text-white"
                onClick={handleAddProduct}
              >
                <Plus className="mr-2 h-4 w-4" /> Add New Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>List of all products in your store</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex space-x-2 justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditProduct(product.id)}
                            className="text-primary hover:text-secondary"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setProductToDelete(product)}
                            className="text-error hover:text-error/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product 
              "{productToDelete?.name}" from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-error hover:bg-error/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
