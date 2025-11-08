"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Admin root page
 * Redirects to /admin/overview only if path is exactly /admin
 * 
 * Note: This page.tsx only handles the exact /admin route.
 * Child routes like /admin/users are handled by their own page.tsx files.
 */
export default function AdminPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if we're on exactly /admin (not a child route)
    if (pathname === '/admin') {
      router.replace('/admin/overview');
    }
  }, [pathname, router]);

  // Show loading while redirecting
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );
}

