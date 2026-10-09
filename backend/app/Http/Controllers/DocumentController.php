<?php

namespace App\Http\Controllers;

use App\Http\Requests\Document\StoreDocumentRequest;
use App\Http\Requests\Document\StoreDocumentVersionRequest;
use App\Http\Requests\Document\UpdateDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use App\Services\Document\DocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class DocumentController extends Controller
{
    public function __construct(protected DocumentService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        return DocumentResource::collection($this->service->list($request->user()))->response();
    }

    public function store(StoreDocumentRequest $request): JsonResponse
    {
        $document = $this->service->upload(
            $request->file('file'),
            $request->folder(),
            $request->string('title'),
            $request->input('description'),
            $request->user(),
        );

        return DocumentResource::make($document)->response()->setStatusCode(201);
    }

    public function show(Request $request, string $uuid): JsonResponse
    {
        $document = $this->findOrFail($request, $uuid);

        $this->authorize('view', $document);

        return DocumentResource::make($document->load('versions.author'))->response();
    }

    public function update(UpdateDocumentRequest $request, string $uuid): JsonResponse
    {
        $document = $this->findOrFail($request, $uuid);

        $this->authorize('update', $document);

        $document = $this->service->updateMetadata($document, $request->validated(), $request->user());

        return DocumentResource::make($document->load('folder', 'uploader', 'currentVersion'))->response();
    }

    public function destroy(Request $request, string $uuid): JsonResponse
    {
        $document = $this->findOrFail($request, $uuid);

        $this->authorize('delete', $document);

        $this->service->delete($document, $request->user());

        return response()->json(['message' => 'Document deleted.']);
    }

    public function storeVersion(StoreDocumentVersionRequest $request, string $uuid): JsonResponse
    {
        $document = $this->findOrFail($request, $uuid);

        $this->authorize('addVersion', $document);

        $document = $this->service->addVersion(
            $document,
            $request->file('file'),
            $request->input('change_note'),
            $request->user(),
        );

        return DocumentResource::make($document)->response()->setStatusCode(201);
    }

    public function download(Request $request, string $uuid): JsonResponse
    {
        $document = $this->findOrFail($request, $uuid);

        $this->authorize('download', $document);

        return response()->json([
            'download_url' => $this->service->downloadUrl($document, $request->user()),
            'expires_in' => 300,
        ]);
    }

    /**
     * Looks up the document scoped to what this user can see, so a document
     * outside their access resolves to a plain 404 — never a 403 that would
     * confirm the document exists at all.
     */
    private function findOrFail(Request $request, string $uuid): Document
    {
        $document = $this->service->find($request->user(), $uuid);

        if (! $document) {
            throw new NotFoundHttpException('Document not found.');
        }

        return $document;
    }
}
