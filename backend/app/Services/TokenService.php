<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Session;
use App\Models\User;
use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

final class TokenService
{
    /**
     * Create a new session and return JWT tokens.
     *
     * @return array<string, mixed> Session with tokens
     */
    public function createSession(User $user, string $ipAddress, string $userAgent, array $deviceInfo = []): array
    {
        // Parse device info
        $deviceType = $deviceInfo['device_type'] ?? $this->detectDeviceType($userAgent);
        $rememberDevice = $deviceInfo['remember_device'] ?? false;

        // Calculate session expiration
        $expiresAt = $rememberDevice
            ? now()->addDays(90)
            : now()->addDays(30);

        // Generate refresh token
        $refreshToken = $this->generateRefreshToken($user->id);
        $refreshTokenHash = hash('sha256', $refreshToken);

        // Create session record
        $session = Session::create([
            'user_id' => $user->id,
            'refresh_token' => $refreshTokenHash,
            'device_type' => $deviceType,
            'browser_name' => $deviceInfo['browser_name'] ?? null,
            'os_name' => $deviceInfo['os_name'] ?? null,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'device_remember' => $rememberDevice,
            'last_accessed_at' => now(),
            'expires_at' => $expiresAt,
        ]);

        // Generate access token (short-lived)
        $accessToken = $this->generateAccessToken($user, $session->id);

        return [
            'session' => $session,
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'expires_in' => config('auth.jwt_access_token_ttl'),
            'token_type' => 'Bearer',
        ];
    }

    /**
     * Refresh an access token using a refresh token.
     *
     * @param string $refreshToken Plain text refresh token
     * @return array<string, mixed> New access token and updated session info
     * @throws Exception
     */
    public function refreshAccessToken(string $refreshToken): array
    {
        $refreshTokenHash = hash('sha256', $refreshToken);

        // Find active session with this refresh token
        $session = Session::where('refresh_token', $refreshTokenHash)
            ->active()
            ->first();

        if (! $session) {
            throw new Exception('Invalid or expired refresh token.');
        }

        // Update last accessed time
        $session->updateLastAccessed();

        // Generate new access token
        $user = $session->user;
        $accessToken = $this->generateAccessToken($user, $session->id);

        return [
            'access_token' => $accessToken,
            'expires_in' => config('auth.jwt_access_token_ttl'),
            'token_type' => 'Bearer',
        ];
    }

    /**
     * Generate a JWT access token.
     *
     * @return string JWT token
     */
    public function generateAccessToken(User $user, int $sessionId): string
    {
        $now = time();
        $ttl = $this->parseTtl(config('auth.jwt_access_token_ttl', '15m'));

        $payload = [
            'iat' => $now,
            'exp' => $now + $ttl,
            'sub' => (string) $user->id,
            'sid' => $sessionId,
            'email' => $user->email,
            'tier' => $user->tier,
        ];

        return JWT::encode(
            $payload,
            $this->getPrivateKey(),
            'RS256'
        );
    }

    /**
     * Verify and decode a JWT access token.
     *
     * @return object Decoded token payload
     * @throws Exception
     */
    public function verifyAccessToken(string $token): object
    {
        try {
            return JWT::decode(
                $token,
                new Key($this->getPublicKey(), 'RS256')
            );
        } catch (Exception $e) {
            throw new Exception('Invalid token: ' . $e->getMessage());
        }
    }

    /**
     * Revoke a session (logout).
     */
    public function revokeSession(Session $session): void
    {
        $session->update([
            'expires_at' => now(),
        ]);
    }

    /**
     * Revoke all sessions for a user.
     */
    public function revokeAllSessions(User $user): int
    {
        return $user->sessions()
            ->active()
            ->update(['expires_at' => now()]);
    }

    /**
     * Get or generate RSA private key.
     *
     * @return string Private key PEM
     */
    protected function getPrivateKey(): string
    {
        $keyPath = config('auth.jwt_private_key_path', 'storage/keys/private.key');
        $fullPath = storage_path(str_replace('storage/', '', $keyPath));

        if (file_exists($fullPath)) {
            return file_get_contents($fullPath);
        }

        return $this->generateKeyPair();
    }

    /**
     * Get RSA public key.
     *
     * @return string Public key PEM
     */
    protected function getPublicKey(): string
    {
        $keyPath = config('auth.jwt_public_key_path', 'storage/keys/public.key');
        $fullPath = storage_path(str_replace('storage/', '', $keyPath));

        if (! file_exists($fullPath)) {
            throw new Exception('Public key not found. Generate keys first.');
        }

        return file_get_contents($fullPath);
    }

    /**
     * Generate RSA key pair for JWT signing.
     *
     * @return string Private key (also saves public key)
     */
    protected function generateKeyPair(): string
    {
        $privateKey = openssl_pkey_new([
            'private_key_bits' => 2048,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ]);

        openssl_pkey_export($privateKey, $privateKeyPem);
        $publicKeyDetails = openssl_pkey_get_details($privateKey);
        $publicKeyPem = $publicKeyDetails['key'];

        // Store keys
        $keyDir = storage_path('keys');
        if (! is_dir($keyDir)) {
            mkdir($keyDir, 0755, true);
        }

        file_put_contents($keyDir . '/private.key', $privateKeyPem, LOCK_EX);
        file_put_contents($keyDir . '/public.key', $publicKeyPem, LOCK_EX);

        chmod($keyDir . '/private.key', 0600);
        chmod($keyDir . '/public.key', 0644);

        return $privateKeyPem;
    }

    /**
     * Generate a refresh token.
     *
     * @return string Random refresh token
     */
    protected function generateRefreshToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    /**
     * Parse TTL string to seconds.
     *
     * @param string $ttl e.g., "15m", "1h", "30d"
     * @return int Seconds
     */
    protected function parseTtl(string $ttl): int
    {
        if (preg_match('/^(\d+)([mhd])$/', $ttl, $matches)) {
            $value = (int) $matches[1];
            $unit = $matches[2];

            return match ($unit) {
                'm' => $value * 60,
                'h' => $value * 3600,
                'd' => $value * 86400,
                default => 900, // default 15 minutes
            };
        }

        return 900;
    }

    /**
     * Detect device type from user agent.
     */
    protected function detectDeviceType(string $userAgent): string
    {
        if (preg_match('/mobile|android|iphone|ipad|phone/i', $userAgent)) {
            return 'mobile';
        }

        if (preg_match('/windows|mac|linux/i', $userAgent)) {
            return 'desktop';
        }

        return 'browser';
    }
}
