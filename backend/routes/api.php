<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    // Health check endpoint
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
            'version' => '1.0.0',
        ]);
    })->name('health');

    // Public authentication routes
    Route::prefix('auth')->group(function (): void {
        // Registration and confirmation
        Route::post('/register', [AuthController::class, 'register'])
            ->name('auth.register');
        Route::post('/confirm-email', [AuthController::class, 'confirmEmail'])
            ->name('auth.confirmEmail');

        // Login and token refresh
        Route::post('/login', [AuthController::class, 'login'])
            ->name('auth.login');
        Route::post('/refresh', [AuthController::class, 'refresh'])
            ->name('auth.refresh');

        // Password reset
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
            ->name('auth.forgotPassword');
        Route::post('/verify-reset-token', [AuthController::class, 'verifyResetToken'])
            ->name('auth.verifyResetToken');
        Route::post('/reset-password', [AuthController::class, 'resetPassword'])
            ->name('auth.resetPassword');
    });

    // Protected routes (require JWT authentication)
    Route::middleware(\App\Http\Middleware\JwtMiddleware::class)->group(function (): void {
        // Auth routes
        Route::prefix('auth')->group(function (): void {
            Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
            Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
        });

        // User endpoints (to be implemented)
        // GET /api/v1/users/profile

        // PUT /api/v1/users/profile

        // Session management
        // GET /api/v1/sessions
        // DELETE /api/v1/sessions/{id}

        // Plan endpoints
        // GET /api/v1/plan

        // API tokens
        // POST /api/v1/api-tokens
        // GET /api/v1/api-tokens
    });
});
