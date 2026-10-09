<?php

namespace App\Exceptions;

use RuntimeException;

/** Thrown by services for a 409 Conflict — a valid request that the current state won't allow. */
class ConflictException extends RuntimeException
{
}
