'use client';

import type { SessionSummary } from "@/lib/types";
import { formatTimestampLabel } from "@/lib/time";
import { cn } from "@/lib/utils";

type SessionListItemProps = {
  session: SessionSummary;
  isActive: boolean;
  onSelect: (sessionId: string) => void;
};

export function SessionListItem({
  session,
  isActive,
  onSelect,
}: SessionListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(session.session_id)}
      className={cn(
        "flex w-full flex-col rounded-lg border border-transparent bg-white p-3 text-left transition hover:bg-slate-50",
        isActive && "border-emerald-500 bg-emerald-50",
      )}
    >
      <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
        <span className="truncate">{session.session_id}</span>
        <span className="text-xs font-normal text-slate-500">
          {formatTimestampLabel(session.last_message_at)}
        </span>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-slate-600">
        {session.last_message || "No messages yet"}
      </p>
    </button>
  );
}
