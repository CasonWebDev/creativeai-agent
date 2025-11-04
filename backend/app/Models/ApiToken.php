<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiToken extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'token_hash',
        'name',
        'scopes',
        'last_used_at',
        'revoked_at',
        'expires_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'scopes' => 'array',
        'last_used_at' => 'datetime',
        'revoked_at' => 'datetime',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    /**
     * Relationships
     */

    /**
     * Get the user that owns the API token.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scopes
     */

    /**
     * Scope to get only active (not revoked) tokens.
     */
    public function scopeActive($query)
    {
        return $query->whereNull('revoked_at');
    }

    /**
     * Scope to get tokens for a specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get tokens with a specific scope.
     */
    public function scopeWithScope($query, $scope)
    {
        return $query->whereRaw("JSON_CONTAINS(scopes, '\"' || ? || '\"')", [$scope]);
    }

    /**
     * Helpers
     */

    /**
     * Check if the token is still active.
     */
    public function isActive(): bool
    {
        return $this->revoked_at === null && 
               ($this->expires_at === null || $this->expires_at->isFuture());
    }

    /**
     * Check if the token has been revoked.
     */
    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }

    /**
     * Check if the token has expired.
     */
    public function hasExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    /**
     * Check if token has a specific scope.
     */
    public function hasScope(string $scope): bool
    {
        return in_array($scope, $this->scopes ?? []);
    }

    /**
     * Check if token has all required scopes.
     */
    public function hasAllScopes(array $requiredScopes): bool
    {
        return count(array_intersect($requiredScopes, $this->scopes ?? [])) === count($requiredScopes);
    }

    /**
     * Check if token has any of the required scopes.
     */
    public function hasAnyScope(array $requiredScopes): bool
    {
        return count(array_intersect($requiredScopes, $this->scopes ?? [])) > 0;
    }

    /**
     * Update the last used timestamp.
     */
    public function updateLastUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }

    /**
     * Revoke the token.
     */
    public function revoke(): void
    {
        $this->update(['revoked_at' => now()]);
    }

    /**
     * Allowed scopes for API tokens
     */
    public static function getAllowedScopes(): array
    {
        return [
            'read:profile',
            'write:profile',
            'read:usage',
            'generate:images',
            'generate:videos',
            'read:results',
            'admin:read',
        ];
    }
}
