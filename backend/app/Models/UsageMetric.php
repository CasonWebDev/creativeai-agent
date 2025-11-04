<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsageMetric extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'year_month',
        'metric_type',
        'count',
        'tier_limit',
        'last_reset_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'count' => 'integer',
        'tier_limit' => 'integer',
        'last_reset_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationships
     */

    /**
     * Get the user associated with the usage metric.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scopes
     */

    /**
     * Scope to get metrics for a specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get metrics for a specific month.
     */
    public function scopeForMonth($query, $yearMonth)
    {
        return $query->where('year_month', $yearMonth);
    }

    /**
     * Scope to get metrics for a specific type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('metric_type', $type);
    }

    /**
     * Helpers
     */

    /**
     * Check if the user has reached the usage limit for this metric.
     */
    public function isLimitReached(): bool
    {
        return $this->count >= $this->tier_limit;
    }

    /**
     * Get remaining usage quota.
     */
    public function getRemainingQuota(): int
    {
        return max(0, $this->tier_limit - $this->count);
    }

    /**
     * Get percentage of quota used.
     */
    public function getUsagePercentage(): float
    {
        if ($this->tier_limit === 0) {
            return 0;
        }
        return round($this->count / $this->tier_limit * 100, 2);
    }

    /**
     * Increment usage count.
     */
    public function incrementUsage(int $amount = 1): void
    {
        $this->increment('count', $amount);
    }

    /**
     * Reset usage count for new month.
     */
    public function resetUsage(): void
    {
        $this->update([
            'count' => 0,
            'last_reset_at' => now(),
        ]);
    }

    /**
     * Tier limit mappings
     */
    public static function getTierLimit(string $tier, string $metricType): int
    {
        $limits = [
            'free' => [
                'images' => 10,
                'videos' => 5,
                'api_calls' => 100,
            ],
            'pro' => [
                'images' => 200,
                'videos' => 50,
                'api_calls' => 10000,
            ],
            'enterprise' => [
                'images' => 999999,
                'videos' => 999999,
                'api_calls' => 999999,
            ],
        ];

        return $limits[$tier][$metricType] ?? 0;
    }
}
