import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

// Extend schema with validation rules
const loginSchema = insertUserSchema.extend({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  // Submit login form
  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate({
      username: values.username,
      password: values.password,
    });
  };
  
  // Submit register form
  const onRegisterSubmit = (values: RegisterValues) => {
    const { confirmPassword, ...userData } = values;
    registerMutation.mutate(userData);
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-center justify-center">
          {/* Form */}
          <div className="w-full max-w-md">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Login to Your Account</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-username">Username</Label>
                        <Input
                          id="login-username"
                          type="text"
                          placeholder="Enter your username"
                          {...loginForm.register("username")}
                        />
                        {loginForm.formState.errors.username && (
                          <p className="text-sm text-red-500">
                            {loginForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          {...loginForm.register("password")}
                        />
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-500">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-secondary"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Login
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>
                      Register to start shopping with us
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-username">Username</Label>
                        <Input
                          id="register-username"
                          type="text"
                          placeholder="Choose a username"
                          {...registerForm.register("username")}
                        />
                        {registerForm.formState.errors.username && (
                          <p className="text-sm text-red-500">
                            {registerForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="Create a password"
                          {...registerForm.register("password")}
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-500">
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-confirm-password">Confirm Password</Label>
                        <Input
                          id="register-confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          {...registerForm.register("confirmPassword")}
                        />
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-500">
                            {registerForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-secondary"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Register
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Hero Section */}
          <div className="w-full max-w-md lg:max-w-lg">
            <div className="bg-primary text-white rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-4">Denim by Desewa</h2>
              <p className="mb-6">
                Join our community of fashion enthusiasts and explore our premium collection of denim products.
                Login or register to unlock exclusive features and manage your shopping experience.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Easy Shopping</h3>
                    <p className="text-sm text-white/80">Browse and purchase our products with ease</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Order Tracking</h3>
                    <p className="text-sm text-white/80">Track your orders and view order history</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Exclusive Deals</h3>
                    <p className="text-sm text-white/80">Get access to member-only discounts and promotions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
