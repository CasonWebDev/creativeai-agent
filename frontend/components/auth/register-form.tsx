'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/context/AuthContext';
import { registerSchema, RegisterFormData } from '@/lib/validators/auth.schemas';
import { handleApiError } from '@/lib/api/error-handler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordStrengthIndicator } from './password-strength-indicator';
import Link from 'next/link';

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [password, setPassword] = useState('');

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await register(data.name, data.email, data.password);
      
      // Store email for verification page
      sessionStorage.setItem('registration_email', data.email);
      
      // Redirect to email verification page
      router.push('/verify-email');
    } catch (error: any) {
      const apiError = handleApiError(error);
      
      if (apiError.errors?.email) {
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
        setSubmitError(apiError.message);
      }

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true') {
        console.debug('[Auth] Registration failed:', apiError);
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

        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="John Doe"
                  type="text"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  placeholder="Enter a strong password"
                  type="password"
                  disabled={isSubmitting}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setPassword(e.target.value);
                  }}
                />
              </FormControl>
              <FormDescription>
                At least 8 characters, including uppercase, lowercase, and a number
              </FormDescription>
              <PasswordStrengthIndicator password={password} />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confirm Password Field */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Re-enter your password"
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
          disabled={isSubmitting || !form.formState.isValid}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>

        {/* Links */}
        <div className="space-y-3 text-center text-sm">
          <div>
            Already have an account?{' '}
            <Link href="/login" className="font-medium underline hover:no-underline">
              Sign in
            </Link>
          </div>
          <div>
            <Link href="/forgot-password" className="font-medium underline hover:no-underline">
              Forgot password?
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
