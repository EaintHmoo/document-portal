<?php

namespace App\Filters;

class DocumentFilter extends Filters
{
	/**
	 * Register filter properties
	 */
	protected $filters = [
		'q',
		'folder_id',
		'extension',
		'sort',
	];

	/**
	 * Full-text search over title/description.
	 */
	public function q($value)
	{
		return $this->builder->whereFullText(['title', 'description'], $value);
	}

	/**
	 * Filter by folder/category.
	 */
	public function folder_id($value)
	{
		return $this->builder->where('folder_id', $value);
	}

	/**
	 * Filter by file type (pdf, docx, ...).
	 */
	public function extension($value)
	{
		return $this->builder->where('extension', strtolower($value));
	}

	/**
	 * Sort by name or date. Defaults to newest first.
	 */
	public function sort($value)
	{
		return match ($value) {
			'name_asc' => $this->builder->orderBy('title'),
			'name_desc' => $this->builder->orderByDesc('title'),
			'oldest' => $this->builder->orderBy('created_at'),
			default => $this->builder->orderByDesc('created_at'),
		};
	}

	/**
	 * `sort` always applies (even with no query param, for a stable default
	 * order), unlike the other filters which only fire when present.
	 */
	public function getFilters()
	{
		return array_merge(
			array_filter($this->request->only($this->filters)),
			['sort' => $this->request->input('sort', 'newest')],
		);
	}
}
