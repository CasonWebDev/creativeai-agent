'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/context/AuthContext';
import { loginSchema, LoginFormData } from '@/lib/validators/auth.schemas';
import { handleApiError } from '@/lib/api/error-handler';
import { getRateLimitResetTime } from '@/lib/utils/rate-limit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Link from 'next/link';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setRateLimitMessage(null);

    try {
      await login(data.email, data.password);

      // Small delay to ensure tokens are persisted to localStorage
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect to dashboard on successful login
      router.push('/dashboard');
    } catch (error: any) {
      const apiError = handleApiError(error);

      // Check for rate limiting error
      if (apiError.message.includes('Too many')) {
        const resetTime = getRateLimitResetTime();
        const minutes = Math.ceil(resetTime / 60);
        setRateLimitMessage(
          `Too many login attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`
        );
      } else if (apiError.errors?.email) {
        form.setError('email', {
          type: 'manual',
          message: Array.isArray(apiError.errors.email)
            ? apiError.errors.email[0]
            : apiError.errors.email,
        });
      } else if (apiError.errors?.password) {
        form.setError('password', {
          type: 'manual',
          message: Array.isArray(apiError.errors.password)
            ? apiError.errors.password[0]
            : apiError.errors.password,
        });
      } else {
        setSubmitError(apiError.message || 'Invalid email or password');
      }

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Login failed:', apiError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-md">
        {/* Error Alert */}
        {submitError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
            {submitError}
          </div>
        )}

        {/* Rate Limit Alert */}
        {rateLimitMessage && (
          <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-900 border border-yellow-200">
            {rateLimitMessage}
          </div>
        )}

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="john@example.com"
                  type="email"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your password"
                  type="password"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !form.formState.isValid || !!rateLimitMessage}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>

        {/* Links */}
        <div className="space-y-3 text-center text-sm">
          <div>
            Don't have an account?{' '}
            <Link href="/register" className="font-medium underline hover:no-underline">
              Create one
            </Link>
          </div>
          <div>
            <Link href="/forgot-password" className="font-medium underline hover:no-underline">
              Forgot your password?
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
