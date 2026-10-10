<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Deleted Document Retention
    |--------------------------------------------------------------------------
    |
    | Deleting a document only soft-deletes it, so an accidental delete can
    | still be recovered. After this many days the scheduled
    | `documents:purge-deleted` command removes it for good — every version's
    | S3 object and its database rows.
    |
    */

    'purge_after_days' => (int) env('DOCUMENT_PURGE_AFTER_DAYS', 30),

];
