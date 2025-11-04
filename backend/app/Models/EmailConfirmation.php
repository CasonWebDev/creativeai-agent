<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailConfirmation extends Model
{
    use HasFactory;

    const UPDATED_AT = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'email',
        'token_hash',
        'expires_at',
        'confirmed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'expires_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    /**
     * Relationships
     */

    /**
     * Get the user associated with the email confirmation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scopes
     */

    /**
     * Scope to get only pending (not confirmed) email confirmations.
     */
    public function scopePending($query)
    {
        return $query->whereNull('confirmed_at')->where('expires_at', '>', now());
    }

    /**
     * Scope to get confirmations for a specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Helpers
     */

    /**
     * Check if the confirmation token is still valid.
     */
    public function isValid(): bool
    {
        return $this->confirmed_at === null && $this->expires_at->isFuture();
    }

    /**
     * Check if the confirmation has expired.
     */
    public function hasExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if the email has been confirmed.
     */
    public function isConfirmed(): bool
    {
        return $this->confirmed_at !== null;
    }

    /**
     * Mark the email as confirmed.
     */
    public function markAsConfirmed(): void
    {
        $this->update(['confirmed_at' => now()]);
        $this->user->confirmEmail();
    }
}
