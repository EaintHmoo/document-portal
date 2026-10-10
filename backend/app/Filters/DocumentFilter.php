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
	 * Matches innodb_ft_min_token_size (MySQL default 3) — shorter words
	 * are never written to the FULLTEXT index, so they can't be found there.
	 */
	private const MIN_FULLTEXT_TERM_LENGTH = 3;

	/**
	 * InnoDB's default stopword list. Stopwords aren't indexed either, and a
	 * required (+) stopword in boolean mode makes the whole match return
	 * zero rows rather than being ignored.
	 */
	private const FULLTEXT_STOPWORDS = [
		'a', 'about', 'an', 'are', 'as', 'at', 'be', 'by', 'com', 'de', 'en',
		'for', 'from', 'how', 'i', 'in', 'is', 'it', 'la', 'of', 'on', 'or',
		'that', 'the', 'this', 'to', 'was', 'what', 'when', 'where', 'who',
		'will', 'with', 'und', 'www',
	];

	/**
	 * Search over title/description. Every term must match (AND), and each
	 * term matches as a word prefix, so "rep" finds "Report":
	 *
	 * - indexable terms go through the FULLTEXT index in boolean mode as
	 *   "+term*" (index-backed, scales with document volume);
	 * - terms the index can't hold (too short, or stopwords) fall back to
	 *   a LIKE substring match, which only ever narrows the already
	 *   index-filtered and permission-scoped result set.
	 */
	public function q($value)
	{
		// Strip boolean-mode operators so user input can't change query semantics.
		$normalized = preg_replace('/[+\-<>()~*"@]+/u', ' ', (string) $value);
		$terms = preg_split('/\s+/u', trim($normalized), -1, PREG_SPLIT_NO_EMPTY);

		if (empty($terms)) {
			return $this->builder;
		}

		[$indexable, $fallback] = collect($terms)
			->unique(fn ($term) => mb_strtolower($term))
			->partition(fn ($term) => mb_strlen($term) >= self::MIN_FULLTEXT_TERM_LENGTH
				&& ! in_array(mb_strtolower($term), self::FULLTEXT_STOPWORDS, true));

		if ($indexable->isNotEmpty()) {
			$this->builder->whereFullText(
				['title', 'description'],
				$indexable->map(fn ($term) => "+{$term}*")->implode(' '),
				['mode' => 'boolean'],
			);
		}

		foreach ($fallback as $term) {
			$pattern = '%'.addcslashes($term, '%_\\').'%';

			$this->builder->where(function ($query) use ($pattern) {
				$query->where('title', 'LIKE', $pattern)
					->orWhere('description', 'LIKE', $pattern);
			});
		}

		return $this->builder;
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
