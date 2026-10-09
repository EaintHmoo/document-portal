<?php

namespace App\Filters;

class UserFilter extends Filters
{
	/**
	 * Register filter properties
	 */
	protected $filters = [
		'keyword',
		'role',
		'is_active',
	];

	/**
	 * Filter by name or email.
	 */
	public function keyword($value)
	{
		return $this->builder->where(function ($query) use ($value) {
			$query->where('name', 'LIKE', "%{$value}%")
				->orWhere('email', 'LIKE', "%{$value}%");
		});
	}

	/**
	 * Filter by role slug ("admin" or "user").
	 */
	public function role($value)
	{
		return $this->builder->whereHas('role', function ($query) use ($value) {
			$query->where('slug', $value);
		});
	}

	/**
	 * Filter by active status.
	 */
	public function is_active($value)
	{
		return $this->builder->where('is_active', filter_var($value, FILTER_VALIDATE_BOOLEAN));
	}
}
