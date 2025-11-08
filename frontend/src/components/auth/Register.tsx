"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export function Register() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await register(email, password);
      
      // Wait a bit for the state to be persisted and updated
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Get user and check role for redirect
      const user = useAuthStore.getState().user;
      if (user?.data.roleId) {
        try {
          const { rolesService } = await import("@/services");
          const role = await rolesService.findOne(user.data.roleId);
          if (role?.data.permissions.includes("manage_app")) {
            // Use window.location for a hard redirect to ensure it works
            window.location.href = "/admin/overview";
          } else {
            window.location.href = "/home/overview";
          }
        } catch {
          window.location.href = "/home/overview";
        }
      } else {
        window.location.href = "/home/overview";
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="register-email" className="text-sm font-medium text-foreground">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            id="register-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-11 border-border/50 focus:border-primary focus:ring-primary"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password" className="text-sm font-medium text-foreground">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-11 border-border/50 focus:border-primary focus:ring-primary"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10 pr-10 h-11 border-border/50 focus:border-primary focus:ring-primary"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" 
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create Account"}
      </Button>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full h-11 border-border/50 hover:bg-muted font-medium"
        >
          <span className="mr-2 font-bold text-lg">G</span>
          Google
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full h-11 border-border/50 hover:bg-muted font-medium"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.628h11.377V24H0zm12.623 0H24V24H12.623z"/>
          </svg>
          Microsoft
        </Button>
      </div>
    </form>
  );
}

