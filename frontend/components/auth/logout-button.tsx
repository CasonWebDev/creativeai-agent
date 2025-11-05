'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  showConfirmation?: boolean;
  label?: string;
}

export function LogoutButton({
  variant = 'default',
  size = 'default',
  showIcon = true,
  showConfirmation = true,
  label = 'Sign Out',
}: LogoutButtonProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Logout complete, redirecting to login');
      }

      // Redirect to login page
      router.push('/login');
    } catch (error) {
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Logout error:', error);
      }
      // Still redirect even if logout API call fails
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const button = (
    <Button
      onClick={showConfirmation ? undefined : handleLogout}
      variant={variant}
      size={size}
      disabled={isLoading}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      {isLoading ? 'Signing out...' : label}
    </Button>
  );

  if (!showConfirmation) {
    return button;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign Out?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be signed out and redirected to the login page. Your session will be cleared.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 justify-end">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout} disabled={isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
