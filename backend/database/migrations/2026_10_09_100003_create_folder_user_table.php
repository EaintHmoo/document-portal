<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('folder_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('folder_id')->constrained('folders')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('permission', ['view', 'edit']);
            $table->foreignId('granted_by')->constrained('users');
            $table->timestamps();

            $table->unique(['folder_id', 'user_id']);
            $table->index(['user_id', 'folder_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('folder_user');
    }
};
