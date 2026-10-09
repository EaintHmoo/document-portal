<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Splits "create a brand-new document in this folder" out from "edit an
     * existing document" (metadata edit + re-upload a new version) — they
     * used to be the same can_edit flag.
     */
    public function up(): void
    {
        Schema::table('folder_user', function (Blueprint $table) {
            $table->boolean('can_create')->default(false)->after('can_view');
        });

        // Preserve current behavior: anyone who could already edit could
        // also upload new documents, so keep that true until an admin
        // explicitly narrows it via the access modal.
        DB::table('folder_user')->where('can_edit', true)->update(['can_create' => true]);
    }

    public function down(): void
    {
        Schema::table('folder_user', function (Blueprint $table) {
            $table->dropColumn('can_create');
        });
    }
};
