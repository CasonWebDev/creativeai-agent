<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Models\User;
use App\Models\Session;
use App\Services\TokenService;
use Illuminate\Support\Facades\Hash;
use ReflectionMethod;

class TokenServiceTest extends TestCase
{
    protected TokenService $tokenService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tokenService = app(TokenService::class);
    }

    /**
     * Test JWT token generation
     */
    public function test_can_generate_access_token(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
        ]);

        $session = Session::create([
            'user_id' => $user->id,
            'refresh_token' => 'test_refresh_token_12345678901234567890',
            'refresh_token_hash' => hash('sha256', 'test_refresh_token_12345678901234567890'),
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test User Agent',
            'device_type' => 'browser',
            'last_accessed_at' => now(),
            'expires_at' => now()->addDays(30),
        ]);

        $token = $this->tokenService->generateAccessToken($user, $session->id);

        // Verify token format
        $this->assertMatchesRegularExpression(
            '/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/',
            $token
        );
    }

    /**
     * Test JWT token verification
     */
    public function test_can_verify_valid_access_token(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
        ]);

        $session = Session::create([
            'user_id' => $user->id,
            'refresh_token' => 'test_refresh_token_12345678901234567890',
            'refresh_token_hash' => hash('sha256', 'test_refresh_token_12345678901234567890'),
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test User Agent',
            'device_type' => 'browser',
            'last_accessed_at' => now(),
            'expires_at' => now()->addDays(30),
        ]);

        $token = $this->tokenService->generateAccessToken($user, $session->id);
        $decoded = $this->tokenService->verifyAccessToken($token);

        $this->assertEquals($user->id, $decoded->sub);
        $this->assertEquals($session->id, $decoded->sid);
        $this->assertEquals($user->email, $decoded->email);
    }

    /**
     * Test JWT token verification fails with invalid token
     */
    public function test_verify_token_fails_with_invalid_token(): void
    {
        $this->expectException(\Exception::class);
        $this->tokenService->verifyAccessToken('invalid.token.format');
    }

    /**
     * Test session creation
     */
    public function test_can_create_session_with_jwt_token(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
        ]);

        $result = $this->tokenService->createSession(
            $user,
            '127.0.0.1',
            'Mozilla/5.0 Test',
            ['device_type' => 'mobile', 'browser_name' => 'Chrome']
        );

        $this->assertArrayHasKey('session', $result);
        $this->assertArrayHasKey('access_token', $result);
        $this->assertArrayHasKey('refresh_token', $result);
        $this->assertArrayHasKey('expires_in', $result);
        $this->assertArrayHasKey('token_type', $result);

        $this->assertEquals('Bearer', $result['token_type']);
        $this->assertDatabaseHas('sessions', [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Test refresh token validation
     */
    public function test_can_refresh_access_token(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
        ]);

        $createSessionResult = $this->tokenService->createSession(
            $user,
            '127.0.0.1',
            'Mozilla/5.0 Test'
        );

        $refreshToken = $createSessionResult['refresh_token'];
        sleep(1); // Ensure different timestamp

        $refreshResult = $this->tokenService->refreshAccessToken($refreshToken, '127.0.0.1');

        $this->assertArrayHasKey('access_token', $refreshResult);
        $this->assertArrayHasKey('expires_in', $refreshResult);
        $this->assertArrayHasKey('token_type', $refreshResult);
        $this->assertEquals('Bearer', $refreshResult['token_type']);
    }

    /**
     * Test refresh token fails with invalid token
     */
    public function test_refresh_token_fails_with_invalid_token(): void
    {
        $this->expectException(\Exception::class);
        $this->tokenService->refreshAccessToken('invalid_refresh_token', '127.0.0.1');
    }

    /**
     * Test session revocation
     */
    public function test_can_revoke_session(): void
    {
        $user = User::create([
            'email' => 'test@example.com',
            'name' => 'Test User',
            'password' => Hash::make('Password123'),
        ]);

        $session = Session::create([
            'user_id' => $user->id,
            'refresh_token' => 'test_refresh_token_12345678901234567890',
            'refresh_token_hash' => hash('sha256', 'test_refresh_token_12345678901234567890'),
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test User Agent',
            'device_type' => 'browser',
            'last_accessed_at' => now(),
            'expires_at' => now()->addDays(30),
        ]);

        $this->tokenService->revokeSession($session);

        $this->assertNotNull($session->fresh()->expires_at);
        $this->assertTrue($session->fresh()->expires_at->isPast());
    }

    /**
     * Test TTL parsing with reflection (protected method)
     */
    public function test_can_parse_ttl_strings(): void
    {
        $method = new ReflectionMethod($this->tokenService, 'parseTtl');
        $method->setAccessible(true);

        // Test minutes
        $this->assertEquals(900, $method->invoke($this->tokenService, '15m'));

        // Test hours
        $this->assertEquals(3600, $method->invoke($this->tokenService, '1h'));

        // Test days
        $this->assertEquals(2592000, $method->invoke($this->tokenService, '30d'));
    }

    /**
     * Test device type detection with reflection (protected method)
     */
    public function test_can_detect_device_type(): void
    {
        $method = new ReflectionMethod($this->tokenService, 'detectDeviceType');
        $method->setAccessible(true);

        $mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
        $desktopUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

        $mobileType = $method->invoke($this->tokenService, $mobileUA);
        $desktopType = $method->invoke($this->tokenService, $desktopUA);

        $this->assertEquals('mobile', $mobileType);
        $this->assertEquals('desktop', $desktopType);
    }
}

