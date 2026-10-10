<?php

namespace Database\Seeders;

use App\Models\Folder;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Demo folder tree with a mix of public and private folders, plus grants
 * for the seeded regular user so the permission model can be explored
 * straight after `migrate --seed`. Idempotent: re-running updates in place.
 */
class FolderSeeder extends Seeder
{
    /**
     * name => [description, is_public, children]
     */
    private const TREE = [
        'Company Policies' => ['Handbooks and policies every employee should read.', true, [
            'HR Policies' => ['Leave, conduct and benefits policies.', true, []],
            'IT & Security' => ['Acceptable use, password and device policies.', true, []],
        ]],
        'Marketing' => ['Brand guidelines, campaign decks and assets.', true, []],
        'Finance' => ['Budgets, forecasts and financial reports.', false, [
            'Budgets' => ['Annual and quarterly budgets.', false, []],
            'Invoices' => ['Supplier and customer invoices.', false, []],
        ]],
        'Human Resources' => ['Confidential HR records.', false, [
            'Payroll' => ['Payroll runs and salary data.', false, []],
            'Recruitment' => ['Job descriptions and interview packs.', false, []],
        ]],
        'Projects' => ['Project plans, specs and status reports.', false, [
            'Project Alpha' => ['Customer portal rebuild.', false, []],
            'Project Beta' => ['Data warehouse migration.', false, []],
        ]],
    ];

    /**
     * Grants for user@example.com, keyed by folder path. Shows each flag
     * in isolation: view-only, contributor (view + create), editor, and
     * full access. Every other private folder stays hidden from them.
     */
    private const USER_GRANTS = [
        'Finance' => ['can_view' => true, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
        'Finance/Budgets' => ['can_view' => true, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
        'Projects' => ['can_view' => true, 'can_create' => true, 'can_edit' => false, 'can_delete' => false],
        'Projects/Project Alpha' => ['can_view' => true, 'can_create' => true, 'can_edit' => true, 'can_delete' => true],
        'Projects/Project Beta' => ['can_view' => true, 'can_create' => false, 'can_edit' => true, 'can_delete' => false],
    ];

    /** @var array<string, Folder> */
    private array $byPath = [];

    public function run(): void
    {
        $admin = User::query()->where('email', 'admin@example.com')->firstOrFail();
        $user = User::query()->where('email', 'user@example.com')->first();

        $this->createTree(self::TREE, null, '', $admin);

        if (! $user) {
            return;
        }

        foreach (self::USER_GRANTS as $path => $grant) {
            $this->byPath[$path]->users()->syncWithoutDetaching([
                $user->id => [...$grant, 'granted_by' => $admin->id],
            ]);
        }
    }

    private function createTree(array $tree, ?Folder $parent, string $prefix, User $admin): void
    {
        foreach ($tree as $name => [$description, $isPublic, $children]) {
            $folder = Folder::query()->updateOrCreate(
                ['parent_id' => $parent?->id, 'name' => $name],
                ['description' => $description, 'is_public' => $isPublic, 'created_by' => $admin->id],
            );

            $path = $prefix.$name;
            $this->byPath[$path] = $folder;

            $this->createTree($children, $folder, $path.'/', $admin);
        }
    }
}
