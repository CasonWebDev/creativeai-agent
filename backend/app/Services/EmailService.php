<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;

final class EmailService
{
    /**
     * Send email confirmation email.
     *
     * @param User $user
     * @param string $confirmationToken
     */
    public function sendEmailConfirmation(User $user, string $confirmationToken): void
    {
        try {
            $confirmationUrl = config('app.frontend_url') . '/verify-email?token=' . urlencode($confirmationToken);

            $htmlContent = view('emails.confirm-email-html', [
                'user' => $user,
                'confirmationUrl' => $confirmationUrl,
                'expiresIn' => '1 hour',
            ])->render();

            Mail::html(
                $htmlContent,
                function (Message $message) use ($user): void {
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
     * @deprecated Use sendPasswordResetEmail instead
     */
    public function sendPasswordReset(User $user): void
    {
        try {
            // Retrieve the plain token (we only have the hash in DB)
            // In a real implementation, the plain token would be generated and returned
            // For now, we'll generate a new one here
            $resetToken = bin2hex(random_bytes(32));

            $resetUrl = config('app.frontend_url') . '/reset-password?token=' . urlencode($resetToken);

            $htmlContent = view('emails.reset-password-html', [
                'user' => $user,
                'resetUrl' => $resetUrl,
                'expiresIn' => '1 hour',
            ])->render();

            Mail::html(
                $htmlContent,
                function (Message $message) use ($user): void {
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
     * Send password reset email with plain token.
     *
     * @param User $user
     * @param string $plainToken Plain text reset token
     */
    public function sendPasswordResetEmail(User $user, string $plainToken): void
    {
        try {
            $resetUrl = config('app.frontend_url') . '/reset-password?token=' . urlencode($plainToken);

            $htmlContent = view('emails.reset-password-html', [
                'user' => $user,
                'resetUrl' => $resetUrl,
                'expiresIn' => '30 minutes',
            ])->render();

            Mail::html(
                $htmlContent,
                function (Message $message) use ($user): void {
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
     */
    public function sendWelcome(User $user): void
    {
        try {
            $htmlContent = view('emails.welcome', [
                'user' => $user,
                'dashboardUrl' => config('app.frontend_url') . '/dashboard',
            ])->render();

            Mail::html(
                $htmlContent,
                function (Message $message) use ($user): void {
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
     */
    public function sendSessionAlert(User $user, array $sessionInfo): void
    {
        try {
            $htmlContent = view('emails.session-alert', [
                'user' => $user,
                'sessionInfo' => $sessionInfo,
                'manageUrl' => config('app.frontend_url') . '/dashboard/sessions',
            ])->render();

            Mail::html(
                $htmlContent,
                function (Message $message) use ($user): void {
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
