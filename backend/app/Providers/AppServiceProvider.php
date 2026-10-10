<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // One password policy for registration, reset and change — the
        // frontend's strength checklist mirrors these rules.
        Password::defaults(fn () => Password::min(8)->mixedCase()->numbers());

        Gate::before(fn (User $user) => $user->isAdmin() ? true : null);

        // Admins pass via Gate::before above; everyone else is denied — only
        // admins may view the system-wide activity history (spec §7).
        Gate::define('viewActivityLog', fn (User $user) => false);
    }
}
