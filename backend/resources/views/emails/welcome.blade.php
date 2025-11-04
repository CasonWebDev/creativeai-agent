@component('mail::message')
# Welcome to CreativeAI!

Hi {{ $user->name }},

Welcome to CreativeAI! Your account has been successfully confirmed and is ready to use.

You can now log in to access all the features:

@component('mail::button', ['url' => $dashboardUrl])
Login to Your Account
@endcomponent

**Your Tier:** {{ ucfirst($user->tier) }}

If you have any questions or need assistance, please don't hesitate to reach out to our support team.

Thanks,<br>
The CreativeAI Team

@endcomponent
