<?php

namespace App\Http\Controllers;

use App\Http\Resources\ActivityLogResource;
use App\Services\ActivityLog\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function __construct(protected ActivityLogService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewActivityLog');

        $logs = ActivityLogResource::collection($this->service->list())->response()->getData(true);

        return response()->json([
            ...$logs,
            'meta' => [
                ...$logs['meta'],
                'available_actions' => $this->service->availableActions(),
            ],
        ]);
    }
}
