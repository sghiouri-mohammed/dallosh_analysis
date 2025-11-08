"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Home root page
 * Redirects to /home/overview only if path is exactly /home
 * 
 * Note: This page.tsx only handles the exact /home route.
 * Child routes like /home/overview are handled by their own page.tsx files.
 */
export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if we're on exactly /home (not a child route)
    if (pathname === '/home') {
      router.replace('/home/overview');
    }
  }, [pathname, router]);

  // Show loading while redirecting
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );
}

