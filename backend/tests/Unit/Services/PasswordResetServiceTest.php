<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Models\PasswordReset;
use App\Services\PasswordResetService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class PasswordResetServiceTest extends TestCase
{
    protected PasswordResetService $passwordResetService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->passwordResetService = app(PasswordResetService::class);
    }

    /**
     * Test requesting a password reset for valid user
     */
    public function test_can_request_password_reset_for_existing_user(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
        ]);

        $reset = $this->passwordResetService->requestReset(
            $user->email,
            '127.0.0.1',
            'Test UA'
        );

        $this->assertNotNull($reset);
        $this->assertEquals($user->id, $reset->user_id);
        $this->assertEquals($user->email, $reset->email);
        $this->assertNotNull($reset->token_hash);
        $this->assertFalse($reset->expires_at->isPast());
        $this->assertNull($reset->used_at);
    }

    /**
     * Test requesting password reset creates plain token
     */
    public function test_password_reset_request_includes_plain_token(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
        ]);

        $reset = $this->passwordResetService->requestReset(
            $user->email,
            '127.0.0.1',
            'Test UA'
        );

        $this->assertNotNull($reset->plain_token);
        $this->assertNotEmpty($reset->plain_token);
    }

    /**
     * Test rate limiting on password reset requests
     */
    public function test_password_reset_rate_limiting(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
        ]);

        // First request should succeed
        $reset1 = $this->passwordResetService->requestReset(
            $user->email,
            '127.0.0.1',
            'Test UA'
        );
        $this->assertNotNull($reset1);

        // Second request within 5 minutes should fail
        $this->expectException(ValidationException::class);
        $this->passwordResetService->requestReset(
            $user->email,
            '127.0.0.1',
            'Test UA'
        );
    }

    /**
     * Test verifying valid reset token
     */
    public function test_can_verify_valid_reset_token(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
        ]);

        $reset = $this->passwordResetService->requestReset(
            $user->email,
            '127.0.0.1',
            'Test UA'
        );

        $plainToken = $reset->plain_token;

        $verified = $this->passwordResetService->verifyResetToken($plainToken);

        $this->assertNotNull($verified);
        $this->assertEquals($reset->id, $verified->id);
    }

    /**
     * Test verifying invalid reset token fails
     */
    public function test_verify_reset_token_fails_with_invalid_token(): void
    {
        $this->expectException(ValidationException::class);
        $this->passwordResetService->verifyResetToken('invalid_token_here');
    }

    /**
     * Test verifying expired reset token fails
     */
    public function test_verify_reset_token_fails_when_expired(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
        ]);

        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);

        PasswordReset::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'token_hash' => $tokenHash,
            'expires_at' => now()->subMinute(),
        ]);

        $this->expectException(ValidationException::class);
        $this->passwordResetService->verifyResetToken($token);
    }

    /**
     * Test resetting password with valid token
     */
    public function test_can_reset_password_with_valid_token(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
        ]);

        $reset = $this->passwordResetService->requestReset(
            $user->email,
            '127.0.0.1',
            'Test UA'
        );

        $plainToken = $reset->plain_token;
        $newPassword = 'NewPassword456';

        $updatedUser = $this->passwordResetService->resetPassword(
            $plainToken,
            $newPassword,
            '127.0.0.1',
            'Test UA'
        );

        $this->assertEquals($user->id, $updatedUser->id);
        $this->assertTrue(Hash::check($newPassword, $updatedUser->password));

        // Verify reset is marked as used
        $reset->refresh();
        $this->assertNotNull($reset->used_at);
        $this->assertEquals('127.0.0.1', $reset->used_ip_address);
    }

    /**
     * Test resetting password fails with same password
     */
    public function test_reset_password_fails_with_same_password(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
        ]);

        $reset = $this->passwordResetService->requestReset(
            $user->email,
            '127.0.0.1',
            'Test UA'
        );

        $this->expectException(ValidationException::class);
        $this->passwordResetService->resetPassword(
            $reset->plain_token,
            'Password123',
            '127.0.0.1',
            'Test UA'
        );
    }

    /**
     * Test resetting password fails with invalid token
     */
    public function test_reset_password_fails_with_invalid_token(): void
    {
        $this->expectException(ValidationException::class);
        $this->passwordResetService->resetPassword(
            'invalid_token',
            'NewPassword456',
            '127.0.0.1',
            'Test UA'
        );
    }

    /**
     * Test resetting password fails with weak password
     */
    public function test_reset_password_fails_with_weak_password(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
        ]);

        $reset = $this->passwordResetService->requestReset(
            $user->email,
            '127.0.0.1',
            'Test UA'
        );

        // Test too short password
        $this->expectException(ValidationException::class);
        $this->passwordResetService->resetPassword(
            $reset->plain_token,
            'Pass123',
            '127.0.0.1',
            'Test UA'
        );
    }

    /**
     * Test token cannot be used twice
     */
    public function test_reset_token_cannot_be_used_twice(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
        ]);

        $reset = $this->passwordResetService->requestReset(
            $user->email,
            '127.0.0.1',
            'Test UA'
        );

        $plainToken = $reset->plain_token;

        // Use token once
        $this->passwordResetService->resetPassword(
            $plainToken,
            'NewPassword456',
            '127.0.0.1',
            'Test UA'
        );

        // Try to use token again
        $this->expectException(ValidationException::class);
        $this->passwordResetService->resetPassword(
            $plainToken,
            'AnotherPassword789',
            '127.0.0.1',
            'Test UA'
        );
    }

    /**
     * Test new reset request invalidates previous requests
     */
    public function test_new_reset_request_invalidates_previous(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
        ]);

        // First request
        $reset1 = $this->passwordResetService->requestReset(
            $user->email,
            '127.0.0.1',
            'Test UA'
        );

        $token1 = $reset1->plain_token;

        // Manually bypass rate limit by marking first reset as old
        PasswordReset::where('user_id', $user->id)
            ->where('id', $reset1->id)
            ->update(['created_at' => now()->subMinutes(20)]);

        // Request second reset
        $reset2 = $this->passwordResetService->requestReset(
            $user->email,
            '127.0.0.1',
            'Test UA'
        );

        // First token should no longer be valid
        $this->expectException(ValidationException::class);
        $this->passwordResetService->verifyResetToken($token1);
    }
}
