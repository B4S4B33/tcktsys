# BugTrack frontend

React (Vite) frontend for the Bug Tracker Scrum project. It has three separate portals (user, developer, admin), each with its own sign-in page.

## Run it

```bash
npm install
cp .env.example .env      # demo mode is on by default
npm run dev               # http://localhost:5173
```

In **demo mode** (`VITE_USE_MOCK=true`) the app runs entirely in the browser with sample data, so you can use it and take screenshots without a backend. Demo accounts (password `demo123`):

| Portal | Email |
| --- | --- |
| User | `user@demo.com` (second user: `user2@demo.com`) |
| Developer | `dev@demo.com` (second developer: `dev2@demo.com`) |
| Admin | `admin@demo.com` |

"Reset demo data" on the home page restores the sample tickets.

To use the real backend, set `VITE_USE_MOCK=false` and build the Express API described below. In development, `/api` is proxied to `http://localhost:5000`.

## Pages

| Route | Who | What |
| --- | --- | --- |
| `/` | Anyone | Portal chooser |
| `/user/login`, `/developer/login`, `/admin/login` | Anyone | One sign-in per role; a wrong-role account is rejected |
| `/user/register` | Anyone | User self-registration |
| `/user`, `/user/tickets/new`, `/user/tickets/:id` | User | My tickets, report a bug, ticket detail with the feedback form |
| `/developer`, `/developer/tickets/:id` | Developer | My assignments, start and resolve |
| `/admin`, `/admin/tickets/:id`, `/admin/developers` | Admin | All tickets, assign, close or reopen, developer accounts |

## Structure

```
src/
├── App.jsx                  routes
├── auth/                    AuthContext (session), ProtectedRoute (role guard)
├── services/
│   ├── api.js               real API client; exports the mock when VITE_USE_MOCK=true
│   └── mockApi.js           in-browser backend with the same status rules
├── components/              Layout, NotificationBell, TicketTable, filters, badges, lifecycle tracker
└── pages/                   Home, Login, Register, user/, developer/, admin/, shared/TicketDetail
```

## API contract the backend must follow

Base URL `VITE_API_URL` (default `/api`). Send `Authorization: Bearer <token>`. Errors return `{ "message": "..." }` with a matching status code (400, 401, 403, 404, 409). The frontend shows `message` to the person.

**Ticket object** (returned by every ticket endpoint):

```json
{
  "id": "uuid", "title": "...", "description": "...",
  "severity": "low|medium|high|critical",
  "status": "open|assigned|in_progress|resolved|closed|reopened",
  "resolution_notes": "... or null",
  "created_at": "ISO date", "updated_at": "ISO date",
  "reporter": { "id": "uuid", "full_name": "..." },
  "assignee": { "id": "uuid", "full_name": "..." },
  "feedback": { "rating": 1, "comment": "...", "created_at": "ISO date" }
}
```
`assignee` and `feedback` are `null` when not set.

| Method and path | Body | Returns |
| --- | --- | --- |
| `POST /auth/login` | `{ portal, email, password }` | `{ token, id, role, name }`; 403 if `role` is not `portal` or the account is inactive |
| `POST /auth/register` | `{ full_name, email, password }` | `201`; role is always `user` |
| `POST /auth/logout` | | `{}` |
| `POST /tickets` | `{ title, description, severity }` | ticket |
| `GET /tickets/mine` | | ticket[] (newest first) |
| `GET /tickets/assigned` | | ticket[] (closed last, then severity, then age) |
| `GET /admin/tickets` | optional `status`, `severity`, `developer`, `q` | ticket[] (closed last, then severity, then age) |
| `GET /tickets/:id` | | `{ ticket, history, feedback }`; history rows: `{ id, from_status, to_status, note, changed_at, changed_by_name }` |
| `PATCH /tickets/:id/assign` | `{ developerId }` | ticket |
| `PATCH /tickets/:id/start` | | ticket |
| `PATCH /tickets/:id/resolve` | `{ notes }` | ticket |
| `POST /tickets/:id/feedback` | `{ rating, comment }` | ticket |
| `PATCH /tickets/:id/close` | | ticket |
| `PATCH /tickets/:id/reopen` | | ticket |
| `GET /admin/developers` | | `[{ id, full_name, email, is_active, active_tickets }]` |
| `POST /admin/developers` | `{ full_name, email, password }` | `201` |
| `PATCH /admin/developers/:id/deactivate` and `/activate` | | developer |
| `GET /notifications` | | `[{ id, ticket_id, message, is_read, created_at }]` (newest first) |
| `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` | | `{}` |

**Reopen rule:** when the admin reopens a ticket, the backend records the rating in the history note and clears that ticket's feedback row, so the next fix is rated again.
