import type {
  ChatMessage,
  MessagesResponse,
  SessionSummary,
  SessionsResponse,
} from "./types";

export type DataSource = "al-azhar" | "lestari";

async function handleResponse<T>(response: Response) {
  if (!response.ok) {
    const text = await response.text();
    let message = "Unexpected API error.";

    if (text) {
      try {
        const data = JSON.parse(text) as unknown;
        if (
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
        ) {
          message = (data as { error: string }).error;
        } else {
          message = text;
        }
      } catch {
        message = text;
      }
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

function toTenant(source: DataSource) {
  return source === "lestari" ? "lestari" : "al-azhar";
}

export async function fetchSessions(source: DataSource) {
  const tenant = toTenant(source);
  const response = await fetch(`api/sessions?tenant=${tenant}`, {
    cache: "no-store",
  });
  const payload = await handleResponse<SessionsResponse>(response);
  return payload.sessions;
}

export async function fetchMessages(sessionId: string, source: DataSource) {
  const tenant = toTenant(source);
  const response = await fetch(
    `api/sessions/${encodeURIComponent(
      sessionId,
    )}/messages?tenant=${tenant}`,
    { cache: "no-store" },
  );
  const payload = await handleResponse<MessagesResponse>(response);
  return payload.messages;
}

export function mergeSession(
  sessions: SessionSummary[],
  incoming: SessionSummary,
) {
  const without = sessions.filter(
    (session) => session.session_id !== incoming.session_id,
  );
  return [incoming, ...without].sort(
    (a, b) =>
      new Date(b.last_message_at).getTime() -
      new Date(a.last_message_at).getTime(),
  );
}

export function appendMessage(
  messages: ChatMessage[] | undefined,
  incoming: ChatMessage,
) {
  if (!messages) {
    return [incoming];
  }

  const exists = messages.some((message) => message.id === incoming.id);
  if (exists) {
    return messages;
  }

  return [...messages, incoming].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}
