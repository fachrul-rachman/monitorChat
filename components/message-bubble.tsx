'use client';

import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatTimestampLabel } from "@/lib/time";

type MessageBubbleProps = {
  message: ChatMessage;
  isFirstOfGroup: boolean;
};

export function MessageBubble({
  message,
  isFirstOfGroup,
}: MessageBubbleProps) {
  const isHuman = message.role === "human";
  const parts = message.content.split(/(\*\*[^*]+?\*\*)/g);

  return (
    <div
      className={cn(
        "flex w-full px-2 sm:px-4",
        isHuman ? "justify-start" : "justify-end",
        !isFirstOfGroup && "-mt-1.5",
      )}
    >
      <div
        className={cn(
          "w-full max-w-full sm:max-w-[72%] md:max-w-[64%] rounded-2xl px-4 py-2 text-sm shadow-sm",
          isHuman
            ? "mr-auto rounded-bl-sm bg-white text-slate-900"
            : "ml-auto rounded-br-sm bg-emerald-600 text-white",
        )}
      >
        <p className="whitespace-pre-wrap break-words">
          {parts.map((part, index) => {
            const match = part.match(/^\*\*(.+)\*\*$/);
            if (match) {
              return (
                <strong key={index} className="font-semibold">
                  {match[1]}
                </strong>
              );
            }
            return <span key={index}>{part}</span>;
          })}
        </p>
        <p
          className={cn(
            "mt-1 text-[10px] uppercase tracking-wide",
            isHuman ? "text-slate-400" : "text-emerald-100",
          )}
        >
          {formatTimestampLabel(message.created_at)}
        </p>
      </div>
    </div>
  );
}
