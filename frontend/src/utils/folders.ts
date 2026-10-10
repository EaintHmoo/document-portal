import type { ApiFolder } from '@/api/folders';

export interface FolderIndex {
  byId: Map<number, ApiFolder>;
  /** Folders shown directly under `parentId` (null = top level), sorted by name. */
  childrenOf: (parentId: number | null) => ApiFolder[];
  /** Root-first chain of visible ancestors, excluding the folder itself. */
  ancestorsOf: (folderId: number) => ApiFolder[];
  /** "Finance / Payroll / 2026" — disambiguates same-named folders under different parents. */
  pathLabel: (folderId: number) => string;
  /** The folder plus everything beneath it — the invalid "move into" targets for that folder. */
  selfAndDescendantIds: (folderId: number) => Set<number>;
}

/**
 * Builds the folder tree from the flat, permission-scoped list the API
 * returns. Access isn't inherited, so a user may see a folder without
 * seeing its parent: such a folder is treated as top level for that user
 * rather than disappearing from the tree.
 */
export function buildFolderIndex(folders: ApiFolder[]): FolderIndex {
  const byId = new Map(folders.map((f) => [f.id, f]));

  const parentOf = (folder: ApiFolder): number | null =>
    folder.parent_id !== null && byId.has(folder.parent_id) ? folder.parent_id : null;

  const children = new Map<number | null, ApiFolder[]>();
  for (const folder of folders) {
    const key = parentOf(folder);
    children.set(key, [...(children.get(key) ?? []), folder]);
  }
  for (const list of children.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const ancestorsOf = (folderId: number): ApiFolder[] => {
    const chain: ApiFolder[] = [];
    const seen = new Set<number>([folderId]);
    let parentId = byId.has(folderId) ? parentOf(byId.get(folderId)!) : null;

    while (parentId !== null && !seen.has(parentId)) {
      const parent = byId.get(parentId)!;
      chain.unshift(parent);
      seen.add(parentId);
      parentId = parentOf(parent);
    }

    return chain;
  };

  const selfAndDescendantIds = (folderId: number): Set<number> => {
    const ids = new Set<number>();
    const stack = [folderId];

    while (stack.length > 0) {
      const id = stack.pop()!;
      if (ids.has(id)) continue;
      ids.add(id);
      stack.push(...(children.get(id) ?? []).map((f) => f.id));
    }

    return ids;
  };

  return {
    byId,
    childrenOf: (parentId) => children.get(parentId) ?? [],
    ancestorsOf,
    pathLabel: (folderId) =>
      [...ancestorsOf(folderId), byId.get(folderId)]
        .filter((f): f is ApiFolder => Boolean(f))
        .map((f) => f.name)
        .join(' / '),
    selfAndDescendantIds,
  };
}

/**
 * Folders as select options labelled with their full path, in tree order.
 * Filter with `include` rather than pre-filtering `folders`, so paths are
 * still built from the complete tree.
 */
export function folderOptions(
  folders: ApiFolder[],
  include: (folder: ApiFolder) => boolean = () => true,
): { id: number; name: string }[] {
  const index = buildFolderIndex(folders);
  const options: { id: number; name: string }[] = [];

  const walk = (parentId: number | null) => {
    for (const folder of index.childrenOf(parentId)) {
      if (include(folder)) {
        options.push({ id: folder.id, name: index.pathLabel(folder.id) });
      }
      walk(folder.id);
    }
  };
  walk(null);

  return options;
}
