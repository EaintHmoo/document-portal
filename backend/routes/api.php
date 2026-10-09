<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\FolderController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::apiResource('folders', FolderController::class)->parameters(['folders' => 'folder']);
    Route::get('/folders/{folder}/access', [FolderController::class, 'access']);
    Route::put('/folders/{folder}/access', [FolderController::class, 'syncAccess']);

    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents', [DocumentController::class, 'store']);
    Route::get('/documents/{uuid}', [DocumentController::class, 'show']);
    Route::patch('/documents/{uuid}', [DocumentController::class, 'update']);
    Route::delete('/documents/{uuid}', [DocumentController::class, 'destroy']);
    Route::post('/documents/{uuid}/versions', [DocumentController::class, 'storeVersion']);
    Route::get('/documents/{uuid}/download', [DocumentController::class, 'download']);
});
