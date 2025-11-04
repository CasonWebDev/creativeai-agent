<?php

declare(strict_types=1);

/**
 * @OA\OpenApi(
 *   openapi="3.0.0"
 * )
 * 
 * @OA\Info(
 *   title="CreativeAI Agent API",
 *   version="1.0.0",
 *   description="RESTful API for CreativeAI Agent - User Authentication, Email Verification, and Password Management",
 *   @OA\Contact(name="CreativeAI Support", email="support@creativeai.com"),
 *   @OA\License(name="MIT", url="https://opensource.org/licenses/MIT")
 * )
 *
 * @OA\Server(url="http://localhost:8000", description="Development Server")
 * @OA\Server(url="https://api.creativeai.com", description="Production Server")
 *
 * @OA\SecurityScheme(
 *   type="http",
 *   scheme="bearer",
 *   bearerFormat="JWT",
 *   securityScheme="BearerToken"
 * )
 */
