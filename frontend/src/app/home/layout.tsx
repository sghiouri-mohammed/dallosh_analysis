"use client";

import { UserSidebar } from "@/components/layouts/UserSidebar";
import { ProtectedGuard } from "@/guards";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedGuard>
      <div className="flex h-screen bg-background">
        <UserSidebar />
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </ProtectedGuard>
  );
}

