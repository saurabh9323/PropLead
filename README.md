# Full Stack Template

Clean starter project using:

- Next.js frontend
- Express.js backend
- PostgreSQL database
- Layered backend flow: routes -> controllers -> services -> models/repositories -> database

## Project Structure

```text
full-stack-template/
  frontend/
  backend/
```

## Backend Flow

```text
Client request
  -> server.js
  -> routes
  -> controller
  -> service
  -> model / repository
  -> PostgreSQL
  -> response
```

## Setup

Install dependencies:

```bash
cd frontend
npm install

cd ../backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/full_stack_template
```

Run frontend:

```bash
npm --prefix frontend run dev
```

Run backend:

```bash
npm --prefix backend run dev
```

Backend health check:

```text
GET http://localhost:5000/api/health
```

Resource example endpoints:

```text
POST   /api/resources
GET    /api/resources
GET    /api/resources/:id
PUT    /api/resources/:id
DELETE /api/resources/:id
```
