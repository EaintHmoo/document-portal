<?php

use App\Exceptions\AccountDeactivatedException;
use App\Exceptions\ConflictException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();

        // SPA has no server-side login page: API guests get a 401 JSON response
        // instead of a redirect to route('login').
        $middleware->redirectGuestsTo(
            fn (Request $request) => $request->is('api/*') ? null : '/'
        );

    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(fn (ConflictException $e) => response()->json([
            'message' => $e->getMessage(),
        ], 409));

        $exceptions->render(fn (AccountDeactivatedException $e) => response()->json([
            'message' => $e->getMessage(),
        ], 403));

        // Thrown before validation runs, when the body exceeds PHP's
        // post_max_size — the default message ("The POST data is too
        // large.") means nothing to someone uploading a document.
        $exceptions->render(fn (PostTooLargeException $e, Request $request) => $request->is('api/*')
            ? response()->json(['message' => 'The file is too large. Documents can be at most 20 MB.'], 413)
            : null);
    })->create();
