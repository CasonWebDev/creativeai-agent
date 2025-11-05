<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .email-container {
            background-color: white;
            margin: 20px auto;
            padding: 40px;
            border-radius: 8px;
            max-width: 600px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            margin-top: 0;
        }
        .button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
            font-weight: bold;
        }
        .button:hover {
            background-color: #2563eb;
        }
        .footer {
            border-top: 1px solid #eee;
            margin-top: 40px;
            padding-top: 20px;
            font-size: 12px;
            color: #666;
        }
        .expiry {
            background-color: #f0f0f0;
            padding: 10px;
            border-left: 4px solid #3b82f6;
            margin: 20px 0;
            font-size: 14px;
        }
        .warning {
            background-color: #fff3cd;
            padding: 10px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <h1>Reset Your Password</h1>
        
        <p>Hi {{ $user->name }},</p>
        
        <p>We received a request to reset your password. Click the button below to create a new password.</p>
        
        <center>
            <a href="{{ $resetUrl }}" class="button">Reset Password</a>
        </center>
        
        <div class="expiry">
            <strong>⏱️ Important:</strong> This link will expire in {{ $expiresIn }}.
        </div>
        
        <div class="warning">
            <strong>⚠️ Security Note:</strong> If you didn't request a password reset, please ignore this email. Your account is safe.
        </div>
        
        <p>If the button above doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; font-size: 12px; color: #666;">{{ $resetUrl }}</p>
        
        <div class="footer">
            <p>Best regards,<br>{{ config('app.name') }}</p>
            <p>© {{ now()->year }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
