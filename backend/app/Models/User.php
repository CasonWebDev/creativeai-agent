<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'tier',
        'email_confirmed_at',
        'last_login_at',
        'profile_photo_url',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'email_confirmed_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the user's full name.
     *
     * @return string
     */
    public function getFullNameAttribute(): string
    {
        return $this->name;
    }

    /**
     * Check if user has confirmed email.
     *
     * @return bool
     */
    public function hasConfirmedEmail(): bool
    {
        return $this->email_confirmed_at !== null;
    }

    /**
     * Confirm user's email.
     *
     * @return bool
     */
    public function confirmEmail(): bool
    {
        return $this->update(['email_confirmed_at' => now()]);
    }

    /**
     * Get user's plan tier.
     *
     * @return string
     */
    public function getTier(): string
    {
        return $this->tier ?? 'free';
    }

    /**
     * Relationships
     */

    /**
     * Get all sessions for the user.
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(Session::class);
    }

    /**
     * Get all password reset requests for the user.
     */
    public function passwordResets(): HasMany
    {
        return $this->hasMany(PasswordReset::class);
    }

    /**
     * Get all email confirmations for the user.
     */
    public function emailConfirmations(): HasMany
    {
        return $this->hasMany(EmailConfirmation::class);
    }

    /**
     * Get all usage metrics for the user.
     */
    public function usageMetrics(): HasMany
    {
        return $this->hasMany(UsageMetric::class);
    }

    /**
     * Get all API tokens for the user.
     */
    public function apiTokens(): HasMany
    {
        return $this->hasMany(ApiToken::class);
    }

    /**
     * Get all audit logs for the user.
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }
}
