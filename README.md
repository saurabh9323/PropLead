# PropLead CRM

A real-estate lead management app built with Next.js/React, Tailwind, Express and PostgreSQL.

## Features

- Capture and edit name, phone, optional email, budget, location, property type and source.
- Search leads by name/phone, filter by source/status and sort by date/budget.
- Open individual leads, add notes and update New / Contacted / Site Visit / Closed status.
- Admin-only lead deletion, with confirmation. Associated notes are deleted by the database.
- Dashboard totals, source breakdown, status distribution and conversion rate (closed / total).
- Login/logout and admin/CRM roles; admins can create additional users.

## Local setup

1. Install Node.js 20.9+ and PostgreSQL 13+, or create a Supabase PostgreSQL project.
2. Install dependencies:
   ```bash
   npm ci --prefix backend
   npm ci --prefix frontend
   ```
3. Create environment files from the safe examples:
   ```bash
   copy backend\.env.example backend\.env
   copy frontend\.env.example frontend\.env.local
   ```
   On macOS/Linux, use `cp` instead of `copy`.
4. Fill `backend/.env` with your own `DATABASE_URL` and a long random `JWT_SECRET`. Do not commit real `.env` files.
5. Keep `frontend/.env.local` pointed at the Express API, normally:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
   ```
6. Install the database schema, indexes, roles and stored functions:
   ```bash
   npm run db:setup --prefix backend
   ```
   This runs `backend/sql/schema.sql` and `backend/sql/functions.sql`. You may also run those two SQL files manually in your database client.
7. Seed the demo users shown on the login page:
   ```bash
   npm run seed-demo --prefix backend
   ```
   Existing accounts are not overwritten. To create your own admin, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`, then run:
   ```bash
   npm run create-admin --prefix backend
   ```
8. Start the application in two terminals from the project root:
   ```bash
   npm run dev:backend
   npm run dev:frontend
   ```
9. Open http://localhost:3000 and sign in.

The backend reads `.env` from its working directory. The root scripts start it in `backend`. Database schema installation is explicit; app startup never applies migrations.

## Environment variables

`backend/.env.example` and `frontend/.env.example` contain placeholders only. The real `.env` files are ignored by Git, while `.env.example` files are intentionally trackable.

Backend variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL/Supabase connection string used by Express and database setup scripts |
| `JWT_SECRET` | Yes | Secret used to sign and verify one-hour JWT sessions |
| `PORT` | No | Express port; defaults to `5000` |
| `ADMIN_NAME` | No | Name used by `npm run create-admin` |
| `ADMIN_EMAIL` | Only for `create-admin` | Email used by `npm run create-admin` |
| `ADMIN_PASSWORD` | Only for `create-admin` | Password used by `npm run create-admin`; must be at least 12 characters |

Frontend variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `API_BASE_URL` | Recommended in production | Server-only Express API base URL used by the Next.js API proxy and server components |
| `NEXT_PUBLIC_API_BASE_URL` | Yes locally, optional when `API_BASE_URL` is set | Public fallback Express API base URL for server-side Next.js calls |

## REST API

All routes below use `/api`. Except login and health, requests need `Authorization: Bearer <token>`.

GET requests use query parameters. POST and PUT requests use `Content-Type: application/json` and a JSON object body. Browser and server components share `frontend/utils/apiRequest.js`. Browser calls go to the same-origin Next.js API proxy under `/api`, which forwards requests to Express and manages the HttpOnly session cookie. Server components call the Express API base URL from `NEXT_PUBLIC_API_BASE_URL`.

Every API returns `{ ok, statusCode, message, data, pagination }`. PostgreSQL `crm_response` formats database success results. The backend `apiResponse` helper formats infrastructure/error results. Errors use `data: null` and `pagination: null`; non-paginated successes use `pagination: null`. HTTP status and `statusCode` match.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | /health | Process health |
| POST | /auth/login | Email/password login |
| GET | /auth/me | Current user |
| POST | /auth/logout | Logout response; frontend clears the session cookie |
| GET | /leads | Paginated list; search, source, status, sortBy=created_at/budget, sortOrder=asc/desc, page, pageSize |
| POST | /leads | Create lead |
| GET | /leads/:id | Lead details |
| PUT | /leads/:id | Replace editable lead fields |
| POST | /leads/:id/status | Update only status with `{ "status": "Contacted" }` |
| DELETE | /leads/:id | Delete lead (admin only) |
| GET / POST | /leads/:id/notes | List notes / add `{ "note": "Follow up Friday" }` |
| GET | /dashboard | Global dashboard metrics plus recentLeads; page and pageSize paginate the lead rows |
| GET / POST | /users | List/create users (admin only) |
| GET | /users/:id | User details (admin only) |
| GET | /roles | Roles (admin only) |

Lead create/update payload fields: `name`, `phone`, `email`, `budget`, `location`, `property_type`, `source`, `status`. Email is optional; status defaults to New for create. Budget must be nonnegative and at most 9,999,999,999.99. Notes must contain 1-5,000 non-whitespace characters after trimming.

Temporary compatibility aliases remain available during the REST migration: `POST /leads/list`, `POST /leads/:id/update` and `POST /leads/:id/delete`. New frontend code uses the REST routes above.

## Database functions and pagination

All application table queries live in `backend/sql/functions.sql`: lead CRUD, notes, dashboard, users, roles, authentication and account seeding. Repositories call allowlisted PostgreSQL functions through `src/db/routines.js`; the only SQL generated by application code is the parameterized function invocation. `schema.sql` contains table/index definitions and legacy read functions for compatibility.

The `crm_json_*` functions construct complete success responses in PostgreSQL using `jsonb_build_object`, `to_jsonb` and ordered `jsonb_agg`. Controllers forward the result directly. Single-resource misses return SQL NULL for the service to translate to HTTP 404; empty collections return `[]`. Public user projections exclude password hashes. Node retains input validation, authorization, password hashing/verification, token signing, and infrastructure/error responses. JWT signing secrets never enter PostgreSQL; the signed token is passed to the session JSON function as a parameter.

Both screens default to 10 rows. The rows-per-page dropdown offers 5, 10, 20, 50 and 100. The API accepts integer page sizes from 1 to 100 and rejects invalid values with HTTP 400. Changing filters or page size resets to page 1. Sorting has an ID tie-breaker, and pages beyond the end clamp to the last available page. Empty lists use page 1 of 1 with total 0.

`GET /api/leads?page=2&pageSize=10` returns `{ ok: true, statusCode: 200, message, data: [...up to 10 leads], pagination: { page: 2, pageSize: 10, total, totalPages } }`.

`GET /api/dashboard?page=2&pageSize=10` returns `{ ok: true, statusCode: 200, message, data: { totalLeads, closedLeads, conversionRate, totalBudget, averageBudget, leadsBySource, statusDistribution, recentLeads: [...up to 10 leads] }, pagination: { page: 2, pageSize: 10, total, totalPages } }`. Metrics and chart aggregates always cover all leads; only recentLeads is paginated.

Internal links use Next.js client navigation. Lead filters and pagination update URL history and fetch only the lead data, preserving the surrounding page. Clicking the already-active sidebar item is a no-op. Sync pipeline intentionally refreshes server data without reloading the browser document.

## Demo login

Credentials are always visible and can be clicked to fill the form, as requested:

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@proplead.test | Admin@123 |
| CRM | crm@proplead.test | Crm@123 |

These are public demo accounts. The seeder never resets an existing password; if these emails already exist with different passwords, use their existing credentials or update them explicitly in your own database.

## Deployment

The repository is split into two apps. Deploy them as separate services:

Backend on Render:

- Root directory: `backend`
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/api/health`
- Required environment variables: `DATABASE_URL`, `JWT_SECRET`

The included `render.yaml` contains the same backend settings with secret values marked as `sync: false`, so credentials are entered in the Render dashboard rather than committed to Git. Do not use `npm`, `npm run`, or `npm run build` as the backend build command; the Express API has no build step, so Render only needs to install dependencies and start `server.js`.

Frontend on Vercel:

- Root directory: `frontend`
- Build command: `npm run build`
- Output: managed by Next.js
- Required environment variable: `API_BASE_URL=https://your-render-service.onrender.com/api`
- Optional fallback: `NEXT_PUBLIC_API_BASE_URL=https://your-render-service.onrender.com/api`

After deployment, run `npm run db:setup --prefix backend` locally against the production database or execute `backend/sql/schema.sql` and `backend/sql/functions.sql` in Supabase before using the deployed API.

## Verification

Automated/static checks:

```bash
npm run lint --prefix frontend
npm run build:frontend
```

Manual assignment workflow:

1. Sign in as the admin demo account.
2. Add a uniquely named lead with name, phone, valid email, budget, location, property type and source.
3. Confirm the lead appears in the listing.
4. Search by the lead name and phone.
5. Filter by the lead source and status.
6. Sort by created date and budget.
7. Open the lead detail page and verify every field.
8. Add a note from the update page and verify it appears on the detail page.
9. Change the status to `Contacted`, `Site Visit` or `Closed`, then verify it persists.
10. Confirm the dashboard totals and distributions reflect the database.
11. Delete only the test lead and confirm it no longer loads.
12. Sign in as the CRM demo account and verify admin-only actions such as user management and lead deletion are blocked.

## Existing installations and security

- Existing installations must run `npm run db:setup --prefix backend` before starting this version. Setup adds indexes and replaces functions without deleting records. Deploy the updated API and frontend together for the paginated response contract.
- Existing SHA-256 password hashes remain compatible and are upgraded to salted scrypt after a successful login. New users always use scrypt.
- Demo seeding is explicit and idempotent; credentials remain visible on login.
- Credentials formerly committed in `backend/server.js` must be rotated externally. Removing the comment does not remove Git history or revoke credentials.
- Set a strong JWT secret; there is no fallback. Rotating it signs out existing sessions. Cookies use HttpOnly, SameSite=Lax and Secure in production; serve production over HTTPS.
- Tokens expire after one hour. Logout clears the browser cookie but does not revoke already copied bearer tokens.

## Future scope

Dynamic permission-based RBAC, a shared form/table component library, broader lazy loading and Suspense, audit logs, a financial ledger (if payments enter scope), caching and rotating refresh tokens are proposals only. They are not part of this implementation.
