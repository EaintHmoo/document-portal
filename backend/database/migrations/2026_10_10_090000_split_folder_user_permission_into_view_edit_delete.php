<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Replaces the single view/edit permission with three independent
     * grants, so a user can be given any combination of view, edit
     * (upload/re-upload/metadata-edit), and delete (document + per-version)
     * access instead of "edit" being an all-or-nothing bundle.
     */
    public function up(): void
    {
        Schema::table('folder_user', function (Blueprint $table) {
            $table->boolean('can_view')->default(false)->after('user_id');
            $table->boolean('can_edit')->default(false)->after('can_view');
            $table->boolean('can_delete')->default(false)->after('can_edit');
        });

        // Preserve existing grants under the old model: "edit" used to mean
        // full access (view + edit + delete); "view" stays view-only.
        DB::table('folder_user')->where('permission', 'view')->update([
            'can_view' => true,
        ]);
        DB::table('folder_user')->where('permission', 'edit')->update([
            'can_view' => true,
            'can_edit' => true,
            'can_delete' => true,
        ]);

        Schema::table('folder_user', function (Blueprint $table) {
            $table->dropColumn('permission');
        });
    }

    public function down(): void
    {
        Schema::table('folder_user', function (Blueprint $table) {
            $table->enum('permission', ['view', 'edit'])->nullable()->after('user_id');
        });

        DB::table('folder_user')->where('can_edit', true)->update(['permission' => 'edit']);
        DB::table('folder_user')->where('can_edit', false)->where('can_view', true)->update(['permission' => 'view']);

        Schema::table('folder_user', function (Blueprint $table) {
            $table->enum('permission', ['view', 'edit'])->nullable(false)->change();
            $table->dropColumn(['can_view', 'can_edit', 'can_delete']);
        });
    }
};
