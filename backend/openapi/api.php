<?php

declare(strict_types=1);

/**
 * @OA\OpenApi(
 *   openapi="3.0.0",
 *   @OA\Info(
 *     title="CreativeAI Agent API",
 *     version="1.0.0",
 *     description="RESTful API for CreativeAI Agent - User Authentication, Email Verification, and Password Management",
 *     @OA\Contact(name="CreativeAI Support", email="support@creativeai.com"),
 *     @OA\License(name="MIT", url="https://opensource.org/licenses/MIT")
 *   ),
 *   @OA\Server(url="http://localhost:8000", description="Development Server"),
 *   @OA\Server(url="https://api.creativeai.com", description="Production Server"),
 *   @OA\SecurityScheme(
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     securityScheme="BearerToken",
 *     description="JWT Bearer Token"
 *   )
 * )
 */

/**
 * @OA\Schema(
 *   schema="User",
 *   type="object",
 *   @OA\Property(property="id", type="integer"),
 *   @OA\Property(property="name", type="string"),
 *   @OA\Property(property="email", type="string"),
 *   @OA\Property(property="tier", type="string"),
 *   @OA\Property(property="email_confirmed_at", type="string", format="date-time", nullable=true),
 *   @OA\Property(property="last_login_at", type="string", format="date-time", nullable=true),
 *   @OA\Property(property="created_at", type="string", format="date-time"),
 *   @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */

/**
 * @OA\Schema(
 *   schema="ErrorResponse",
 *   type="object",
 *   @OA\Property(property="success", type="boolean"),
 *   @OA\Property(property="message", type="string"),
 *   @OA\Property(property="errors", type="object")
 * )
 */
