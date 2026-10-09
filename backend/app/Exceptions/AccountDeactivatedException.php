<?php

namespace App\Exceptions;

use RuntimeException;

/** Thrown when a deactivated user successfully authenticates but must be rejected anyway. */
class AccountDeactivatedException extends RuntimeException
{
}
