'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useIsAuthenticated } from '@/lib/context/AuthContext';

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Layout for authentication pages (login, register, password reset, etc.)
 * Public routes - allows unauthenticated access
 * Redirects authenticated users to dashboard
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();
  const { state } = useAuth();
  const isAuthenticated = useIsAuthenticated();

  // Redirect to dashboard if already logged in - use useEffect to avoid render-time redirects
  useEffect(() => {
    if (isAuthenticated && !state.isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, state.isLoading, router]);

  // Show loading state while checking auth
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
