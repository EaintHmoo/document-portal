<x-emails.layout>
    <h1 style="font-size:18px; font-weight:700; color:#1e293b; margin:0 0 12px;">Account deactivated</h1>
    <p style="font-size:14px; color:#475569; line-height:1.6; margin:0 0 16px;">
        Hi {{ $user->name }},
    </p>
    <p style="font-size:14px; color:#475569; line-height:1.6; margin:0 0 16px;">
        Your Document Portal account ({{ $user->email }}) has been deactivated by an administrator.
        You will not be able to sign in until it's reactivated.
    </p>
    <p style="font-size:14px; color:#475569; line-height:1.6; margin:0;">
        If you believe this is a mistake, please contact your administrator.
    </p>
</x-emails.layout>
