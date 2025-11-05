'use client';

import React from 'react';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-muted/50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground">
            Get started by creating your account
          </p>
        </div>

        {/* Form */}
        <RegisterForm />
      </div>
    </div>
  );
}
