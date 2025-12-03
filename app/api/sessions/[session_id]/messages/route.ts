import { NextResponse } from "next/server";
import { query, type Tenant } from "@/lib/db";
import type { MessagesResponse } from "@/lib/types";

type MessageRow = {
  id: number;
  session_id: string;
  role: "human" | "ai" | null;
  content: string | null;
  created_at: string;
};

type RouteContext = {
  params: Promise<{
    session_id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantParam = searchParams.get("tenant");
    const tenant: Tenant =
      tenantParam === "lestari" ? "lestari" : "al-azhar";

    const { session_id } = await context.params;
    const sessionId = session_id;
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session id is required." },
        { status: 400 },
      );
    }

    const result = await query<MessageRow>(
      `
        SELECT
          id,
          session_id,
          COALESCE(message->>'type', 'human') AS role,
          COALESCE(message->>'content', '') AS content,
          created_at
        FROM n8n_chat_histories
        WHERE session_id = $1
        ORDER BY created_at ASC
      `,
      [sessionId],
      tenant,
    );

    const payload: MessagesResponse = {
      messages: result.rows.map((row) => ({
        id: row.id,
        session_id: row.session_id,
        role: row.role === "ai" ? "ai" : "human",
        content: row.content ?? "",
        created_at: row.created_at,
      })),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Failed to fetch chat messages", error);
    return NextResponse.json(
      { error: "Unable to fetch messages." },
      { status: 500 },
    );
  }
}
