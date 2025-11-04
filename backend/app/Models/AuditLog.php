<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
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
        'action',
        'ip_address',
        'user_agent',
        'success',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'success' => 'boolean',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Relationships
     */

    /**
     * Get the user associated with the audit log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withTrashed();
    }

    /**
     * Scopes
     */

    /**
     * Scope to get logs for a specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get logs for a specific action.
     */
    public function scopeForAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope to get logs from a specific IP address.
     */
    public function scopeFromIp($query, $ipAddress)
    {
        return $query->where('ip_address', $ipAddress);
    }

    /**
     * Scope to get only successful logs.
     */
    public function scopeSuccessful($query)
    {
        return $query->where('success', true);
    }

    /**
     * Scope to get only failed logs.
     */
    public function scopeFailed($query)
    {
        return $query->where('success', false);
    }

    /**
     * Scope to get recent logs.
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Helpers
     */

    /**
     * Get human-readable action label.
     */
    public function getActionLabel(): string
    {
        $labels = [
            'login_success' => 'Login Successful',
            'login_failed' => 'Login Failed',
            'logout' => 'Logout',
            'register' => 'Registration',
            'email_confirmed' => 'Email Confirmed',
            'password_reset_requested' => 'Password Reset Requested',
            'password_reset_completed' => 'Password Reset Completed',
            'profile_updated' => 'Profile Updated',
            'session_terminated' => 'Session Terminated',
            'api_token_created' => 'API Token Created',
            'api_token_revoked' => 'API Token Revoked',
            'rate_limit_exceeded' => 'Rate Limit Exceeded',
        ];

        return $labels[$this->action] ?? ucwords(str_replace('_', ' ', $this->action));
    }

    /**
     * Get a descriptive message including metadata.
     */
    public function getDescriptiveMessage(): string
    {
        $base = $this->getActionLabel();
        
        if (!$this->success) {
            $base .= ' (Failed)';
        }

        if ($this->metadata && isset($this->metadata['error'])) {
            $base .= ' - ' . $this->metadata['error'];
        }

        return $base;
    }

    /**
     * Static helper to log an action
     */
    public static function logAction(
        ?int $userId,
        string $action,
        string $ipAddress,
        string $userAgent,
        bool $success = true,
        ?array $metadata = null
    ): self {
        return self::create([
            'user_id' => $userId,
            'action' => $action,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'success' => $success,
            'metadata' => $metadata,
        ]);
    }
}
