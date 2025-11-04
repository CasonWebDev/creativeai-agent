<?php

namespace Tests\Feature\Api\V1;

use Tests\TestCase;
use App\Models\User;
use App\Models\EmailConfirmation;
use Illuminate\Support\Facades\Hash;

class AuthenticationTest extends TestCase
{
    /**
     * Test user registration with valid data
     */
    public function test_user_can_register_with_valid_data(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => 'SecurePass123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'email', 'name', 'tier'],
                    'requires_confirmation',
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'email' => 'test@example.com',
                        'name' => 'Test User',
                    ],
                    'requires_confirmation' => true,
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'name' => 'Test User',
        ]);
    }

    /**
     * Test registration fails with duplicate email
     */
    public function test_registration_fails_with_duplicate_email(): void
    {
        User::create([
            'email' => 'duplicate@example.com',
            'name' => 'Existing User',
            'password' => Hash::make('Password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'duplicate@example.com',
            'name' => 'New User',
            'password' => 'SecurePass123',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'errors' => [
                    'email' => ['Email already registered.'],
                ],
            ]);
    }

    /**
     * Test registration fails with invalid email
     */
    public function test_registration_fails_with_invalid_email(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'not-an-email',
            'name' => 'Test User',
            'password' => 'SecurePass123',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'errors' => [
                    'email' => ['Email must be valid.'],
                ],
            ]);
    }

    /**
     * Test registration fails with weak password
     */
    public function test_registration_fails_with_weak_password(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => 'weak',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.password', function ($errors) {
                return count($errors) > 0;
            });
    }

    /**
     * Test registration fails with missing password uppercase
     */
    public function test_registration_fails_with_missing_uppercase(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => 'lowercase123',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'errors' => [
                    'password' => ['Password must contain an uppercase letter.'],
                ],
            ]);
    }

    /**
     * Test email confirmation with valid token
     */
    public function test_user_can_confirm_email_with_valid_token(): void
    {
        $user = User::create([
            'email' => 'unconfirmed@example.com',
            'name' => 'Unconfirmed User',
            'password' => Hash::make('Password123'),
        ]);

        $token = bin2hex(random_bytes(32));
        EmailConfirmation::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addHour(),
        ]);

        $response = $this->postJson('/api/v1/auth/confirm-email', [
            'token' => $token,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'email' => 'unconfirmed@example.com',
                    ],
                ],
            ]);

        $this->assertNotNull($user->fresh()->email_confirmed_at);
    }

    /**
     * Test email confirmation fails with invalid token
     */
    public function test_email_confirmation_fails_with_invalid_token(): void
    {
        $response = $this->postJson('/api/v1/auth/confirm-email', [
            'token' => 'invalid_token_1234567890',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'errors' => [
                    'token' => ['Invalid or expired confirmation token.'],
                ],
            ]);
    }

    /**
     * Test email confirmation fails with expired token
     */
    public function test_email_confirmation_fails_with_expired_token(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
        ]);

        $token = bin2hex(random_bytes(32));
        EmailConfirmation::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->subHour(), // Expired
        ]);

        $response = $this->postJson('/api/v1/auth/confirm-email', [
            'token' => $token,
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'errors' => [
                    'token' => ['Invalid or expired confirmation token.'],
                ],
            ]);
    }

    /**
     * Test login with valid credentials
     */
    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::create([
            'email' => 'confirmed@example.com',
            'name' => 'Confirmed User',
            'password' => Hash::make('Password123'),
            'email_confirmed_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'confirmed@example.com',
            'password' => 'Password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'email', 'name', 'tier'],
                    'access_token',
                    'refresh_token',
                    'expires_in',
                    'token_type',
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => ['id' => $user->id, 'email' => 'confirmed@example.com'],
                    'token_type' => 'Bearer',
                ],
            ]);

        // Verify token is a valid JWT format
        $this->assertMatchesRegularExpression(
            '/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/',
            $response->json('data.access_token')
        );
    }

    /**
     * Test login fails with wrong password
     */
    public function test_login_fails_with_wrong_password(): void
    {
        User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('CorrectPassword123'),
            'email_confirmed_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'WrongPassword123',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'errors' => [
                    'email' => ['Invalid email or password.'],
                ],
            ]);
    }

    /**
     * Test login fails with non-existent user
     */
    public function test_login_fails_with_non_existent_user(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'Password123',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'errors' => [
                    'email' => ['Invalid email or password.'],
                ],
            ]);
    }

    /**
     * Test login fails if email not confirmed
     */
    public function test_login_fails_if_email_not_confirmed(): void
    {
        User::create([
            'email' => 'unconfirmed@example.com',
            'name' => 'Unconfirmed User',
            'password' => Hash::make('Password123'),
            'email_confirmed_at' => null,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'unconfirmed@example.com',
            'password' => 'Password123',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'errors' => [
                    'email' => ['Please confirm your email before logging in.'],
                ],
            ]);
    }

    /**
     * Test get current user profile with valid token
     */
    public function test_user_can_get_profile_with_valid_token(): void
    {
        $user = User::create([
            'email' => 'confirmed@example.com',
            'name' => 'Confirmed User',
            'password' => Hash::make('Password123'),
            'email_confirmed_at' => now(),
        ]);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'confirmed@example.com',
            'password' => 'Password123',
        ]);

        $token = $loginResponse->json('data.access_token');

        $response = $this->withHeaders([
            'Authorization' => "Bearer $token",
        ])->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'email' => 'confirmed@example.com',
                    'name' => 'Confirmed User',
                ],
            ]);
    }

    /**
     * Test get profile fails without token
     */
    public function test_get_profile_fails_without_token(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Token not provided.',
            ]);
    }

    /**
     * Test get profile fails with invalid token
     */
    public function test_get_profile_fails_with_invalid_token(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer invalid_token',
        ])->getJson('/api/v1/auth/me');

        $response->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    /**
     * Test refresh token with valid refresh token
     */
    public function test_user_can_refresh_token_with_valid_refresh_token(): void
    {
        $user = User::create([
            'email' => 'confirmed@example.com',
            'name' => 'Confirmed User',
            'password' => Hash::make('Password123'),
            'email_confirmed_at' => now(),
        ]);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'confirmed@example.com',
            'password' => 'Password123',
        ]);

        $refreshToken = $loginResponse->json('data.refresh_token');
        $originalAccessToken = $loginResponse->json('data.access_token');

        // Small delay to ensure different timestamps
        sleep(1);

        $response = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $refreshToken,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'access_token',
                    'expires_in',
                    'token_type',
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'token_type' => 'Bearer',
                ],
            ]);

        // Verify new token is a valid JWT format
        $newToken = $response->json('data.access_token');
        $this->assertMatchesRegularExpression(
            '/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/',
            $newToken
        );

        // Verify it's a different token (should have different payload/signature)
        $this->assertNotEquals($originalAccessToken, $newToken);
    }

    /**
     * Test refresh token fails with invalid token
     */
    public function test_refresh_token_fails_with_invalid_token(): void
    {
        $response = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => 'invalid_refresh_token',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid or expired refresh token.',
            ]);
    }

    /**
     * Test logout with valid token
     */
    public function test_user_can_logout_with_valid_token(): void
    {
        $user = User::create([
            'email' => 'confirmed@example.com',
            'name' => 'Confirmed User',
            'password' => Hash::make('Password123'),
            'email_confirmed_at' => now(),
        ]);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'confirmed@example.com',
            'password' => 'Password123',
        ]);

        $token = $loginResponse->json('data.access_token');

        $response = $this->withHeaders([
            'Authorization' => "Bearer $token",
        ])->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logout successful.',
            ]);
    }

    /**
     * Test logout fails without token
     */
    public function test_logout_fails_without_token(): void
    {
        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Token not provided.',
            ]);
    }

    /**
     * Test complete authentication flow
     */
    public function test_complete_authentication_flow(): void
    {
        // 1. Register
        $registerResponse = $this->postJson('/api/v1/auth/register', [
            'email' => 'flow@example.com',
            'name' => 'Flow Test User',
            'password' => 'FlowTest123',
        ]);

        $registerResponse->assertStatus(201);

        // 2. Confirm email
        $user = User::where('email', 'flow@example.com')->first();
        $confirmation = $user->emailConfirmations()->latest()->first();
        
        // We need to find the plain token, so let's create a new one for testing
        $token = bin2hex(random_bytes(32));
        $confirmation->update(['token_hash' => hash('sha256', $token)]);

        $confirmResponse = $this->postJson('/api/v1/auth/confirm-email', [
            'token' => $token,
        ]);

        $confirmResponse->assertStatus(200);

        // 3. Login
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'flow@example.com',
            'password' => 'FlowTest123',
        ]);

        $loginResponse->assertStatus(200);
        $accessToken = $loginResponse->json('data.access_token');
        $refreshToken = $loginResponse->json('data.refresh_token');

        // 4. Get profile
        $meResponse = $this->withHeaders([
            'Authorization' => "Bearer $accessToken",
        ])->getJson('/api/v1/auth/me');

        $meResponse->assertStatus(200)
            ->assertJson([
                'data' => ['email' => 'flow@example.com'],
            ]);

        // 5. Refresh token
        $refreshResponse = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $refreshToken,
        ]);

        $refreshResponse->assertStatus(200);
        $newAccessToken = $refreshResponse->json('data.access_token');

        // 6. Logout
        $logoutResponse = $this->withHeaders([
            'Authorization' => "Bearer $newAccessToken",
        ])->postJson('/api/v1/auth/logout');

        $logoutResponse->assertStatus(200);
    }
}
