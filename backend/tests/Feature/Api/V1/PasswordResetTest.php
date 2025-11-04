<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use App\Models\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    /**
     * Test forgot password request with valid email
     */
    public function test_user_can_request_password_reset_with_valid_email(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => $user->email,
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'message',
        ]);
        $response->assertJson(['success' => true]);

        // Verify reset was created
        $this->assertDatabaseHas('password_resets', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);
    }

    /**
     * Test forgot password returns success even for non-existent email
     */
    public function test_forgot_password_returns_success_for_nonexistent_email(): void
    {
        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
    }

    /**
     * Test forgot password fails without email
     */
    public function test_forgot_password_fails_without_email(): void
    {
        $response = $this->postJson('/api/v1/auth/forgot-password', []);

        $response->assertStatus(422);
        $response->assertJson(['success' => false]);
        $response->assertJsonStructure([
            'success',
            'message',
            'errors' => ['email'],
        ]);
    }

    /**
     * Test forgot password rate limiting
     */
    public function test_forgot_password_enforces_rate_limiting(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
        ]);

        // First request should succeed
        $response1 = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => $user->email,
        ]);
        $response1->assertStatus(200);

        // Second request within 5 minutes should fail
        $response2 = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => $user->email,
        ]);
        $response2->assertStatus(422);
    }

    /**
     * Test verifying valid reset token
     */
    public function test_user_can_verify_valid_reset_token(): void
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
            'expires_at' => now()->addMinutes(30),
        ]);

        // Verify token
        $verifyResponse = $this->postJson('/api/v1/auth/verify-reset-token', [
            'token' => $token,
        ]);

        $verifyResponse->assertStatus(200);
        $verifyResponse->assertJson(['success' => true]);
        $verifyResponse->assertJsonStructure([
            'success',
            'message',
            'data' => ['email', 'token_expires_at'],
        ]);
    }

    /**
     * Test verifying invalid reset token fails
     */
    public function test_verify_reset_token_fails_with_invalid_token(): void
    {
        $response = $this->postJson('/api/v1/auth/verify-reset-token', [
            'token' => 'invalid_token_here',
        ]);

        $response->assertStatus(422);
        $response->assertJson(['success' => false]);
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

        $response = $this->postJson('/api/v1/auth/verify-reset-token', [
            'token' => $token,
        ]);

        $response->assertStatus(422);
        $response->assertJson(['success' => false]);
    }

    /**
     * Test resetting password with valid token
     */
    public function test_user_can_reset_password_with_valid_token(): void
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
            'expires_at' => now()->addMinutes(30),
        ]);

        $newPassword = 'NewPassword456';

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'password' => $newPassword,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'user' => ['id', 'email', 'name'],
            ],
        ]);

        // Verify password was updated
        $user->refresh();
        $this->assertTrue(Hash::check($newPassword, $user->password));
    }

    /**
     * Test reset password fails with invalid token
     */
    public function test_reset_password_fails_with_invalid_token(): void
    {
        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => 'invalid_token',
            'password' => 'NewPassword456',
        ]);

        $response->assertStatus(422);
        $response->assertJson(['success' => false]);
    }

    /**
     * Test reset password fails without token
     */
    public function test_reset_password_fails_without_token(): void
    {
        $response = $this->postJson('/api/v1/auth/reset-password', [
            'password' => 'NewPassword456',
        ]);

        $response->assertStatus(422);
        $response->assertJson(['success' => false]);
    }

    /**
     * Test reset password fails without password
     */
    public function test_reset_password_fails_without_password(): void
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
            'expires_at' => now()->addMinutes(30),
        ]);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
        ]);

        $response->assertStatus(422);
        $response->assertJson(['success' => false]);
    }

    /**
     * Test reset password fails with weak password
     */
    public function test_reset_password_fails_with_weak_password(): void
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
            'expires_at' => now()->addMinutes(30),
        ]);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'password' => 'weak123', // Missing uppercase
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure([
            'success',
            'message',
            'errors' => ['password'],
        ]);
    }

    /**
     * Test reset password fails with same password
     */
    public function test_reset_password_fails_with_same_password(): void
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
            'expires_at' => now()->addMinutes(30),
        ]);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'password' => 'Password123', // Same as current
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure([
            'success',
            'message',
            'errors' => ['password'],
        ]);
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

        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);

        PasswordReset::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'token_hash' => $tokenHash,
            'expires_at' => now()->addMinutes(30),
        ]);

        // First use
        $response1 = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'password' => 'NewPassword456',
        ]);
        $response1->assertStatus(200);

        // Second use should fail
        $response2 = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'password' => 'AnotherPassword789',
        ]);
        $response2->assertStatus(422);
    }

    /**
     * Test complete password reset flow
     */
    public function test_complete_password_reset_flow(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
            'email_confirmed_at' => now(),
        ]);

        $oldPassword = 'Password123';
        $newPassword = 'NewPassword456';

        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);

        PasswordReset::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'token_hash' => $tokenHash,
            'expires_at' => now()->addMinutes(30),
        ]);

        // Step 1: Verify token
        $verifyResponse = $this->postJson('/api/v1/auth/verify-reset-token', [
            'token' => $token,
        ]);
        $verifyResponse->assertStatus(200);

        // Step 2: Reset password
        $resetResponse = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'password' => $newPassword,
        ]);
        $resetResponse->assertStatus(200);

        // Step 3: Verify old password doesn't work
        $loginWithOldResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => $oldPassword,
        ]);
        $loginWithOldResponse->assertStatus(401);

        // Step 4: Verify new password works
        $loginWithNewResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => $newPassword,
        ]);
        $loginWithNewResponse->assertStatus(200);
        $loginWithNewResponse->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'user' => ['id', 'email', 'name'],
                'access_token',
                'refresh_token',
                'expires_in',
                'token_type',
            ],
        ]);
    }
}
