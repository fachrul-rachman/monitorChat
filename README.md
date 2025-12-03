# Chat Dashboard UI

Internal dashboard for reviewing WhatsApp-like conversations between human users and AI. The app renders a two-pane inbox/thread experience, loads chat history from PostgreSQL, and listens for realtime updates from a Socket.IO server.

## Prerequisites

- Node.js 18+
- PostgreSQL database populated with the `n8n_chat_histories` table

## Environment

1. Copy `.env.example` to `.env`.
2. Update the values as needed:
   - `DATABASE_URL` – connection string to your Postgres instance.
   - `SOCKET_URL` / `NEXT_PUBLIC_SOCKET_URL` – URL of your Socket.IO server (optional; defaults to the app origin).
   - `PORT` – defaults to `3001`.

## Install & Run

```bash
npm install
npm run dev
```

The dashboard runs at [http://localhost:3001](http://localhost:3001).

### Socket.IO relay (optional)

If you want local realtime broadcasting, start the bundled Socket.IO server (listens on port `4000` by default) and tunnel/forward that port as needed:

```bash
npm run socket:server
```

Send `POST` requests to `http://localhost:4000/events/new-message` with the `new_message` payload and the dashboard will receive them immediately.

## Project Highlights

- **Next.js App Router (TypeScript)** with Tailwind CSS + shadcn/ui primitives.
- **TanStack Query** handles sidebar/thread data, caching, and refetching.
- **Socket.IO client** streams `new_message` events from `http://localhost:4000` by default (override via env vars) and keeps the UI in sync.
- **API routes** (`/api/sessions`, `/api/sessions/[session_id]/messages`) read from Postgres via a pooled connection.
- Sidebar search with debounce, responsive layout, loading skeletons, error/empty states, and scroll-aware “New messages” affordance in the thread.
