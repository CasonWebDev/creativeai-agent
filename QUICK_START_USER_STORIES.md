# Quick Start: User Story Implementation

**Status**: Foundation complete (Phase 2) - Ready to implement user stories  
**MVP Stories**: Phases 3-6 (16 tasks total)  
**Timeline**: ~4 hours for full MVP

## Architecture Reference for Story Development

### How to Add a New Feature

Every user story follows this pattern:

```
1. Create form component in frontend/components/auth/ or frontend/components/profile/
   - Use React Hook Form or Zod directly
   - Apply validation schema from auth.schemas.ts
   - Import from UI component library (frontend/components/ui/)
   
2. Add context method in AuthProvider.tsx if needed
   - Call appropriate API function from lib/api/auth.ts
   - Update AuthState on success
   - Handle errors with handleApiError()
   - Debug log if NEXT_PUBLIC_AUTH_DEBUG=true
   
3. Create page in frontend/app/(auth)/ or frontend/app/(dashboard)/
   - Import form component
   - Use useAuth() to access context if needed
   - Show loading/error states
   
4. Test locally
   - Start backend: php artisan serve (port 8000)
   - Start frontend: npm run dev (port 3000)
   - Test form validation, success, and error cases
```

## Available Utilities & Hooks

### Context Hooks (use in components)
```tsx
import { useAuth, useIsAuthenticated, useUser, useAuthLoading } from '@/lib/context/AuthContext';

// Main hook
const { state, login, register, logout, ... } = useAuth();

// Convenience hooks
const isAuth = useIsAuthenticated();           // boolean
const user = useUser();                        // User | null
const isLoading = useAuthLoading();            // boolean
const error = useAuthError();                  // string | null
```

### Validation Schemas (use in forms)
```tsx
import * as schemas from '@/lib/validators/auth.schemas';

// Validate data
const result = schemas.registerSchema.parse({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePass123',
});

// Get inferred types
type RegisterData = z.infer<typeof schemas.registerSchema>;
```

### Sanitization Utilities (apply before API calls)
```tsx
import { sanitizeEmail, sanitizeText, sanitizePassword } from '@/lib/utils/sanitize';

// All auth.ts functions already do this automatically
// Only use directly if bypassing auth.ts
const safe_email = sanitizeEmail(user_input);
```

### Token Utilities (rarely needed - interceptor handles automatically)
```tsx
import { getAccessToken, getRefreshToken, isRefreshTokenExpired } from '@/lib/utils/token';

// Most use cases are handled by AuthProvider
// Only use if implementing custom logic
```

### Rate Limiting (use before login attempts)
```tsx
import { isRateLimited, getRateLimitResetTime } from '@/lib/utils/rate-limit';

if (isRateLimited()) {
  throw new Error(`Too many attempts. Try again in ${getRateLimitResetTime()}s`);
}
```

## Component Pattern Template

### Auth Form Component
```tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerSchema } from '@/lib/validators/auth.schemas';
import { handleApiError } from '@/lib/api/error-handler';

export function RegisterForm() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({...});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate
      const validated = registerSchema.parse(formData);
      
      // Call context method
      await register(validated.name, validated.email, validated.password);
      
      // Success handling (redirect, etc)
    } catch (err: any) {
      const apiError = handleApiError(err);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <div className="text-destructive">{error}</div>}
      <Button disabled={isLoading} type="submit">
        {isLoading ? 'Loading...' : 'Submit'}
      </Button>
    </form>
  );
}
```

### Protected Page Component
```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuth, useIsAuthenticated } from '@/lib/context/AuthContext';
import { MyComponent } from '@/components/my-component';

export default function MyPage() {
  const router = useRouter();
  const { state } = useAuth();
  
  // Loading state
  if (state.isLoading) {
    return <LoadingSpinner />;
  }
  
  // Not authenticated
  if (!state.isAuthenticated) {
    router.push('/auth/login');
    return null;
  }
  
  // Render protected content
  return <MyComponent user={state.user} />;
}
```

## API Endpoints Reference

All endpoints in `frontend/lib/api/auth.ts`:

| Function | Method | Endpoint | Input | Output |
|----------|--------|----------|-------|--------|
| `register()` | POST | /auth/register | name, email, password | user, tokens |
| `login()` | POST | /auth/login | email, password | user, tokens |
| `logout()` | POST | /auth/logout | — | — |
| `getCurrentUser()` | GET | /auth/me | — | user |
| `verifyEmail()` | GET | /verify-email/{token} | token | user, tokens |
| `forgotPassword()` | POST | /auth/forgot-password | email | — |
| `resetPassword()` | PUT | /auth/reset-password | token, password | user, tokens |
| `updateProfile()` | PUT | /auth/profile | name | user |
| `uploadAvatar()` | POST | /auth/upload-avatar | file | user |
| `changePassword()` | PUT | /auth/change-password | current_password, password | — |
| `getSessions()` | GET | /auth/sessions | — | sessions[] |
| `deleteSession()` | DELETE | /auth/sessions/{id} | sessionId | — |
| `getApiTokens()` | GET | /auth/api-tokens | — | tokens[] |
| `createApiToken()` | POST | /auth/api-tokens | name, expires_at | token |
| `deleteApiToken()` | DELETE | /auth/api-tokens/{id} | tokenId | — |
| `deleteAccount()` | DELETE | /auth/account | — | — |

## State Management Reference

### AuthState Structure
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  emailVerified: boolean;
  accessToken: string | null;
  isLoading: boolean;              // Session restoration in progress
  isAuthenticating: boolean;        // Login/register in progress
  isTokenRefreshing: boolean;       // Token refresh in progress
  error: string | null;             // Last error message
}

interface AuthContextType {
  state: AuthState;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  resendVerificationEmail(email: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
  updateProfile(name: string): Promise<void>;
  uploadAvatar(file: File): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  getSessions(): Promise<Session[]>;
  deleteSession(sessionId: string): Promise<void>;
  getApiTokens(): Promise<ApiToken[]>;
  createApiToken(name: string, expiresAt?: string): Promise<string>;
  deleteApiToken(tokenId: string): Promise<void>;
  deleteAccount(): Promise<void>;
}
```

## Common Patterns

### Form with Real-time Validation
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validators/auth.schemas';

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      {/* ... */}
    </form>
  );
}
```

### Show Error Toast
```tsx
import { useToast } from '@/hooks/use-toast';

export function MyComponent() {
  const { toast } = useToast();
  
  try {
    await someAction();
  } catch (error: any) {
    const apiError = handleApiError(error);
    toast({
      title: 'Error',
      description: apiError.message,
      variant: 'destructive',
    });
  }
}
```

### Redirect After Login
```tsx
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  
  const handleSubmit = async (data) => {
    await login(data.email, data.password);
    router.push('/dashboard');
  };
}
```

## Environment & Configuration

### Frontend Development
```bash
cd frontend
npm install
npm run dev              # http://localhost:3000
npm run build
npm run lint
```

### Backend Development
```bash
cd backend
php artisan serve       # http://localhost:8000
php artisan migrate
```

### Environment Variables
```
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_AUTH_DEBUG=true              # Optional: debug logging
```

## Debugging Tips

### Enable Auth Debug Logging
```
Set NEXT_PUBLIC_AUTH_DEBUG=true in .env.local
All interceptor/token operations log [Auth] prefix
```

### Check Browser Storage
```
Session Storage:
  - auth_refresh_token (expires on browser close)

Local Storage:
  - access_token
  - auth_attempt_tracker (rate limiting)
```

### Common Issues

**Issue**: "Cannot find module 'axios'"
- **Fix**: Run `npm install axios --legacy-peer-deps`

**Issue**: useAuth hook throws "Cannot find provider"
- **Fix**: Ensure AuthProvider wraps component tree in app/layout.tsx

**Issue**: 401 response not triggering refresh
- **Fix**: Ensure access_token is in localStorage and refresh_token in sessionStorage

**Issue**: Rate limiting blocking legitimate logins
- **Fix**: Clear localStorage['auth_attempt_tracker'] or wait 60 seconds

**Issue**: User not restoring on page reload
- **Fix**: Verify refresh_token in sessionStorage and backend /auth/me endpoint works

## Next Steps

After Phase 2 completion, implement user stories in any order:

1. **Phase 3**: US1 Registration (7 tasks)
   - RegisterForm component
   - EmailVerificationForm component
   - /auth/register page
   - /auth/verify-email page

2. **Phase 4**: US2 Login (3 tasks)
   - LoginForm component
   - /auth/login page
   - Session restoration on page load

3. **Phase 5**: US3 Token Refresh (3 tasks)
   - Test 401 → refresh → retry flow
   - Test request queuing
   - Test logout on refresh failure

4. **Phase 6**: US5 Logout (3 tasks)
   - Logout button in header
   - /dashboard/settings page
   - Verify tokens cleared

All infrastructure ready. Start building! 🚀
