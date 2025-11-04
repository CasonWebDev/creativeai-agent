<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Models\EmailConfirmation;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class AuthService
{
    /**
     * Register a new user.
     *
     * @param array $data User registration data (email, name, password)
     * @param string $ipAddress Client IP address
     * @param string $userAgent Client user agent
     * @return array<string, mixed> User and confirmation token
     * @throws ValidationException
     */
    public function register(array $data, string $ipAddress, string $userAgent): array
    {
        // Validate input
        $this->validateRegistration($data);

        return DB::transaction(function () use ($data, $ipAddress, $userAgent) {
            // Create user
            $user = User::create([
                'email' => strtolower($data['email']),
                'name' => $data['name'],
                'password' => Hash::make($data['password']),
                'tier' => $data['tier'] ?? 'free',
            ]);

            // Generate email confirmation token
            $confirmationToken = $this->generateEmailConfirmationToken($user);

            // Log audit trail
            AuditLog::logAction(
                userId: $user->id,
                action: 'register',
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                success: true,
                metadata: ['tier' => $user->tier]
            );

            return [
                'user' => $user,
                'confirmation_token' => $confirmationToken,
            ];
        });
    }

    /**
     * Confirm a user's email.
     *
     * @param string $token Email confirmation token
     * @param string $ipAddress Client IP address
     * @param string $userAgent Client user agent
     * @return User Confirmed user
     * @throws ValidationException
     */
    public function confirmEmail(string $token, string $ipAddress, string $userAgent): User
    {
        $confirmation = EmailConfirmation::where('token_hash', hash('sha256', $token))
            ->first();

        if (!$confirmation || !$confirmation->isValid()) {
            AuditLog::logAction(
                userId: null,
                action: 'email_confirmed',
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                success: false,
                metadata: ['error' => 'Invalid or expired token']
            );

            throw ValidationException::withMessages([
                'token' => 'Invalid or expired confirmation token.',
            ]);
        }

        return DB::transaction(function () use ($confirmation, $ipAddress, $userAgent) {
            $confirmation->markAsConfirmed();

            AuditLog::logAction(
                userId: $confirmation->user_id,
                action: 'email_confirmed',
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                success: true
            );

            return $confirmation->user;
        });
    }

    /**
     * Log in a user.
     *
     * @param array $credentials Email and password
     * @param string $ipAddress Client IP address
     * @param string $userAgent Client user agent
     * @param array $deviceInfo Device information
     * @return array<string, mixed> User and tokens
     * @throws ValidationException
     */
    public function login(array $credentials, string $ipAddress, string $userAgent, array $deviceInfo = []): array
    {
        $user = User::where('email', strtolower($credentials['email']))
            ->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            AuditLog::logAction(
                userId: $user?->id,
                action: 'login_failed',
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                success: false,
                metadata: ['reason' => 'Invalid credentials']
            );

            throw ValidationException::withMessages([
                'email' => 'Invalid email or password.',
            ]);
        }

        if (!$user->hasConfirmedEmail()) {
            AuditLog::logAction(
                userId: $user->id,
                action: 'login_failed',
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                success: false,
                metadata: ['reason' => 'Email not confirmed']
            );

            throw ValidationException::withMessages([
                'email' => 'Please confirm your email before logging in.',
            ]);
        }

        return DB::transaction(function () use ($user, $ipAddress, $userAgent, $deviceInfo) {
            // Create session
            $session = app(TokenService::class)->createSession(
                $user,
                $ipAddress,
                $userAgent,
                $deviceInfo
            );

            // Update last login
            $user->update(['last_login_at' => now()]);

            // Log audit trail
            AuditLog::logAction(
                userId: $user->id,
                action: 'login_success',
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                success: true
            );

            return [
                'user' => $user,
                'session' => $session,
            ];
        });
    }

    /**
     * Validate registration input.
     *
     * @param array $data
     * @throws ValidationException
     */
    protected function validateRegistration(array $data): void
    {
        $errors = [];

        // Email validation
        if (($data['email'] ?? '') === '') {
            $errors['email'] = 'Email is required.';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Email must be valid.';
        } elseif (strlen($data['email']) > 255) {
            $errors['email'] = 'Email cannot exceed 255 characters.';
        } elseif (User::where('email', strtolower($data['email']))->exists()) {
            $errors['email'] = 'Email already registered.';
        }

        // Name validation
        if (($data['name'] ?? '') === '') {
            $errors['name'] = 'Name is required.';
        } elseif (strlen($data['name']) > 255) {
            $errors['name'] = 'Name cannot exceed 255 characters.';
        }

        // Password validation
        if (($data['password'] ?? '') === '') {
            $errors['password'] = 'Password is required.';
        } elseif (strlen($data['password']) < 8) {
            $errors['password'] = 'Password must be at least 8 characters.';
        } elseif (!preg_match('/[A-Z]/', $data['password'])) {
            $errors['password'] = 'Password must contain an uppercase letter.';
        } elseif (!preg_match('/[a-z]/', $data['password'])) {
            $errors['password'] = 'Password must contain a lowercase letter.';
        } elseif (!preg_match('/[0-9]/', $data['password'])) {
            $errors['password'] = 'Password must contain a number.';
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }

    /**
     * Generate an email confirmation token.
     *
     * @param User $user
     * @return string Plain text token to send to user
     */
    protected function generateEmailConfirmationToken(User $user): string
    {
        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);

        EmailConfirmation::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'token_hash' => $tokenHash,
            'expires_at' => now()->addHour(),
        ]);

        return $token;
    }
}
