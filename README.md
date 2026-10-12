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

1. Install Node.js 20.9+ and PostgreSQL. Create a database named `proplead`.
2. Run `npm ci --prefix backend` and `npm ci --prefix frontend`.
3. Copy `backend/.env.example` to `backend/.env`. Set `DATABASE_URL` and a unique random `JWT_SECRET`.
4. Copy `frontend/.env.example` to `frontend/.env.local`. The default backend URL is `http://localhost:5000/api`.
5. Apply the schema: `psql "$DATABASE_URL" -f backend/sql/schema.sql` (or run the SQL in your database client).
6. From `backend`, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (12+ characters) in your environment or local `.env`, then run `npm run create-admin`. Existing accounts are never overwritten by this command.
7. In separate terminals run `npm run dev:backend` and `npm run dev:frontend` from the project root. Open http://localhost:3000 and sign in with your account.

The backend reads `.env` from its working directory. The root scripts start it in `backend`. Database schema installation is explicit; app startup never applies migrations.

## REST API

All routes below use `/api`. Except login and health, requests need `Authorization: Bearer <token>`.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | /health | Process health |
| POST | /auth/login | Email/password login |
| GET | /auth/me | Current user |
| POST | /auth/logout | Logout response; frontend clears the session cookie |
| GET | /leads | List; optional search, source, status, sortBy=created_at/budget, sortOrder=asc/desc |
| POST | /leads | Create lead |
| GET | /leads/:id | Lead details |
| PUT | /leads/:id | Replace editable lead fields |
| PATCH | /leads/:id/status | Update only status with `{ "status": "Contacted" }` |
| DELETE | /leads/:id | Delete lead (admin only) |
| GET / POST | /leads/:id/notes | List notes / add `{ "note": "Follow up Friday" }` |
| GET | /dashboard | Dashboard metrics |
| GET / POST | /users | List/create users (admin only) |
| GET | /users/:id | User details (admin only) |
| GET | /roles | Roles (admin only) |

Lead create/update payload fields: `name`, `phone`, `email`, `budget`, `location`, `property_type`, `source`, `status`. Email is optional; status defaults to New for create. Budget must be nonnegative and at most 9,999,999,999.99. Notes must contain 1–5,000 non-whitespace characters after trimming.

## Verification

- `npm test --prefix backend`: HTTP integration tests with isolated repository fixtures, budget validation, password compatibility and JWT validation. These tests do not write to your database.
- `npm run build:frontend`: production compilation and route validation.
- `npm run lint --prefix frontend`: Next.js/React lint checks.
- Optional isolated browser testing: run `node backend/test-support/browser-server.js` with port 5000 free, then start the frontend against it. It uses only in-memory data and test accounts `admin@example.test` / `crm@example.test` with password `Acceptance-test-123`. Stop it after testing; it is not the real backend.
- Manual acceptance: sign in, add a lead, search/filter/sort, open it, edit details, add notes, change each status and check dashboard counts; verify CRM users cannot delete and admins can confirm/cancel deletion.

## Existing installations and security

- No database migration is needed for the new lead screens or status endpoint.
- Existing SHA-256 password hashes remain compatible and are upgraded to salted scrypt after a successful login. New users always use scrypt.
- The schema no longer seeds public demo accounts or resets passwords. Existing demo accounts remain in your database; remove or reset those accounts before deployment.
- Credentials formerly committed in `backend/server.js` must be rotated externally. Removing the comment does not remove Git history or revoke credentials.
- Set a strong JWT secret; there is no fallback. Rotating it signs out existing sessions. Cookies use HttpOnly, SameSite=Lax and Secure in production; serve production over HTTPS.
- Tokens expire after one hour. Logout clears the browser cookie but does not revoke already copied bearer tokens.
- Lead listing currently returns all matches; server pagination is a future scaling improvement.
