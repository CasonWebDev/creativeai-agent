@component('mail::message')
# New Login Activity

Hi {{ $user->name }},

We detected a new login on your account:

**Device:** {{ $sessionInfo['device_type'] ?? 'Unknown' }}<br>
**Browser:** {{ $sessionInfo['browser_name'] ?? 'Unknown' }}<br>
**Operating System:** {{ $sessionInfo['os_name'] ?? 'Unknown' }}<br>
**IP Address:** {{ $sessionInfo['ip_address'] ?? 'Unknown' }}<br>
**Time:** {{ \Carbon\Carbon::now()->format('F j, Y \a\t g:i A e') }}

If this wasn't you, please secure your account immediately by resetting your password.

@component('mail::button', ['url' => route('auth.resetPassword')])
Reset Password
@endcomponent

For security purposes, we recommend:
- Using a strong, unique password
- Enabling two-factor authentication if available
- Reviewing your login history regularly

Thanks,<br>
The CreativeAI Security Team

@endcomponent
