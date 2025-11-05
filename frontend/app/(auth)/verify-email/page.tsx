'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { handleApiError } from '@/lib/api/error-handler';
import { EmailVerificationForm } from '@/components/auth/email-verification-form';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail } = useAuth();

  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Get token from URL query parameter
  const token = searchParams.get('token');

  // Get email from sessionStorage (only on client after mount)
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    setIsMounted(true);
    const savedEmail = typeof window !== 'undefined' ? sessionStorage.getItem('registration_email') || '' : '';
    setEmail(savedEmail);
  }, []);

  // Verify email when token is present
  useEffect(() => {
    if (token && !isVerifying && !success && isMounted) {
      const autoVerify = async () => {
        setIsVerifying(true);
        setError(null);
        try {
          await verifyEmail(token);
          setSuccess(true);

          if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
            console.debug('[Auth] Email auto-verified, redirecting to dashboard');
          }

          // Redirect to dashboard after short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } catch (err: any) {
          const apiError = handleApiError(err);
          setError(apiError.message);

          if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
            console.debug('[Auth] Email verification failed:', apiError);
          }
        } finally {
          setIsVerifying(false);
        }
      };

      autoVerify();
    }
  }, [token, isMounted]); // Only depend on token and isMounted, not on verifyEmail

  // Don't render until client is hydrated
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state during verification
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verifying your email...</p>
        </div>
      </div>
    );
  }

  // Show success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Email Verified!</h1>
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-muted/50">
        <div className="w-full max-w-md">
          <div className="mb-8 space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Verification Failed</h1>
            <p className="text-destructive">{error}</p>
          </div>

          <EmailVerificationForm email={email} />
        </div>
      </div>
    );
  }

  // Show email verification form (no token provided)
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-muted/50">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <EmailVerificationForm email={email} />
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
