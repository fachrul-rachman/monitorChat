export type SessionSummary = {
  session_id: string;
  last_message: string;
  last_message_at: string;
};

export type ChatMessage = {
  id: number;
  session_id: string;
  role: "human" | "ai";
  content: string;
  created_at: string;
};

export type SessionsResponse = {
  sessions: SessionSummary[];
};

export type MessagesResponse = {
  messages: ChatMessage[];
};
