"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Database,
  ListTodo,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores";
import { rolesService } from "@/services";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Permission } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: Permission;
}

const userNavItems: NavItem[] = [
  { href: "/home/overview", label: "Overview", icon: LayoutDashboard, permission: "view_overview" },
  { href: "/home/datasets", label: "Datasets", icon: Database, permission: "read_datasets" },
  { href: "/home/tasks", label: "Tasks", icon: ListTodo, permission: "read_tasks" },
  { href: "/home/analysis", label: "Analysis", icon: BarChart3, permission: "read_analysis" },
];

export function UserSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      if (!user?.data.roleId) {
        setLoading(false);
        return;
      }

      try {
        const role = await rolesService.findOne(user.data.roleId);
        setUserPermissions(role?.data.permissions || []);
      } catch (error) {
        console.error("Failed to load user permissions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [user]);

  // Filter nav items based on user permissions
  const visibleNavItems = userNavItems.filter((item) => {
    // Always show overview if user has any permission
    if (item.permission === "view_overview") {
      return userPermissions.length > 0 || !user?.data.roleId;
    }
    return userPermissions.includes(item.permission);
  });

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">D</span>
        </div>
        <span className="font-semibold text-foreground">Dallosh Analysis</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : visibleNavItems.length === 0 ? (
          <div className="text-sm text-muted-foreground">No accessible pages</div>
        ) : (
          visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })
        )}
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.data.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">User</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.data.email || "user@example.com"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
