<?php

namespace App\Services;

use App\Models\User;
use App\Models\PasswordReset;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PasswordResetService
{
    const RESET_TOKEN_EXPIRATION = 30; // minutes

    /**
     * Request a password reset.
     *
     * @param string $email User email
     * @param string $ipAddress Client IP address
     * @param string $userAgent Client user agent
     * @return PasswordReset Password reset record
     * @throws ValidationException
     */
    public function requestReset(string $email, string $ipAddress, string $userAgent): PasswordReset
    {
        $user = User::where('email', strtolower($email))->first();

        // Always return success for security (prevent email enumeration)
        if (!$user) {
            AuditLog::logAction(
                userId: null,
                action: 'password_reset_requested',
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                success: false,
                metadata: ['reason' => 'User not found', 'email' => $email]
            );

            // Return a dummy reset to prevent enumeration attacks
            return new PasswordReset([
                'email' => $email,
                'expires_at' => now()->addMinutes(self::RESET_TOKEN_EXPIRATION),
            ]);
        }

        return DB::transaction(function () use ($user, $ipAddress, $userAgent) {
            // Check for recent reset requests (rate limiting)
            $recentReset = PasswordReset::where('user_id', $user->id)
                ->where('used_at', null)
                ->where('created_at', '>', now()->subMinutes(5))
                ->first();

            if ($recentReset) {
                throw ValidationException::withMessages([
                    'email' => 'A password reset link was recently sent. Please check your email or try again later.',
                ]);
            }

            // Invalidate any previous unused reset tokens for this user
            PasswordReset::where('user_id', $user->id)
                ->where('used_at', null)
                ->update(['expires_at' => now()]);

            // Generate new reset token
            $token = bin2hex(random_bytes(32));
            $tokenHash = hash('sha256', $token);

            $reset = PasswordReset::create([
                'user_id' => $user->id,
                'email' => $user->email,
                'token_hash' => $tokenHash,
                'expires_at' => now()->addMinutes(self::RESET_TOKEN_EXPIRATION),
            ]);

            // Log audit trail
            AuditLog::logAction(
                userId: $user->id,
                action: 'password_reset_requested',
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                success: true
            );

            // Attach the plain token to the model for sending via email
            // (plain token is NOT stored in database for security)
            $reset->plain_token = $token;

            return $reset;
        });
    }

    /**
     * Verify a password reset token.
     *
     * @param string $token Reset token
     * @return PasswordReset Reset record if valid
     * @throws ValidationException
     */
    public function verifyResetToken(string $token): PasswordReset
    {
        $tokenHash = hash('sha256', $token);

        $reset = PasswordReset::where('token_hash', $tokenHash)->first();

        if (!$reset || !$this->isResetValid($reset)) {
            throw ValidationException::withMessages([
                'token' => 'Invalid or expired password reset token.',
            ]);
        }

        return $reset;
    }

    /**
     * Reset a user's password.
     *
     * @param string $token Reset token
     * @param string $newPassword New password
     * @param string $ipAddress Client IP address
     * @param string $userAgent Client user agent
     * @return User User with updated password
     * @throws ValidationException
     */
    public function resetPassword(
        string $token,
        string $newPassword,
        string $ipAddress,
        string $userAgent
    ): User {
        // Verify token
        $reset = $this->verifyResetToken($token);

        // Validate password
        $this->validatePassword($newPassword);

        return DB::transaction(function () use ($reset, $newPassword, $ipAddress, $userAgent) {
            $user = $reset->user;

            // Check if new password is same as old password
            if (Hash::check($newPassword, $user->password)) {
                throw ValidationException::withMessages([
                    'password' => 'New password must be different from your current password.',
                ]);
            }

            // Update password
            $user->update([
                'password' => Hash::make($newPassword),
            ]);

            // Mark reset token as used
            $reset->update([
                'used_at' => now(),
                'used_ip_address' => $ipAddress,
            ]);

            // Invalidate all other reset tokens for this user
            PasswordReset::where('user_id', $user->id)
                ->where('id', '!=', $reset->id)
                ->where('used_at', null)
                ->update(['expires_at' => now()]);

            // Log audit trail
            AuditLog::logAction(
                userId: $user->id,
                action: 'password_reset_completed',
                ipAddress: $ipAddress,
                userAgent: $userAgent,
                success: true
            );

            return $user;
        });
    }

    /**
     * Check if a password reset is still valid.
     *
     * @param PasswordReset $reset
     * @return bool
     */
    protected function isResetValid(PasswordReset $reset): bool
    {
        // Check if token has expired
        if ($reset->expires_at->isPast()) {
            return false;
        }

        // Check if token has already been used
        if ($reset->used_at !== null) {
            return false;
        }

        return true;
    }

    /**
     * Validate password.
     *
     * @param string $password
     * @throws ValidationException
     */
    protected function validatePassword(string $password): void
    {
        $errors = [];

        if (empty($password)) {
            $errors['password'] = 'Password is required.';
        } elseif (strlen($password) < 8) {
            $errors['password'] = 'Password must be at least 8 characters.';
        } elseif (!preg_match('/[A-Z]/', $password)) {
            $errors['password'] = 'Password must contain an uppercase letter.';
        } elseif (!preg_match('/[a-z]/', $password)) {
            $errors['password'] = 'Password must contain a lowercase letter.';
        } elseif (!preg_match('/[0-9]/', $password)) {
            $errors['password'] = 'Password must contain a number.';
        }

        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }
    }
}
