# TaskFlow web app

Next.js 16 frontend for the [taskflow](../taskflow) API: accounts, lists, tasks and due dates.

## How it talks to the backend

All backend calls happen on the Next.js server, in Server Components and Server Actions (`lib/api.ts`). The browser never sees the API URL or the session token. After login the token is stored in an httpOnly, SameSite=Lax cookie named `tf_session` on this app's origin, so the backend needs no CORS configuration.

`proxy.ts` only checks whether that cookie exists to redirect between `/login` and `/lists`. Real authorization happens in `lib/dal.ts` and inside every Server Action. A stale cookie is cleared by `GET /auth/expire`.

## Prerequisites

- Node.js 20.9 or newer (the repo is developed on Node 24).
- The backend running on `http://localhost:3000` with its PostgreSQL database (see the backend README).

## Run it

```bash
cp .env.example .env.local   # TASKFLOW_API_URL=http://localhost:3000
npm install
npm run dev                  # http://localhost:3001
```

The dev server uses port 3001 because the backend defaults to 3000.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 3001 |
| `npm run build` / `npm start` | Production build and server (port 3001) |
| `npm test` | Vitest unit tests (`tests/`) |
| `npm run typecheck` | `next typegen` then `tsc --noEmit` |
| `npm run lint` | ESLint |

## Routes

| Path | Purpose |
|---|---|
| `/` | Redirects to `/lists` or `/login` |
| `/login`, `/register` | Email + password forms |
| `/lists` | All of your lists, create a list |
| `/lists/[listId]` | Rename or delete the list; add, edit, complete, delete tasks |
| `/account` | Email, member since, change password, log out, backend health |
| `/auth/expire` | Clears a stale session cookie and redirects to `/login` |

Every backend endpoint is covered: health (account page), register, login, logout, me, change password, list/create/rename/delete lists, create/update/delete tasks.

## Project layout

```
app/            routes, layouts, error/not-found boundaries, Server Actions (app/actions)
components/     UI; files with "use client" are the interactive leaves
lib/            api client (server-only), session cookie, data-access layer, validation, dates
proxy.ts        optimistic cookie-based redirects
tests/          Vitest: api client, validation, dates, proxy, TaskItem
```

## Troubleshooting

- **Redirected to `/login` right after logging in**: the backend rejected the token (restarted database, expired session). `/auth/expire` clears the cookie; log in again.
- **"The backend is unreachable"**: check that the API answers on `TASKFLOW_API_URL` (`curl localhost:3000/health`).
- **Port 3001 in use**: run `npx next dev -p <port>` and adjust nothing else.
