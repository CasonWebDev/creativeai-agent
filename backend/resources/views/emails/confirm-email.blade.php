@component('mail::message')
# Confirm Your Email

Hi {{ $user->name }},

Thank you for registering with CreativeAI. To complete your registration, please confirm your email address by clicking the button below.

@component('mail::button', ['url' => $confirmationUrl])
Confirm Email
@endcomponent

This link will expire in {{ $expiresIn }}.

If you did not create this account, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}

@endcomponent
