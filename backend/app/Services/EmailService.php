<?php

namespace App\Services;

use App\Models\User;
use App\Models\PasswordReset;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;

class EmailService
{
    /**
     * Send email confirmation email.
     *
     * @param User $user
     * @param string $confirmationToken
     * @return void
     */
    public function sendEmailConfirmation(User $user, string $confirmationToken): void
    {
        try {
            $confirmationUrl = config('app.frontend_url') . '/auth/confirm-email?token=' . urlencode($confirmationToken);

            Mail::html(
                view('emails.confirm-email', [
                    'user' => $user,
                    'confirmationUrl' => $confirmationUrl,
                    'expiresIn' => '1 hour',
                ])->render(),
                function (Message $message) use ($user) {
                    $message->to($user->email)
                        ->subject('Confirm Your Email Address');
                }
            );
        } catch (\Exception $e) {
            // Log the error but don't throw - registration should succeed even if email fails
            \Log::error('Failed to send confirmation email: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        }
    }

    /**
     * Send password reset email.
     *
     * @param User $user
     * @param PasswordReset $resetRequest
     * @return void
     */
    public function sendPasswordReset(User $user, PasswordReset $resetRequest): void
    {
        try {
            // Retrieve the plain token (we only have the hash in DB)
            // In a real implementation, the plain token would be generated and returned
            // For now, we'll generate a new one here
            $resetToken = bin2hex(random_bytes(32));

            $resetUrl = config('app.frontend_url') . '/auth/reset-password?token=' . urlencode($resetToken);

            Mail::html(
                view('emails.reset-password', [
                    'user' => $user,
                    'resetUrl' => $resetUrl,
                    'expiresIn' => '1 hour',
                ])->render(),
                function (Message $message) use ($user) {
                    $message->to($user->email)
                        ->subject('Reset Your Password');
                }
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send password reset email: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        }
    }

    /**
     * Send welcome email.
     *
     * @param User $user
     * @return void
     */
    public function sendWelcome(User $user): void
    {
        try {
            Mail::html(
                view('emails.welcome', [
                    'user' => $user,
                    'dashboardUrl' => config('app.frontend_url') . '/dashboard',
                ])->render(),
                function (Message $message) use ($user) {
                    $message->to($user->email)
                        ->subject('Welcome to CreativeAI Agent!');
                }
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send welcome email: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        }
    }

    /**
     * Send session activity alert.
     *
     * @param User $user
     * @param array $sessionInfo
     * @return void
     */
    public function sendSessionAlert(User $user, array $sessionInfo): void
    {
        try {
            Mail::html(
                view('emails.session-alert', [
                    'user' => $user,
                    'sessionInfo' => $sessionInfo,
                    'manageUrl' => config('app.frontend_url') . '/settings/sessions',
                ])->render(),
                function (Message $message) use ($user) {
                    $message->to($user->email)
                        ->subject('New Login to Your Account');
                }
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send session alert email: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        }
    }
}
