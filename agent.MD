# Agent Instructions — Chat Dashboard UI (WhatsApp-like)

## Goal

Build a production-ready internal **Chat Dashboard UI** that allows managers to view conversation history between **human users** and **AI**. The UI must look and behave like a familiar messaging inbox (WhatsApp-like), but is not a WhatsApp client and should not use WhatsApp branding.

The system reads chat history from **PostgreSQL** and displays:

* a left sidebar with conversation/session list
* a right panel with message thread for the selected session
* real-time updates when new messages arrive

Final output must be runnable locally in a single Next.js app. User will only need to change Postgres environment settings to connect to their DB. App must run on **port 3001**.

---

## Fixed Tech Stack (must use)

* **Next.js (React + TypeScript)** — App Router preferred
* **Tailwind CSS**
* **shadcn/ui**
* **TanStack Query**
* **Socket.IO client**

No alternative frameworks or libraries unless required for core Next.js setup.

---

## Data Source

### Database

PostgreSQL table already exists:

`n8n_chat_histories`

Columns:

* `id` (integer, primary key)
* `session_id` (text) — phone number or unique session key
* `message` (json/jsonb) — contains role/type and content
* `created_at` (timestamptz)

Example row (shape):

```json
{
  "type": "human" | "ai",
  "content": "string message text",
  "additional_kwargs": {},
  "response_metadata": {},
  "tool_calls": []
}
```

### Canonical mapping

* A **conversation** = all rows sharing the same `session_id`
* Message **role** = `message.type`

  * `"human"` → inbound user message (left bubble)
  * `"ai"` → outbound AI message (right bubble)
* Message **text** = `message.content`
* Ordering = `created_at ASC`

### Assumptions

* Only text messages are required for V1.
* The DB is the source of truth; no “fetch full history from WhatsApp API”.
* New messages will be pushed to the UI through Socket.IO events (see Realtime section).

---

## App Requirements

### 1) Layout (single main screen)

Two-column responsive layout:

**Left Sidebar (Inboxes)**
**Right Chat Panel (Thread)**

On small screens:

* Sidebar collapses into a drawer or stack above chat
* Still functional

### 2) Sidebar (Session List / Inbox)

Must contain:

1. **Search input**

   * Filters by `session_id` and last message snippet (client-side filtering is fine)
   * Debounced typing (reasonable delay)

2. **Session list**
   For each session show:

   * `session_id` (prominent)
   * last message snippet (1–2 lines)
   * last message time (relative display eg “2m ago”, “Yesterday”, etc.)
   * unread indicator (optional, but nice)

3. Sorting:

   * Descending by last message time
   * Sessions with most recent activity on top

4. Behavior:

   * On load, auto-select the newest session
   * Clicking a session loads and renders its thread
   * When a new message arrives:

     * Update session’s last snippet/time
     * Move session to top
     * If session currently open, append to thread

### 3) Chat Panel (Thread)

Split into:

#### A. Header

Show:

* selected `session_id`
* last activity time (derived from latest message)
* optional actions aligned right:

  * Refresh
  * Export (placeholder allowed; does not need implementation)

#### B. Messages List (scrollable)

Render a vertical thread:

* ordered by `created_at ASC`
* message bubbles:

  * **human** → left aligned bubble
  * **ai** → right aligned bubble
* bubble max width ~70% of panel
* timestamp small, muted, inside or under bubble
* consecutive messages from same role should have slightly reduced vertical spacing

Additional UX:

* Auto-scroll to bottom when:

  * a session is opened
  * a new message is appended **and** user is already near bottom
* If user scrolls upward, do not force scroll; instead show:

  * “New messages ↓” floating button that scrolls to bottom when clicked

#### C. Composer (optional)

Only include if explicitly easy:

* input + send button (disabled in V1)
  If uncertain, omit composer entirely.

### 4) Visual Style

* Use Tailwind + shadcn/ui.
* Neutral, clean internal dashboard look.
* Do **not** use WhatsApp logos, colors, or name in UI.
* Use subtle background for thread area.
* Use rounded, modern bubbles.

---

## Realtime (Socket.IO)

### Client behavior

* Connect on app load.
* Listen for these events:

1. `new_message`
   Payload shape:

```json
{
  "session_id": "string",
  "message": {
    "type": "human" | "ai",
    "content": "string"
  },
  "created_at": "ISO string",
  "id": number
}
```

### Update rules

When `new_message` arrives:

* If `session_id` not in sidebar, add it to top.
* If in sidebar:

  * update last snippet/time
  * move that session to top
* If this session is the currently open chat:

  * append bubble to thread in chronological order
  * apply scroll rules above

Socket.IO server is assumed to already exist or will be added later. The UI should not crash if socket is unavailable:

* show “Realtime disconnected” subtle indicator
* fallback to manual refresh (TanStack Query refetch)

---

## API Layer (inside Next.js)

Even though user only asked for UI, the final app must be usable by only changing Postgres config. Therefore:

* Implement internal API routes (Next.js Route Handlers) that query Postgres.
* Use environment variables for DB connection.

### Required endpoints

1. **Get sessions (sidebar)**

* Returns list of distinct sessions with last message and time.
* Limit default 50, allow pagination later.

2. **Get messages for a session**

* Query by `session_id`
* Return ordered messages with role, content, timestamps.

### Response shapes (frontend contract)

**Session item**

```json
{
  "session_id": "string",
  "last_message": "string",
  "last_message_at": "ISO string"
}
```

**Message item**

```json
{
  "id": number,
  "session_id": "string",
  "role": "human" | "ai",
  "content": "string",
  "created_at": "ISO string"
}
```

Note: role derived from `message.type`.

---

## TanStack Query Usage

* Query `sessions` for sidebar.
* Query `messages(session_id)` for thread.
* Cache per session.
* On socket `new_message`, update cache:

  * invalidate or directly patch cached data.
* Provide loading skeletons (shadcn/ui) for both sidebar and thread.

---

## Error & Empty States

Must include:

* sidebar loading & empty views
* thread loading state
* “no session selected” state (should not happen after auto-select, but safe)
* network/DB error message (lightweight UI alert)
* disconnected realtime indicator

---

## Project Structure Guidance

Use clean, modular structure. Example expectation:

* `/app`

  * `/dashboard/page.tsx` main screen
  * `/api/sessions/route.ts`
  * `/api/sessions/[session_id]/messages/route.ts`
* `/components`

  * `InboxSidebar`
  * `SessionList` + `SessionListItem`
  * `ChatPanel`
  * `MessageList` + `MessageBubble`
  * `SearchInput`
  * `NewMessagesButton`
* `/lib`

  * `db.ts` Postgres connector
  * `socket.ts` Socket.IO client wrapper
  * `time.ts` relative time helpers

Names can vary but keep separation of concerns.

---

## Environment Variables

Provide `.env.example` with placeholders:

* `DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME`
* `SOCKET_URL=http://localhost:XXXX` (safe default if missing)
* `PORT=3001` (or Next config to run on 3001)

User’s only expected change is Postgres settings.

---

## Runtime / Port

App must run on **[http://localhost:3001](http://localhost:3001)** by default.

Provide a `package.json` dev script that starts Next.js on port 3001.

---

## Definition of Done

The delivered app should:

1. Start on port 3001 without manual edits besides installing deps.
2. Load sessions from Postgres and show them in sidebar.
3. Auto-select latest session and load its messages.
4. Render WhatsApp-like bubbles left/right based on role.
5. Support realtime updates via Socket.IO with graceful fallback.
6. Be internally clean, typed, and ready to deploy.

No scripts or sample data required in the output besides the app itself.

---
