<x-emails.layout>
    <h1 style="font-size:18px; font-weight:700; color:#1e293b; margin:0 0 12px;">
        {{ $isRegistration ? 'Verify your email address' : 'Reset your password' }}
    </h1>
    <p style="font-size:14px; color:#475569; line-height:1.6; margin:0 0 20px;">
        {{ $isRegistration
            ? 'Enter this code to finish creating your Document Portal account:'
            : 'Enter this code to choose a new password for your Document Portal account:' }}
    </p>
    <p style="font-size:30px; font-weight:700; letter-spacing:8px; color:#1e293b; background-color:#f1f5f9; border-radius:8px; padding:16px; text-align:center; margin:0 0 20px; font-family:'SFMono-Regular',Menlo,Consolas,monospace;">
        {{ $code }}
    </p>
    <p style="font-size:13px; color:#64748b; line-height:1.6; margin:0 0 8px;">
        This code expires in {{ $expiresMinutes }} minutes and can only be used once.
    </p>
    <p style="font-size:13px; color:#64748b; line-height:1.6; margin:0;">
        If you didn't request this, you can safely ignore this email. Never share this code with anyone.
    </p>
</x-emails.layout>
