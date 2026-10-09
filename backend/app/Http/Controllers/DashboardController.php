<?php

namespace App\Http\Controllers;

use App\Http\Resources\ActivityLogResource;
use App\Http\Resources\DocumentResource;
use App\Http\Resources\FolderResource;
use App\Services\Dashboard\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(protected DashboardService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $summary = $this->service->forUser($request->user());

        $summary['recent_documents'] = DocumentResource::collection($summary['recent_documents']);
        $summary['recent_activities'] = ActivityLogResource::collection($summary['recent_activities']);

        if (isset($summary['accessible_folders'])) {
            $summary['accessible_folders'] = FolderResource::collection($summary['accessible_folders']);
        }

        return response()->json(['data' => $summary]);
    }
}
