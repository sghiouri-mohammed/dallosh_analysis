"use client";

import { UserSidebar } from "@/components/layouts/UserSidebar";
import { ProtectedGuard } from "@/guards";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedGuard>
      <div className="flex h-screen">
        <UserSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </ProtectedGuard>
  );
}

