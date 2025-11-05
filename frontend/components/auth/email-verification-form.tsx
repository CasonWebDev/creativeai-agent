'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { handleApiError } from '@/lib/api/error-handler';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmailVerificationFormProps {
  email?: string;
}

export function EmailVerificationForm({ email: initialEmail }: EmailVerificationFormProps) {
  const { resendVerificationEmail } = useAuth();
  const [email, setEmail] = useState(initialEmail || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResend = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await resendVerificationEmail(email);
      setMessage({
        type: 'success',
        text: 'Verification email sent! Check your inbox for the link.',
      });
    } catch (error: any) {
      const apiError = handleApiError(error);
      setMessage({ type: 'error', text: apiError.message });

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Resend verification failed:', apiError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Check Your Email</h1>
        <p className="text-muted-foreground">
          We've sent a verification link to <strong>{email}</strong>. Click the link in the email to verify your account.
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`rounded-md p-3 text-sm border ${
            message.type === 'success'
              ? 'bg-green-50 text-green-900 border-green-200'
              : 'bg-destructive/10 text-destructive border-destructive/20'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Resend Section */}
      <div className="space-y-4 rounded-lg border border-dashed p-4">
        <div className="text-sm">
          <p className="font-medium mb-2">Didn't receive the email?</p>
          <ol className="space-y-1 text-muted-foreground list-decimal list-inside">
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>Try requesting a new verification email below</li>
          </ol>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-3 py-2 border rounded-md text-sm"
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleResend}
          disabled={isLoading || !email}
          variant="outline"
          className="w-full"
        >
          {isLoading ? 'Sending...' : 'Resend Verification Email'}
        </Button>
      </div>

      {/* Links */}
      <div className="space-y-2 text-center text-sm">
        <div>
          Want to try a different email?{' '}
          <Link href="/register" className="font-medium underline hover:no-underline">
            Create new account
          </Link>
        </div>
        <div>
          Already verified?{' '}
          <Link href="/login" className="font-medium underline hover:no-underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
