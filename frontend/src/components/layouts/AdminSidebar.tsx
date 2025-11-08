"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Database,
  ListTodo,
  BarChart3,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const adminNavItems = [
  { href: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/datasets", label: "Datasets", icon: Database },
  { href: "/admin/tasks", label: "Tasks", icon: ListTodo },
  { href: "/admin/analysis", label: "Analysis", icon: BarChart3 },
  { href: "/admin/logs", label: "Logs", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">D</span>
        </div>
        <span className="font-semibold text-foreground">Dallosh Analysis</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {adminNavItems.map((item) => {
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
        })}
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.data.email?.[0]?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.data.email || "admin@dallosh.com"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

