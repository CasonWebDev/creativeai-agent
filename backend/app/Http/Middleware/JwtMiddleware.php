<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\TokenService;
use App\Models\User;

class JwtMiddleware
{
    protected TokenService $tokenService;

    public function __construct(TokenService $tokenService)
    {
        $this->tokenService = $tokenService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $token = $this->getTokenFromRequest($request);

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Token not provided.',
            ], 401);
        }

        try {
            // Verify and decode the token
            $decoded = $this->tokenService->verifyAccessToken($token);

            // Find the user
            $user = User::findOrFail($decoded->sub);

            // Create a fake "token" entry for Sanctum compatibility
            $user->forceFill([
                'api_token' => $token,
            ]);

            // Set the authenticated user on the 'api' guard
            Auth::guard('api')->setUser($user);

            // Also make sure request->user() works
            $request->setUserResolver(function () use ($user) {
                return $user;
            });

            // Store token info in request for later use
            $request->attributes->set('token_data', $decoded);

            return $next($request);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token: ' . $e->getMessage(),
            ], 401);
        }
    }

    /**
     * Extract token from Authorization header.
     *
     * @param  Request  $request
     * @return string|null
     */
    protected function getTokenFromRequest(Request $request): ?string
    {
        $authorization = $request->header('Authorization');

        if (!$authorization) {
            return null;
        }

        if (strpos($authorization, 'Bearer ') === 0) {
            return substr($authorization, 7);
        }

        return null;
    }
}
