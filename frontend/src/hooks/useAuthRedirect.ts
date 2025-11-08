"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { rolesService } from "@/services";

export function useAuthRedirect() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!isAuthenticated || !user) {
        router.push("/auth");
        return;
      }

      // Check if user has role with manage_app permission
      if (user.data.roleId) {
        try {
          const role = await rolesService.findOne(user.data.roleId);
          if (role?.data.permissions.includes("manage_app")) {
            router.push("/admin/overview");
          } else {
            router.push("/home/overview");
          }
        } catch (error) {
          // If role check fails, default to home dashboard
          router.push("/home/overview");
        }
      } else {
        // No role assigned, default to home dashboard
        router.push("/home/overview");
      }
    };

    if (isAuthenticated && user) {
      checkAndRedirect();
    }
  }, [isAuthenticated, user, router]);
}

