<?php

namespace App\Filters;

class ActivityLogFilter extends Filters
{
	/**
	 * Register filter properties
	 */
	protected $filters = [
		'action',
		'user_id',
		'from',
		'to',
	];

	/**
	 * Filter by exact action, e.g. "document.uploaded".
	 */
	public function action($value)
	{
		return $this->builder->where('action', $value);
	}

	/**
	 * Filter by who performed the action.
	 */
	public function user_id($value)
	{
		return $this->builder->where('user_id', $value);
	}

	/**
	 * Start of a created_at date range (inclusive, Y-m-d).
	 */
	public function from($value)
	{
		return $this->builder->whereDate('created_at', '>=', $value);
	}

	/**
	 * End of a created_at date range (inclusive, Y-m-d).
	 */
	public function to($value)
	{
		return $this->builder->whereDate('created_at', '<=', $value);
	}
}
