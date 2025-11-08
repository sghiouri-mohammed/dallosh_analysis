"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores";
import { rolesService } from "@/services";
import type { ReactNode } from "react";
import type { Permission } from "@/types";

interface RoleGuardProps {
  children: ReactNode;
  permissions: Permission | Permission[];
  redirectTo?: string;
  fallback?: ReactNode;
  requireAll?: boolean;
}

/**
 * RoleGuard - Simple and working
 * Only redirects if user doesn't have required permissions
 * Allows refresh to stay on same page
 */
export function RoleGuard({ 
  children, 
  permissions,
  redirectTo = "/home/overview",
  fallback,
  requireAll = false
}: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, initialize } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkPermissions = async () => {
      initialize();

      // No token = not authenticated
      if (!token) {
        if (mounted && pathname !== "/auth") {
          router.replace("/auth");
        }
        return;
      }

      // No user = not authenticated
      if (!user) {
        if (mounted && pathname !== "/auth") {
          router.replace("/auth");
        }
        return;
      }

      // No role = no permissions
      if (!user.data.roleId) {
        if (mounted && pathname !== redirectTo) {
          router.replace(redirectTo);
        }
        return;
      }

      // Check permissions
      try {
        const role = await rolesService.findOne(user.data.roleId);
        if (!role) {
          if (mounted && pathname !== redirectTo) {
            router.replace(redirectTo);
          }
          return;
        }

        const userPermissions = role.data.permissions;
        const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

        let hasRequired: boolean;
        if (requireAll) {
          hasRequired = requiredPermissions.every(perm => userPermissions.includes(perm));
        } else {
          hasRequired = requiredPermissions.some(perm => userPermissions.includes(perm));
        }

        if (mounted) {
          if (!hasRequired && pathname !== redirectTo) {
            router.replace(redirectTo);
          } else {
            setIsAuthorized(hasRequired);
          }
        }
      } catch (error) {
        console.error("Failed to check permissions:", error);
        if (mounted && pathname !== redirectTo) {
          router.replace(redirectTo);
        }
      }
    };

    checkPermissions();

    return () => {
      mounted = false;
    };
  }, [token, user, router, pathname, redirectTo, initialize, permissions, requireAll]);

  // Show children immediately if we have token and user (optimistic)
  // The redirect will happen in background if check fails
  if (token && user) {
    return <>{children}</>;
  }

  // Show fallback or nothing while checking
  return fallback ? <>{fallback}</> : null;
}
