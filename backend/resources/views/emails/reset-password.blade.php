@component('mail::message')
# Reset Your Password

Hi {{ $user->name }},

We received a request to reset your password. Click the button below to set a new password.

@component('mail::button', ['url' => $resetUrl])
Reset Password
@endcomponent

This link will expire in {{ $expiresIn }}. If you didn't request a password reset, you can ignore this email.

Thanks,<br>
{{ config('app.name') }}

@endcomponent
