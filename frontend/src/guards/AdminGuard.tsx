"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores";
import { rolesService } from "@/services";
import type { ReactNode } from "react";

interface AdminGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * AdminGuard - Simple and working
 * Only redirects if user doesn't have admin role
 * NEVER redirects if user IS admin and IS on admin page
 */
export function AdminGuard({ 
  children, 
  redirectTo = "/home/overview"
}: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, initialize } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      // Wait for Zustand to rehydrate
      await new Promise(resolve => setTimeout(resolve, 50));
      
      initialize();

      // No token = redirect to auth (only if not already there)
      if (!token) {
        if (mounted && pathname && !pathname.startsWith("/auth")) {
          router.replace("/auth");
        }
        if (mounted) setIsChecking(false);
        return;
      }

      // No user = redirect to auth (only if not already there)
      if (!user) {
        if (mounted && pathname && !pathname.startsWith("/auth")) {
          router.replace("/auth");
        }
        if (mounted) setIsChecking(false);
        return;
      }

      // If we're on an admin page, check if user is admin
      if (pathname?.startsWith("/admin")) {
        // No role = not admin, redirect
        if (!user.data.roleId) {
          if (mounted) {
            router.replace(redirectTo);
            setIsChecking(false);
          }
          return;
        }

        // Check admin permission
        try {
          const role = await rolesService.findOne(user.data.roleId);
          const hasAdmin = role?.data.permissions.includes("manage_app") ?? false;

          if (mounted) {
            if (!hasAdmin) {
              // User is NOT admin, redirect away from admin pages
              router.replace(redirectTo);
            }
            // If user IS admin, do NOT redirect - let them stay on current page
            setIsChecking(false);
          }
        } catch (error) {
          console.error("Failed to check admin role:", error);
          if (mounted) {
            router.replace(redirectTo);
            setIsChecking(false);
          }
        }
      } else {
        // Not on admin page, no need to check
        if (mounted) setIsChecking(false);
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [token, user, router, pathname, redirectTo, initialize]);

  // If we have token and user, show children immediately (optimistic)
  // This allows refresh to work - user stays on same page
  if (token && user) {
    return <>{children}</>;
  }

  // Show nothing while checking (redirect happening)
  return null;
}
