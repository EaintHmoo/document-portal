<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->unsignedInteger('version_number');
            $table->string('disk', 20)->default('s3');
            $table->string('storage_key', 500);
            $table->string('original_filename');
            $table->string('mime_type', 150);
            $table->string('extension', 10);
            $table->unsignedBigInteger('size_bytes');
            $table->char('checksum_sha256', 64);
            $table->string('change_note', 500)->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamp('created_at');

            $table->unique(['document_id', 'version_number']);
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->foreign('current_version_id')
                ->references('id')->on('document_versions')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['current_version_id']);
        });

        Schema::dropIfExists('document_versions');
    }
};
