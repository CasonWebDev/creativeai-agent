'use client';

import type React from "react"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/lib/context/AuthContext";
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { state } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  // Debug logging
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
      console.debug('[Dashboard Layout] Auth state:', {
        isHydrated,
        isLoading: state.isLoading,
        isAuthenticated: state.isAuthenticated,
        hasUser: !!state.user,
      });
    }
  }, [isHydrated, state.isLoading, state.isAuthenticated, state.user]);

  // Mark as hydrated after first render
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle redirects ONLY after hydration
  useEffect(() => {
    if (isHydrated && !state.isLoading && !state.isAuthenticated) {
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Dashboard Layout] Redirecting to login - not authenticated');
      }
      router.push('/login');
    }
  }, [isHydrated, state.isLoading, state.isAuthenticated, router]);

  // Show loading state while hydrating, restoring session, or not authenticated
  if (!isHydrated || state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {!isHydrated ? 'Loading...' : 'Restoring your session...'}
          </p>
        </div>
      </div>
    );
  }

  // After loading completes, if not authenticated, show loading while redirecting
  if (!state.isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
