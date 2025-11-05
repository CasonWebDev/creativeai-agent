<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Services\TokenService;
use App\Services\EmailService;
use App\Services\PasswordResetService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

final class AuthController extends Controller
{
    protected AuthService $authService;
    protected TokenService $tokenService;
    protected EmailService $emailService;
    protected PasswordResetService $passwordResetService;

    public function __construct(
        AuthService $authService,
        TokenService $tokenService,
        EmailService $emailService,
        PasswordResetService $passwordResetService
    ) {
        $this->authService = $authService;
        $this->tokenService = $tokenService;
        $this->emailService = $emailService;
        $this->passwordResetService = $passwordResetService;
    }

    /**
     * Register a new user.
     *
     * POST /api/v1/auth/register
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $result = $this->authService->register(
                [
                    'email' => $request->input('email'),
                    'name' => $request->input('name'),
                    'password' => $request->input('password'),
                    'tier' => $request->input('tier', 'free'),
                ],
                $request->ip(),
                $request->userAgent()
            );

            // Send confirmation email
            $this->emailService->sendEmailConfirmation(
                $result['user'],
                $result['confirmation_token']
            );

            return response()->json([
                'success' => true,
                'message' => 'Registration successful. Please check your email to confirm your account.',
                'data' => [
                    'user' => $result['user']->only(['id', 'email', 'name', 'tier']),
                    'requires_confirmation' => true,
                ],
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Confirm user email.
     *
     * POST /api/v1/auth/confirm-email
     */
    public function confirmEmail(Request $request): JsonResponse
    {
        try {
            $token = $request->input('token');

            if (!$token) {
                throw ValidationException::withMessages([
                    'token' => 'Token is required.',
                ]);
            }

            $user = $this->authService->confirmEmail(
                $token,
                $request->ip(),
                $request->userAgent()
            );

            // Send welcome email
            $this->emailService->sendWelcome($user);

            return response()->json([
                'success' => true,
                'message' => 'Email confirmed successfully.',
                'data' => [
                    'user' => $user->only(['id', 'email', 'name', 'tier', 'email_confirmed_at']),
                ],
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Email confirmation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Login a user.
     *
     * POST /api/v1/auth/login
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $credentials = [
                'email' => $request->input('email'),
                'password' => $request->input('password'),
            ];

            // Validate credentials
            if (($credentials['email'] ?? '') === '' || ($credentials['password'] ?? '') === '') {
                throw ValidationException::withMessages([
                    'email' => 'Email and password are required.',
                ]);
            }

            $deviceInfo = [
                'device_type' => $request->input('device_type', 'browser'),
                'browser_name' => $request->input('browser_name'),
                'os_name' => $request->input('os_name'),
                'remember_device' => $request->boolean('remember_device', false),
            ];

            $result = $this->authService->login(
                $credentials,
                $request->ip(),
                $request->userAgent(),
                $deviceInfo
            );

            return response()->json([
                'success' => true,
                'message' => 'Login successful.',
                'data' => [
                    'user' => $result['user']->only(['id', 'email', 'name', 'tier']),
                    'access_token' => $result['session']['access_token'],
                    'refresh_token' => $result['session']['refresh_token'],
                    'expires_in' => $result['session']['expires_in'],
                    'token_type' => $result['session']['token_type'],
                ],
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed.',
                'errors' => $e->errors(),
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Refresh access token.
     *
     * POST /api/v1/auth/refresh
     */
    public function refresh(Request $request): JsonResponse
    {
        try {
            $refreshToken = $request->input('refresh_token');

            if (!$refreshToken) {
                throw new \Exception('Refresh token is required.');
            }

            $result = $this->tokenService->refreshAccessToken($refreshToken);

            return response()->json([
                'success' => true,
                'message' => 'Token refreshed successfully.',
                'data' => $result,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 401);
        }
    }

    /**
     * Logout (revoke session).
     *
     * POST /api/v1/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (! $user) {
                throw new \Exception('User not authenticated.');
            }

            // Get current session from token
            $sessionId = $request->input('session_id');

            if ($sessionId) {
                $session = $user->sessions()->find($sessionId);
                if ($session) {
                    $this->tokenService->revokeSession($session);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Logout successful.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get current user profile.
     *
     * GET /api/v1/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'data' => $user->only([
                'id',
                'email',
                'name',
                'tier',
                'email_confirmed_at',
                'last_login_at',
                'created_at',
            ]),
        ], 200);
    }

    /**
     * Request a password reset.
     *
     * POST /api/v1/auth/forgot-password
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        try {
            $email = $request->input('email');

            if (($email ?? '') === '') {
                throw ValidationException::withMessages([
                    'email' => 'Email is required.',
                ]);
            }

            $reset = $this->passwordResetService->requestReset(
                $email,
                $request->ip(),
                $request->userAgent()
            );

            // Send password reset email
            if ($reset->user_id) {
                $this->emailService->sendPasswordResetEmail(
                    $reset->user,
                    $reset->plain_token
                );
            }

            // Always return success for security (prevent email enumeration)
            return response()->json([
                'success' => true,
                'message' => 'If an account exists with that email, a password reset link will be sent shortly.',
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify a password reset token.
     *
     * POST /api/v1/auth/verify-reset-token
     */
    public function verifyResetToken(Request $request): JsonResponse
    {
        try {
            $token = $request->input('token');

            if (($token ?? '') === '') {
                throw ValidationException::withMessages([
                    'token' => 'Reset token is required.',
                ]);
            }

            $reset = $this->passwordResetService->verifyResetToken($token);

            return response()->json([
                'success' => true,
                'message' => 'Token is valid.',
                'data' => [
                    'email' => $reset->email,
                    'token_expires_at' => $reset->expires_at,
                ],
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Reset a user's password.
     *
     * POST /api/v1/auth/reset-password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        try {
            $token = $request->input('token');
            $password = $request->input('password');

            if (($token ?? '') === '') {
                throw ValidationException::withMessages([
                    'token' => 'Reset token is required.',
                ]);
            }

            if (($password ?? '') === '') {
                throw ValidationException::withMessages([
                    'password' => 'Password is required.',
                ]);
            }

            $user = $this->passwordResetService->resetPassword(
                $token,
                $password,
                $request->ip(),
                $request->userAgent()
            );

            return response()->json([
                'success' => true,
                'message' => 'Password reset successful. You can now login with your new password.',
                'data' => [
                    'user' => $user->only(['id', 'email', 'name']),
                ],
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Resend email verification email to a user.
     *
     * POST /api/v1/auth/resend-verification-email
     */
    public function resendVerificationEmail(Request $request): JsonResponse
    {
        try {
            $email = $request->input('email');

            if (($email ?? '') === '') {
                throw ValidationException::withMessages([
                    'email' => 'Email is required.',
                ]);
            }

            $user = \App\Models\User::where('email', strtolower($email))->firstOrFail();

            // Check if already verified
            if ($user->email_confirmed_at) {
                return response()->json([
                    'success' => false,
                    'message' => 'This email is already verified.',
                ], 422);
            }

            // Delete any existing confirmation records
            \App\Models\EmailConfirmation::where('user_id', $user->id)->delete();

            // Generate new email confirmation token
            $token = \Illuminate\Support\Str::random(64);
            \App\Models\EmailConfirmation::create([
                'user_id' => $user->id,
                'email' => $user->email,
                'token_hash' => hash('sha256', $token),
                'expires_at' => now()->addHour(),
            ]);

            // Send verification email
            $this->emailService->sendEmailConfirmation($user, $token);

            return response()->json([
                'success' => true,
                'message' => 'Verification email sent successfully. Please check your inbox.',
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to resend verification email: ' . $e->getMessage(),
            ], 500);
        }
    }
}
