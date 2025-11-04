<?php

declare(strict_types=1);

/**
 * @OA\Post(
 *   path="/api/v1/auth/register",
 *   summary="Register a new user",
 *   description="Create a new user account with email and password",
 *   tags={"Authentication"},
 *   @OA\RequestBody(
 *     required=true,
 *     @OA\JsonContent(
 *       required={"name", "email", "password"},
 *       @OA\Property(property="name", type="string", example="John Doe"),
 *       @OA\Property(property="email", type="string", format="email", example="john@example.com"),
 *       @OA\Property(property="password", type="string", format="password", example="SecurePass123!"),
 *       @OA\Property(property="tier", type="string", example="free")
 *     )
 *   ),
 *   @OA\Response(response=201, description="User registered successfully"),
 *   @OA\Response(response=422, description="Validation error", @OA\JsonContent(ref="#/components/schemas/ErrorResponse"))
 * )
 */

/**
 * @OA\Post(
 *   path="/api/v1/auth/confirm-email",
 *   summary="Confirm user email",
 *   tags={"Authentication"},
 *   @OA\RequestBody(
 *     required=true,
 *     @OA\JsonContent(
 *       required={"token"},
 *       @OA\Property(property="token", type="string")
 *     )
 *   ),
 *   @OA\Response(response=200, description="Email confirmed successfully"),
 *   @OA\Response(response=422, description="Invalid token", @OA\JsonContent(ref="#/components/schemas/ErrorResponse"))
 * )
 */

/**
 * @OA\Post(
 *   path="/api/v1/auth/login",
 *   summary="User login",
 *   tags={"Authentication"},
 *   @OA\RequestBody(
 *     required=true,
 *     @OA\JsonContent(
 *       required={"email", "password"},
 *       @OA\Property(property="email", type="string", format="email"),
 *       @OA\Property(property="password", type="string", format="password"),
 *       @OA\Property(property="device_remember", type="boolean"),
 *       @OA\Property(property="browser_name", type="string"),
 *       @OA\Property(property="os_name", type="string")
 *     )
 *   ),
 *   @OA\Response(response=200, description="Login successful"),
 *   @OA\Response(response=401, description="Invalid credentials", @OA\JsonContent(ref="#/components/schemas/ErrorResponse"))
 * )
 */

/**
 * @OA\Post(
 *   path="/api/v1/auth/refresh",
 *   summary="Refresh access token",
 *   tags={"Authentication"},
 *   @OA\RequestBody(
 *     required=true,
 *     @OA\JsonContent(
 *       required={"refresh_token"},
 *       @OA\Property(property="refresh_token", type="string")
 *     )
 *   ),
 *   @OA\Response(response=200, description="Token refreshed successfully"),
 *   @OA\Response(response=401, description="Invalid refresh token", @OA\JsonContent(ref="#/components/schemas/ErrorResponse"))
 * )
 */

/**
 * @OA\Post(
 *   path="/api/v1/auth/logout",
 *   summary="User logout",
 *   tags={"Authentication"},
 *   security={{"BearerToken": {}}},
 *   @OA\Response(response=200, description="Logout successful"),
 *   @OA\Response(response=401, description="Unauthorized", @OA\JsonContent(ref="#/components/schemas/ErrorResponse"))
 * )
 */

/**
 * @OA\Get(
 *   path="/api/v1/auth/me",
 *   summary="Get current user",
 *   tags={"Authentication"},
 *   security={{"BearerToken": {}}},
 *   @OA\Response(response=200, description="Current user information"),
 *   @OA\Response(response=401, description="Unauthorized", @OA\JsonContent(ref="#/components/schemas/ErrorResponse"))
 * )
 */

/**
 * @OA\Post(
 *   path="/api/v1/auth/forgot-password",
 *   summary="Request password reset",
 *   tags={"Password Reset"},
 *   @OA\RequestBody(
 *     required=true,
 *     @OA\JsonContent(
 *       required={"email"},
 *       @OA\Property(property="email", type="string", format="email")
 *     )
 *   ),
 *   @OA\Response(response=200, description="Reset link sent to email"),
 *   @OA\Response(response=422, description="Validation error", @OA\JsonContent(ref="#/components/schemas/ErrorResponse"))
 * )
 */

/**
 * @OA\Post(
 *   path="/api/v1/auth/verify-reset-token",
 *   summary="Verify password reset token",
 *   tags={"Password Reset"},
 *   @OA\RequestBody(
 *     required=true,
 *     @OA\JsonContent(
 *       required={"token"},
 *       @OA\Property(property="token", type="string")
 *     )
 *   ),
 *   @OA\Response(response=200, description="Token is valid"),
 *   @OA\Response(response=422, description="Invalid token", @OA\JsonContent(ref="#/components/schemas/ErrorResponse"))
 * )
 */

/**
 * @OA\Post(
 *   path="/api/v1/auth/reset-password",
 *   summary="Reset password",
 *   tags={"Password Reset"},
 *   @OA\RequestBody(
 *     required=true,
 *     @OA\JsonContent(
 *       required={"token", "password"},
 *       @OA\Property(property="token", type="string"),
 *       @OA\Property(property="password", type="string", format="password")
 *     )
 *   ),
 *   @OA\Response(response=200, description="Password reset successful"),
 *   @OA\Response(response=422, description="Validation error", @OA\JsonContent(ref="#/components/schemas/ErrorResponse"))
 * )
 */
