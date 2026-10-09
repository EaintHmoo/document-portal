<x-emails.layout>
    <h1 style="font-size:18px; font-weight:700; color:#1e293b; margin:0 0 12px;">Account reactivated</h1>
    <p style="font-size:14px; color:#475569; line-height:1.6; margin:0 0 16px;">
        Hi {{ $user->name }},
    </p>
    <p style="font-size:14px; color:#475569; line-height:1.6; margin:0 0 16px;">
        Good news — your Document Portal account ({{ $user->email }}) has been reactivated. You can
        sign in again right away.
    </p>
    <p style="font-size:14px; color:#475569; line-height:1.6; margin:0;">
        If you have any trouble signing in, please contact your administrator.
    </p>
</x-emails.layout>
