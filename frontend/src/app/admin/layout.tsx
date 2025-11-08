"use client";

import { AdminSidebar } from "@/components/layouts/AdminSidebar";
import { AdminGuard } from "@/guards";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </AdminGuard>
  );
}

