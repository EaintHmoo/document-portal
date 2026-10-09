<?php

namespace App\Http\Controllers;

use App\Http\Requests\Folder\StoreFolderRequest;
use App\Http\Requests\Folder\UpdateFolderRequest;
use App\Http\Resources\FolderResource;
use App\Models\Folder;
use App\Services\Folder\FolderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FolderController extends Controller
{
    public function __construct(protected FolderService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $folders = $this->service->list($request->user());

        return FolderResource::collection($folders)->response();
    }

    public function store(StoreFolderRequest $request): JsonResponse
    {
        $folder = $this->service->create($request->validated(), $request->user());

        return FolderResource::make($folder->load('creator'))->response()->setStatusCode(201);
    }

    public function show(Request $request, Folder $folder): JsonResponse
    {
        $this->authorize('view', $folder);

        return FolderResource::make($folder->loadCount('documents'))->response();
    }

    public function update(UpdateFolderRequest $request, Folder $folder): JsonResponse
    {
        $folder = $this->service->update($folder, $request->validated(), $request->user());

        return FolderResource::make($folder->load('creator'))->response();
    }

    public function destroy(Request $request, Folder $folder): JsonResponse
    {
        $this->authorize('delete', $folder);

        $this->service->delete($folder, $request->user());

        return response()->json(['message' => 'Folder deleted.']);
    }
}
