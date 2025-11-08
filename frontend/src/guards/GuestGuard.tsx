"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores";
import { rolesService } from "@/services";
import type { ReactNode } from "react";

interface GuestGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * GuestGuard - Simple and working
 * Redirects authenticated users away from guest pages
 * Allows refresh to stay on same page
 */
export function GuestGuard({ 
  children, 
  redirectTo 
}: GuestGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, initialize } = useAuthStore();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAndRedirect = async () => {
      initialize();

      // If authenticated, redirect to appropriate dashboard
      if (token && user) {
        if (!redirectTo) {
          // Determine dashboard based on role
          let targetPath = "/home/overview";
          
          if (user.data.roleId) {
            try {
              const role = await rolesService.findOne(user.data.roleId);
              const hasAdmin = role?.data.permissions.includes("manage_app") ?? false;
              targetPath = hasAdmin ? "/admin/overview" : "/home/overview";
            } catch {
              targetPath = "/home/overview";
            }
          }

          if (mounted && pathname !== targetPath) {
            router.replace(targetPath);
            setShouldRedirect(true);
          }
        } else {
          if (mounted && pathname !== redirectTo) {
            router.replace(redirectTo);
            setShouldRedirect(true);
          }
        }
      }
    };

    checkAndRedirect();

    return () => {
      mounted = false;
    };
  }, [token, user, router, pathname, redirectTo, initialize]);

  // If redirecting, show nothing
  if (shouldRedirect || (token && user)) {
    return null;
  }

  // Show children for guest users
  return <>{children}</>;
}
