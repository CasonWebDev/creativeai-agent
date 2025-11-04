<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

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
}
