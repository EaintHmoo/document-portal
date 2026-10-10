# Internal Document Portal

A secure internal document portal where employees upload, organise, search and download company documents, limited to the folders they have been given access to. Admins manage users, folders, folder access and documents, and can see a system-wide activity log.

The repository has two applications:

```
document-portal/
├── backend/    Laravel 13 REST API (Sanctum SPA auth, MySQL, S3)
└── frontend/   React 19 single-page app (Vite, TypeScript, Tailwind)
```

---

## Table of contents

1. [Features](#features)
2. [Technology stack](#technology-stack)
3. [Prerequisites](#prerequisites)
4. [Setup instructions](#setup-instructions)
5. [Environment configuration](#environment-configuration)
6. [Database setup](#database-setup)
7. [Migrations and seeding](#migrations-and-seeding)
8. [Running the backend](#running-the-backend)
9. [Running the frontend](#running-the-frontend)
10. [Test credentials](#test-credentials)
11. [Permission model](#permission-model)
12. [API reference](#api-reference)
13. [Database design](#database-design)
14. [Important technical decisions](#important-technical-decisions)
15. [Assumptions and limitations](#assumptions-and-limitations)
16. [Features intentionally not implemented](#features-intentionally-not-implemented)

---

## Features

| Area | What's included |
|---|---|
| **Authentication** | Login and logout using cookie-based Sanctum SPA auth. Login is rate-limited and deactivated accounts can't sign in. |
| **Registration, with email verification** | Self-registration always creates a regular user. It has two steps: the user enters their details and gets a 6-digit code by email, then enters the code, and only then is the account created. |
| **Forgot password** | From the login page: enter your email, receive a 6-digit code, then set a new password. A reset signs the account out of every session. The response is the same whether or not the email has an account. |
| **Change password** | In **Settings**: enter your current password and choose a new one. Your other sessions are signed out and the current one stays signed in. |
| **Roles** | `admin` and `user`. Admins can do everything. Regular users get access folder by folder. |
| **User management** (admin) | Paginated user list with keyword, role and status filters. Admins can change a user's role and block or unblock them. Blocking a user ends their active sessions at once and queues an email notification. Admins can't block or demote themselves. |
| **Folders** | Admins create, edit, move and delete folders, which can be **nested** to any depth. Users browse the tree with breadcrumbs, and folder search covers every level. A folder is either **public** (any signed-in user can view it) or **private** (only users with an explicit grant can see it). Per-user access is managed from an access modal. |
| **Documents** | Upload, view details, search, filter, sort, download, edit metadata and delete. Search matches word prefixes ("rep" finds "Report"). Uploads accept PDF, DOC, DOCX, XLS, XLSX, PPT and PPTX up to 20 MB, and both extension and MIME type are checked in the browser and on the server. Deleted documents can be recovered for 30 days (configurable), after which a scheduled job removes their files from S3. |
| **Version history** | Uploading a new file for a document creates version N+1, and earlier versions are kept. Each version stores who uploaded it, when, the original filename, its size, a SHA-256 checksum and an optional change note. Any version can be downloaded. Single versions can be deleted, but a document always keeps at least one. |
| **Activity log** (admin) | Logins, logouts, registrations, document upload/update/download/delete/version-delete, folder create/update/delete/access changes, and user role and status changes. Each entry records the user, IP address and user agent. The log can be filtered by action, user and date range. |
| **Dashboard** | *Admin:* total users, documents and folders, recent uploads, recent system activity. *User:* number of accessible documents, accessible folders, recent documents, and their own recent activity. |

---

## Technology stack

**Backend**
- PHP 8.3+ / **Laravel 13**
- **Laravel Sanctum 4**, in SPA cookie-session mode
- **MySQL 8**, using InnoDB FULLTEXT indexes for document search
- **AWS S3** for file storage, via `league/flysystem-aws-s3-v3` and the AWS SDK presigned URLs
- Database-backed sessions, cache and queue, so no Redis is needed

**Frontend**
- **React 19** + **Vite 8**
- **TypeScript**
- **React Router 7**
- **Tailwind CSS 4**, Headless UI, Heroicons / Lucide icons
- A small `fetch` wrapper (`src/api/client.ts`) that handles credentials, the CSRF cookie and normalised API errors. No Axios or other HTTP library.

---

## Prerequisites

| Tool | Version |
|---|---|
| PHP | 8.3 or newer, with `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `curl` |
| Composer | 2.x |
| MySQL | 8.0+ (5.7 also works; FULLTEXT on InnoDB is required) |
| Node.js | 20+ (developed on 22) |
| npm | 10+ |
| AWS S3 bucket | Needed to upload and download documents. See [S3 configuration](#s3-configuration). |

---

## Setup instructions

Quick start. Each step is explained in the sections that follow.

```bash
git clone <repo-url> document-portal
cd document-portal

# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Edit .env: DB_* and AWS_* values (see "Environment configuration")
mysql -u root -p -e "CREATE DATABASE document_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate --seed
composer serve               # http://localhost:8000, with upload limits raised for 20 MB files

# In a second terminal: queue worker (block/unblock emails) and scheduler (purges old deleted documents)
cd backend && php artisan queue:work
cd backend && php artisan schedule:work   # optional locally

# In a third terminal: frontend
cd frontend
npm install
cp .env.example .env
npm run dev                  # http://localhost:5173
```

Open **http://localhost:5173** and sign in with one of the [test credentials](#test-credentials).

> ⚠️ **Use `localhost` for both apps, not `127.0.0.1`.** Sanctum's session and `XSRF-TOKEN` cookies belong to a specific host. If the SPA runs on `localhost:5173` and the API on `127.0.0.1:8000`, the browser won't share the cookies between them and every request will return 401 or 419.

---

## Environment configuration

### Backend (`backend/.env`)

`backend/.env.example` has comments for each setting. These are the ones you need to change or understand:

| Variable | Default | Purpose |
|---|---|---|
| `APP_URL` | `http://localhost:8000` | Base URL of the API. |
| `DB_CONNECTION` / `DB_HOST` / `DB_PORT` / `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` | `mysql` / `127.0.0.1` / `3306` / `document_portal` / `root` / *(empty)* | MySQL connection. |
| `FRONTEND_URLS` | `http://localhost:5173` | Comma-separated list of SPA origins allowed by CORS to send credentialed requests. Must match the SPA origin exactly. |
| `SANCTUM_STATEFUL_DOMAINS` | `localhost:5173,127.0.0.1:5173` | Hosts that get cookie-session auth from Sanctum. |
| `SESSION_DRIVER` | `database` | Sessions are stored in the `sessions` table. The app uses this table to sign blocked users out immediately. |
| `SESSION_LIFETIME` | `120` | Session idle timeout, in minutes. |
| `SESSION_DOMAIN` | `null` | Leave as `null` locally. In production, set it to the shared parent domain, e.g. `.example.com`. |
| `QUEUE_CONNECTION` | `database` | Queue for the block/unblock emails. |
| `MAIL_MAILER` | `log` | Writes emails to `storage/logs/laravel.log` instead of sending them, so no SMTP account is needed for evaluation. **Verification and reset codes appear there too** (see [Test credentials](#test-credentials)). |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | *(empty)* | IAM credentials for the document bucket. |
| `AWS_DEFAULT_REGION` | `us-east-1` | Bucket region. |
| `AWS_BUCKET` | *(empty)* | Bucket name. |
| `DOCUMENT_PURGE_AFTER_DAYS` | `30` | How long a deleted document stays recoverable before `documents:purge-deleted` removes its S3 files and database rows. |
| `OTP_EXPIRES_MINUTES` / `OTP_MAX_ATTEMPTS` / `OTP_RESEND_SECONDS` | `10` / `5` / `60` | Email code lifetime, wrong guesses allowed per code, and the wait before a new code can be requested. Optional; the defaults are in `config/auth.php`. |

### Frontend (`frontend/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Base URL of the Laravel API. The client calls `${VITE_API_URL}/api/...` and `${VITE_API_URL}/sanctum/csrf-cookie`. |

### S3 configuration

Document files are stored **only** in S3. There is no local-disk fallback for documents (see [limitations](#assumptions-and-limitations)). To evaluate uploads and downloads:

1. Create a private S3 bucket and keep **Block all public access** turned on.
2. Create an IAM user or role with this minimal policy on the bucket:
   ```json
   {
     "Effect": "Allow",
     "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
     "Resource": "arn:aws:s3:::<your-bucket>/*"
   }
   ```
3. Put the credentials, region and bucket name in `backend/.env`.

The bucket doesn't need a CORS policy. Uploads go from the Laravel server to S3, and downloads are plain browser navigations to a presigned URL.

Objects are stored at `documents/{document-uuid}/v{version}/document_{random}_{timestamp}.{ext}`. The original filename is never part of the object key.

---

## Database setup

1. Make sure MySQL is running.
2. Create the database:
   ```sql
   CREATE DATABASE document_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Set `DB_*` in `backend/.env` to match your MySQL user. The `.env.example` defaults are `root` with an empty password on `127.0.0.1:3306`.

---

## Migrations and seeding

Run these from `backend/`:

```bash
php artisan migrate          # create all tables
php artisan db:seed          # seed roles + test users
# or both at once:
php artisan migrate --seed

# Start from scratch (drops every table):
php artisan migrate:fresh --seed
```

**What the seeders create**

| Seeder | Creates |
|---|---|
| `RoleSeeder` | The `admin` and `user` roles |
| `UserSeeder` | One admin and one regular user (see [Test credentials](#test-credentials)) |
| `FolderSeeder` | A nested demo folder tree (below), plus access grants for `user@example.com` |

The seeders are idempotent (`updateOrCreate`), so running them again is safe. To add the folders to a database that's already seeded, run `php artisan db:seed --class=FolderSeeder`.

**Demo folders, and what `user@example.com` can do in each**

| Folder | Visibility | `user@example.com` |
|---|---|---|
| Company Policies → HR Policies, IT & Security | Public | View and download (public) |
| Marketing | Public | View and download (public) |
| Finance | Private | View only |
| ↳ Budgets | Private | View only |
| ↳ Invoices | Private | *Hidden* |
| Human Resources → Payroll, Recruitment | Private | *Hidden* |
| Projects | Private | View and upload new documents |
| ↳ Project Alpha | Private | Full access (view, create, edit, delete) |
| ↳ Project Beta | Private | View and edit, but can't upload new documents or delete |

No documents are seeded, because document records point at real S3 objects that the seeder can't create. Sign in as the admin and upload a few files into these folders, then sign in as `user@example.com` to see the permissions in action.

---

## Running the backend

```bash
cd backend
composer serve               # API on http://localhost:8000
php artisan queue:work       # separate terminal; delivers queued emails
php artisan schedule:work    # separate terminal; runs the daily purge of old deleted documents
```

### PHP upload limits

PHP's defaults (`upload_max_filesize=2M`, `post_max_size=8M`) are lower than the 20 MB document limit. The repo raises them for each way of running PHP, so you don't need to edit `php.ini`:

| How PHP runs | Where the limits are set |
|---|---|
| Local dev server | `composer serve` starts PHP's built-in server with `-d upload_max_filesize=25M -d post_max_size=30M`. Plain `php artisan serve` can't pass these settings through, so use `composer serve` to test large uploads. |
| PHP-FPM (nginx, Apache with FPM) | `backend/public/.user.ini` |
| Apache with mod_php | `backend/public/.htaccess` (`php_value`, inside `IfModule` guards) |

If a request still goes over the server's limit, the API returns **413** with a readable message instead of failing silently. The frontend also rejects files over 20 MB before uploading them.

### Purging deleted documents

```bash
php artisan documents:purge-deleted            # uses DOCUMENT_PURGE_AFTER_DAYS (default 30)
php artisan documents:purge-deleted --days=0   # purge everything already deleted
```

The command is scheduled daily in `routes/console.php`. In production, run the standard Laravel cron entry (`* * * * * php artisan schedule:run`).

Optional:

```bash
php artisan pail             # live-tail application logs
php artisan route:list --path=api
./vendor/bin/pint            # code style
```

Health check: `GET http://localhost:8000/up`

## Running the frontend

```bash
cd frontend
npm run dev                  # dev server on http://localhost:5173
npm run build                # production build -> frontend/dist
npm run preview              # serve the production build
npm run lint
```

---

## Test credentials

These are dummy accounts created by `UserSeeder`, for local evaluation only.

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@example.com` | `password` |
| **User** | `user@example.com` | `password` |

You can also create more regular users from the **Register** page. Self-registered accounts always get the `user` role.

**Getting the email codes locally.** With the default `MAIL_MAILER=log`, codes for registration and forgot-password are written to the log instead of being sent. Find the latest one with:

```bash
grep -A2 "letter-spacing:8px" backend/storage/logs/laravel.log | tail -3
```

Or use `php artisan pail` and look for the code in the email body. To get real emails, point the `MAIL_*` settings at an SMTP server, such as a Mailtrap sandbox.

---

## Permission model

### Roles

- **Admin** passes every authorization check, via a single `Gate::before` hook in `AppServiceProvider`. Admins can see all folders and documents, manage users, create and delete folders, manage folder access, and view the activity log.
- **User** has no system-wide permissions. What they can do depends only on public folders and their grants on individual folders.

### Folder visibility

| Folder type | Who can see it and its documents |
|---|---|
| Public (`is_public = true`) | Every signed-in user can **view and download** |
| Private | Admins, plus users who have **any** grant on the folder |

### Per-folder grants (`folder_user` table)

An admin gives each user any combination of four independent flags per folder:

| Flag | Allows |
|---|---|
| `can_view` | Browse the folder, view document details, download any version |
| `can_create` | Upload **new** documents into the folder |
| `can_edit` | Edit document title and description, upload a new version, edit folder details |
| `can_delete` | Delete documents and individual versions |

Any of the four flags also gives read access to the folder.

**Admin-only actions:** create and delete folders, manage folder access, manage users, and view the activity log.

### How access is enforced

- **Every list and search query is scoped** with `Document::accessibleBy($user)` / `Folder::accessibleBy($user)`. Search, filters, pagination counts and dashboard stats can't reveal documents outside the user's access.
- **Single-document lookups** (`/documents/{uuid}`, downloads, versions) also go through the scoped query. A document the user can't access returns **404, not 403**, so the API never confirms that the document exists.
- **Policies** (`DocumentPolicy`, `FolderPolicy`, `UserPolicy`) then check the specific action: update, delete, add version, and so on.
- The frontend hides actions the user isn't allowed to take, but the API enforces every rule regardless of what the UI shows.

---

## API reference

Base URL: `http://localhost:8000`. All endpoints except the CSRF cookie and `/up` are under `/api`.

### Authentication flow (Sanctum SPA)

1. `GET /sanctum/csrf-cookie`: sets an `XSRF-TOKEN` cookie.
2. Every mutating request (`POST`/`PUT`/`PATCH`/`DELETE`) sends that value back in the `X-XSRF-TOKEN` header, with `credentials: 'include'`.
3. `POST /api/login` starts a session, which is carried in an `HttpOnly` session cookie.
4. Later requests are authenticated by the session cookie. No bearer tokens are used.

### Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/register/send-otp` | guest, 5/min | Registration step 1: email a code (`email`). Returns 422 if the email is taken, 429 during the resend cooldown |
| `POST` | `/api/register` | guest, 10/min | Registration step 2: `name`, `email`, `password`, `password_confirmation`, `otp`. Creates the account only if the code is valid |
| `POST` | `/api/login` | guest, 10/min | Log in (`email`, `password`) |
| `POST` | `/api/forgot-password` | guest, 5/min | Email a reset code (`email`). Always returns the same 200 message |
| `POST` | `/api/reset-password` | guest, 10/min | `email`, `otp`, `password`, `password_confirmation`. Signs out every session of the account |
| `PUT` | `/api/user/password` | ✓, 5/min | `current_password`, `password`, `password_confirmation`. Signs out the user's other sessions |
| `POST` | `/api/logout` | ✓ | Log out and invalidate the session |
| `GET` | `/api/user` | ✓ | Current user and role |
| `GET` | `/api/dashboard` | ✓ | Role-specific dashboard data |
| `GET` | `/api/documents` | ✓ | Paginated, permission-scoped list (filters below) |
| `POST` | `/api/documents` | ✓ create | Upload (multipart: `folder_id`, `title`, `description?`, `file`) |
| `GET` | `/api/documents/{uuid}` | ✓ view | Details and full version history |
| `PATCH` | `/api/documents/{uuid}` | ✓ edit | Update `title` / `description` |
| `DELETE` | `/api/documents/{uuid}` | ✓ delete | Soft-delete the document |
| `POST` | `/api/documents/{uuid}/versions` | ✓ edit | Upload a new version (multipart: `file`, `change_note?`) |
| `DELETE` | `/api/documents/{uuid}/versions/{id}` | ✓ delete | Delete one version (not the last one) |
| `GET` | `/api/documents/{uuid}/download` | ✓ view | Returns `{ download_url, expires_in }` for the current version |
| `GET` | `/api/documents/{uuid}/versions/{id}/download` | ✓ view | Same, for a specific version |
| `GET` | `/api/folders` | ✓ | Folders the user can access, with document counts |
| `POST` | `/api/folders` | admin | Create (`name`, `description?`, `is_public?`, `parent_id?`) |
| `GET` | `/api/folders/{id}` | ✓ view | Folder details |
| `PUT/PATCH` | `/api/folders/{id}` | edit | Update folder. Changing `parent_id` (moving it) is **admin-only**, and moving a folder into itself or one of its subfolders is rejected (422) |
| `DELETE` | `/api/folders/{id}` | admin | Delete. Returns **409** if the folder still has subfolders or documents |
| `GET` | `/api/folders/{id}/access` | admin | All users with their grants on this folder |
| `PUT` | `/api/folders/{id}/access` | admin | Replace grants: `{ grants: [{ user_id, can_view, can_create, can_edit, can_delete }] }` |
| `GET` | `/api/users` | admin | Paginated user list |
| `PATCH` | `/api/users/{id}` | admin | Change `role` (`admin`/`user`) and/or `is_active` |
| `GET` | `/api/activity-logs` | admin | Paginated activity log, plus `meta.available_actions` |

### Query parameters

| Endpoint | Parameter | Values |
|---|---|---|
| `/api/documents` | `q` | Search on title and description. Every word must match, and each word matches as a prefix |
| | `folder_id` | Folder ID |
| | `extension` | `pdf`, `doc`, `docx`, `xls`, `xlsx`, `ppt`, `pptx` |
| | `sort` | `newest` (default), `oldest`, `name_asc`, `name_desc` |
| | `page` | Page number (20 per page) |
| `/api/users` | `keyword`, `role`, `is_active`, `page` | |
| `/api/activity-logs` | `action`, `user_id`, `from`, `to` (Y-m-d), `page` | |

### Response conventions

- Successful responses use Laravel API Resources: `{ "data": ... }`. Paginated lists also include `links` and `meta`.
- Errors always come back as JSON with a `message` field:

| Status | When |
|---|---|
| `401` | Not authenticated |
| `403` | Authenticated but not allowed, or the account is deactivated |
| `404` | Not found, **or a document outside the user's access** |
| `409` | Conflict, e.g. deleting a non-empty folder or a document's last version |
| `413` | Upload larger than the server allows |
| `419` | CSRF token missing or expired |
| `422` | Validation failed: `{ "message", "errors": { "field": ["..."] } }` |
| `429` | Rate limit hit, or a new email code requested before the cooldown ended |
| `503` | A verification email couldn't be sent |

---

## Database design

| Table | Purpose and notable constraints |
|---|---|
| `roles` | `slug` is unique (`admin`, `user`) |
| `users` | FK `role_id` → `roles` (restrict on delete). `is_active` (indexed), `last_login_at`, soft deletes |
| `folders` | Self-referencing `parent_id` (null on delete), `is_public`, `created_by` → users. **Unique (`parent_id`, `name`)**. Soft deletes |
| `folder_user` | Per-user grants: `can_view`, `can_create`, `can_edit`, `can_delete`, `granted_by`. **Unique (`folder_id`, `user_id`)**, plus a reverse index for "folders for this user" lookups. Cascades on folder/user delete |
| `documents` | `uuid` (unique, used in all public URLs), `folder_id` → folders (**restrict on delete**), denormalised `current_version_id`, `version_count`, `extension`, `size_bytes`, `uploaded_by`/`updated_by`. Indexes: (`folder_id`, `deleted_at`, `created_at`), `extension`, `title`, **FULLTEXT(`title`, `description`)**. Soft deletes |
| `document_versions` | `version_number`, `storage_key`, `original_filename`, `mime_type`, `size_bytes`, `checksum_sha256`, `change_note`, `created_by`. **Unique (`document_id`, `version_number`)**. Append-only (no `updated_at`) |
| `activity_logs` | `user_id` (null on delete), `action`, polymorphic `subject_type`/`subject_id`, JSON `properties`, `ip_address`, `user_agent`. Indexes on `created_at`, (`user_id`, `created_at`), (`action`, `created_at`). Append-only |
| `sessions`, `cache`, `jobs`, `failed_jobs` | Laravel framework tables |

---

## Important technical decisions

1. **Sanctum SPA cookie auth instead of bearer tokens.** The SPA is first-party, so an `HttpOnly` session cookie with CSRF protection is safer than keeping a token in `localStorage`, where any XSS could read it. It also means there's no token refresh or rotation to build. The draft schema had a `refresh_tokens` table; it was **intentionally dropped** because it only makes sense for a token-based client.

2. **S3 with presigned URLs for downloads.** The API never streams files and never exposes a permanent URL. A download request checks permissions, logs the download, and returns a **5-minute** presigned `GetObject` URL with `Content-Disposition: attachment; filename="<original name>"`. A leaked link expires quickly, and the bucket stays fully private.

3. **Upload to S3 first, then write to the database.** The file is stored in S3 *before* the database transaction that creates the document and version rows. A failed upload therefore never leaves a document record without a file. The opposite failure (file stored, database write fails) only leaves an orphaned object, which is harmless.

4. **UUIDs in document URLs.** Documents are addressed by `uuid`, not the auto-increment ID, so IDs can't be enumerated. Together with the scoped lookup that returns 404, users can't probe for documents they can't access.

5. **Simple, append-only versioning.** Each new file is a new `document_versions` row with its own S3 object. `documents.current_version_id` points to the active one. Editing the title or description does **not** create a version, because only file changes are versioned. Every version keeps a SHA-256 checksum for integrity checks.

6. **Fine-grained per-folder permissions instead of roles per document.** Permissions belong to folders, not individual documents, because that is how companies usually organise access (department or project folders). Splitting the flags into view, create, edit and delete lets an admin set up common cases such as "contributors can upload but not delete" or "reviewers can edit but not add new files".

7. **Layered backend.** Controllers handle HTTP only. **Form Requests** validate input. **Policies** authorise actions. **Services** hold the business rules (versioning, logging, emails). **Repositories** (bound to interfaces in `RepositoryServiceProvider`) hold the queries. **Filter classes** turn query-string filters into query constraints. **API Resources** shape every response.

8. **MySQL FULLTEXT search, with a fallback for short words.** Search uses `FULLTEXT(title, description)` in boolean mode, so it stays fast as the number of documents grows without running Elasticsearch or Meilisearch. Each word becomes a required prefix (`+term*`), so "rep" finds "Report" and every word must match. Boolean operators typed by the user are stripped first. MySQL doesn't index words shorter than 3 characters or stopwords like "the", so those words fall back to a `LIKE` substring match. That fallback only narrows results the index and permission scope have already filtered.

9. **Soft deletes with a retention window.** Users, folders and documents are soft-deleted, so something deleted by mistake can still be recovered and the activity log keeps its references. For documents, a daily `documents:purge-deleted` job permanently removes those deleted more than `DOCUMENT_PURGE_AFTER_DAYS` ago: first every version's S3 object, then the database rows. If any S3 delete fails, the document's rows are kept so the next run retries it, and no file is ever left in S3 with nothing pointing to it.

10. **Nested folders built from one flat query.** `GET /api/folders` returns the user's accessible folders as a flat list, and the SPA builds the tree from `parent_id`. Access is not inherited, so a user can have access to a subfolder without access to its parent. In that case the subfolder appears at that user's top level instead of disappearing. Moving folders is admin-only and validated against cycles. A folder with subfolders can't be deleted, so no folder is left under a deleted parent.

11. **Blocking takes effect immediately.** Deactivating a user deletes their rows from `sessions`, so they are signed out on their next request instead of when their session expires. The notification email is **queued** so a slow SMTP server can't make the request hang after the status change is already saved.

12. **Email one-time codes (OTP) for registration and password reset.**
    - Codes are 6 random digits and stored only as a bcrypt hash in `email_otps`, one live code per email and purpose. They expire after 10 minutes and die after 5 wrong guesses.
    - Each code is single-use and deleted as soon as it's verified. Verification locks the row, so two concurrent requests can't both use the same code.
    - Registration verifies the code *before* creating the user, so the database never holds unverified accounts.
    - Forgot-password returns the same response, and applies the same 60-second resend cooldown, for unknown, blocked and real accounts, so it can't be used to find out which emails are registered.
    - Code emails are sent **synchronously**, unlike the block/unblock notices: a queued code is useless if no worker is running, and the user is waiting for it.
    - Password reset and password change both sign out other sessions, so anyone holding the old password loses access.

13. **No HTTP library on the frontend.** A ~90-line `fetch` wrapper handles `credentials: 'include'`, fetches the CSRF cookie lazily, sends `X-XSRF-TOKEN`, and converts error responses into a typed `ApiError` with per-field validation messages.

---

## Assumptions and limitations

**Assumptions**
- The portal is internal, so open self-registration is acceptable. New accounts get the `user` role and see **nothing except public folders** until an admin grants access. Only an admin can make someone an admin.
- Folder access is granted per folder and is **not inherited** by subfolders. Granting access to a parent folder doesn't reveal what's inside its subfolders.
- Admins have full access everywhere, without needing folder grants.
- Users with `can_edit` on a folder may also edit that folder's name, description and visibility. Only admins can create or delete folders and change who has access.
- A regular user's dashboard "recent activity" shows **their own** actions. Only admins see everyone's activity.
- The maximum upload size is 20 MB (see [PHP upload limits](#php-upload-limits) for how the server is configured to accept it).
- A deleted document stays recoverable for 30 days by default. After that it is gone for good, including all versions in S3.

**Limitations**
- **Uploads and downloads require S3.** Without AWS credentials you can still use everything else (auth, folders, users, activity log, dashboard), but uploads will fail. A local-disk driver was left out to keep a single, secure storage path.
- **The server uploads to S3.** Files go browser → Laravel → S3 (Laravel uses a presigned PUT internally). This is simple and lets the server validate the file before storing it, but large files pass through the app server. Direct browser-to-S3 uploads would scale better (see below).
- **Search matches word prefixes, not the middle of words.** "port" won't find "Report". Only words under 3 characters and stopwords use substring matching (the `LIKE` fallback). The short-word list assumes MySQL's default `innodb_ft_min_token_size=3`; if your server uses a different value, update `DocumentFilter::MIN_FULLTEXT_TERM_LENGTH` to match.
- **Purging needs the scheduler.** Old deleted documents are only removed when `schedule:work` / `schedule:run` is running. Without it, they stay soft-deleted with their S3 files.
- **Fixed page size** of 20, not configurable by the client.
- **No automated test suite** beyond the Laravel scaffold examples. Testing was done manually against a local MySQL database and a real S3 bucket during development.
- The block and unblock emails need `php artisan queue:work` running. With `MAIL_MAILER=log` they are written to `storage/logs/laravel.log`. Verification codes are sent immediately and don't need the worker.
- **Forgot-password response time.** For a real account the request waits for the email to be sent; for an unknown email it doesn't. The response body and cooldown are identical, but a very slow mail server could make the two cases distinguishable by timing. Sending through a fast relay, or padding the response time, would close this gap.
- A slow SMTP server makes the code-request endpoints slow, because those emails are sent synchronously. Set `MAIL_*` to a responsive relay in production.

---

## Features intentionally not implemented

These were left out on purpose, given the 24-hour time limit and the brief's preference for a smaller, well-built app:

| Feature | Reason |
|---|---|
| Refresh tokens / bearer-token API | Not needed with Sanctum cookie sessions (see decision 1). Would be added if a mobile or third-party client were introduced. |
| Admin creating or deleting users from the UI | Users self-register. Admins control access by changing roles and blocking or unblocking. Blocking is reversible and keeps history, unlike deletion. |
| Restoring older versions | Older versions can be **downloaded** and re-uploaded as a new version. A one-click restore would be a small addition. |
| In-browser document preview | Office formats need a conversion service. Downloading covers the requirement. |
| Direct browser-to-S3 uploads | Would remove large files from the app server, but needs a two-step flow (presign, then confirm) and server-side checks after upload. Server-side upload was chosen for simpler and stricter validation. |
| Virus / malware scanning of uploads | Would usually be an S3 event plus a scanner (e.g. ClamAV Lambda). Out of scope. |
| Recycle bin / restore deleted documents | Deleted documents can be recovered at the database level until the retention window ends, but there's no restore UI. |
| Inherited folder permissions | Nested folders are supported, but each folder has its own access list. Inheritance (with overrides) would make "who can see this?" much harder to reason about and audit. |
| Document tags / custom categories | Folders cover the "category" requirement. |
| Automated test suite, Docker setup, CI | Time went to core features, authorization and security first. These would be the next things to add. |
