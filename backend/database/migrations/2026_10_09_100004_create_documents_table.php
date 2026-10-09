<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('folder_id')->constrained('folders')->restrictOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('extension', 10);
            $table->string('mime_type', 150);
            $table->unsignedBigInteger('size_bytes');
            $table->unsignedBigInteger('current_version_id')->nullable();
            $table->unsignedInteger('version_count')->default(0);
            $table->foreignId('uploaded_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['folder_id', 'deleted_at', 'created_at']);
            $table->index('extension');
            $table->index('title');
            $table->fullText(['title', 'description']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
