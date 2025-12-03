import { NextResponse } from "next/server";
import { query, type Tenant } from "@/lib/db";

type ExportRow = {
  id: number;
  session_id: string;
  role: string | null;
  content: string | null;
  created_at: string;
};

function toTenant(param: string | null): Tenant {
  return param === "lestari" ? "lestari" : "al-azhar";
}

function csvCell(raw: unknown) {
  const value = String(raw ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/"/g, '""');
  return `"${value}"`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantParam = searchParams.get("tenant");
    const tenant = toTenant(tenantParam);
    const sessionIdParam = searchParams.get("session_id");
    const sessionId = sessionIdParam ? sessionIdParam.trim() : "";

    const isSingleSession = Boolean(sessionId);

    const rows = await query<ExportRow>(
      `
        SELECT
          id,
          session_id,
          COALESCE(message->>'type', 'human') AS role,
          COALESCE(message->>'content', '') AS content,
          created_at
        FROM n8n_chat_histories
        ${isSingleSession ? "WHERE session_id = $1" : ""}
        ORDER BY session_id ASC, created_at ASC
      `,
      isSingleSession ? [sessionId] : [],
      tenant,
    );

    const header = [
      "session_id",
      "message_id",
      "role",
      "content",
      "created_at",
    ].join(",");

    const lines = rows.rows.map((row) =>
      [
        csvCell(row.session_id),
        csvCell(String(row.id)),
        csvCell(row.role === "ai" ? "ai" : "human"),
        csvCell(row.content ?? ""),
        csvCell(row.created_at),
      ].join(","),
    );

    const csv = [header, ...lines].join("\n");

    const filename = isSingleSession
      ? `chat-${sessionId}.csv`
      : "chats-all.csv";

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to export chats", error);
    return NextResponse.json(
      { error: "Unable to export chats." },
      { status: 500 },
    );
  }
}
