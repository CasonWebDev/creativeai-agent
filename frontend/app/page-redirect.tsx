'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

export default function RootPage() {
  const router = useRouter();
  const { state } = useAuth();

  useEffect(() => {
    // Wait for session restoration to complete
    if (!state.isLoading) {
      if (state.isAuthenticated) {
        // Authenticated user → dashboard
        router.push('/dashboard');
      } else {
        // Not authenticated → login
        router.push('/login');
      }
    }
  }, [state.isAuthenticated, state.isLoading, router]);

  // Show loading while checking auth state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
