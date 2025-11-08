"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores";
import type { ReactNode } from "react";

interface ProtectedGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedGuard - Simple and working
 * Only redirects if user is not authenticated
 * NEVER redirects if user IS authenticated
 */
export function ProtectedGuard({ 
  children, 
  redirectTo = "/auth" 
}: ProtectedGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, initialize } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for Zustand to rehydrate
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      initialize();

      // No token = redirect to auth (only if not already there)
      if (!token && pathname && pathname !== redirectTo) {
        router.replace(redirectTo);
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, [token, router, pathname, redirectTo, initialize]);

  // If we have token, show children immediately (optimistic)
  // This allows refresh to work - user stays on same page
  if (token) {
    return <>{children}</>;
  }

  // Show nothing while checking (redirect happening)
  return null;
}
