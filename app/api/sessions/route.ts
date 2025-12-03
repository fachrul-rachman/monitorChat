import { NextResponse } from "next/server";
import { query, type Tenant } from "@/lib/db";
import type { SessionsResponse } from "@/lib/types";

type SessionRow = {
  session_id: string;
  last_message: string | null;
  last_message_at: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const tenantParam = searchParams.get("tenant");
    const tenant: Tenant =
      tenantParam === "lestari" ? "lestari" : "al-azhar";
    const parsedLimit = Number(limitParam);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 50;

    const result = await query<SessionRow>(
      `
        WITH ranked AS (
          SELECT
            session_id,
            message,
            created_at,
            ROW_NUMBER() OVER (
              PARTITION BY session_id
              ORDER BY created_at DESC
            ) AS row_number
          FROM n8n_chat_histories
        )
        SELECT
          session_id,
          COALESCE(message->>'content', '') AS last_message,
          created_at AS last_message_at
        FROM ranked
        WHERE row_number = 1
        ORDER BY created_at DESC
        LIMIT $1
      `,
      [limit],
      tenant,
    );

    const payload: SessionsResponse = {
      sessions: result.rows.map((row) => ({
        session_id: row.session_id,
        last_message: row.last_message ?? "",
        last_message_at: row.last_message_at,
      })),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Failed to fetch sessions", error);
    return NextResponse.json(
      { error: "Unable to fetch sessions." },
      { status: 500 },
    );
  }
}
