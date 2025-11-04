<?php

use Illuminate\Support\Facades\Route;

Route::prefix('api/v1')->group(function () {
    // Health check endpoint
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
            'version' => '1.0.0',
        ]);
    })->name('health');

    // Authentication routes (will be implemented in Phase 3+)
    Route::prefix('auth')->group(function () {
        // Registration and confirmation
        // POST /api/v1/auth/register
        // POST /api/v1/auth/email-confirm
        
        // Login and token refresh
        // POST /api/v1/auth/login
        // POST /api/v1/auth/refresh
        // POST /api/v1/auth/logout
    });

    // Protected routes (require middleware)
    Route::middleware('auth:sanctum')->group(function () {
        // User endpoints
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
