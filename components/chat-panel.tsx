'use client';

import { Download } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { Button } from "./ui/button";
import { MessageList } from "./message-list";
import { formatHeaderTimestamp } from "@/lib/time";
import { useTheme } from "@/app/providers";
import type { DataSource } from "@/lib/api";

type ChatPanelProps = {
  selectedSessionId: string | null;
  source: DataSource;
  messages?: ChatMessage[];
  isLoading: boolean;
  error?: Error | null;
  onRefresh: () => void;
  lastActivity?: string;
  isRealtimeConnected: boolean;
};

export function ChatPanel({
  selectedSessionId,
  source,
  messages,
  isLoading,
  error,
  onRefresh,
  lastActivity,
  isRealtimeConnected,
}: ChatPanelProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const tenant = source === "lestari" ? "lestari" : "al-azhar";

  const handleExportSingle = async () => {
    if (!selectedSessionId) return;

    try {
      const response = await fetch(
        `api/export?tenant=${tenant}&session_id=${encodeURIComponent(
          selectedSessionId,
        )}`,
      );
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to export chat.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `chat-${selectedSessionId}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      window.alert("Unable to export this chat. Please try again.");
    }
  };

  const handleExportAll = async () => {
    try {
      const response = await fetch(`api/export?tenant=${tenant}`);
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to export chats.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "chats-all.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      window.alert("Unable to export all chats. Please try again.");
    }
  };

  return (
    <section
      className={`flex h-full min-h-0 flex-1 flex-col ${
        isDark ? "bg-slate-900" : "bg-slate-50"
      }`}
    >
      <header
        className={`flex items-center justify-between border-b px-6 py-4 ${
          isDark ? "border-slate-800/80" : "border-slate-200"
        }`}
      >
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">
            Session
          </p>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">
              {selectedSessionId ?? "Not selected"}
            </h2>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                isRealtimeConnected
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-amber-500/10 text-amber-300"
              }`}
            >
              {isRealtimeConnected ? "Realtime online" : "Realtime fallback"}
            </span>
          </div>
          {lastActivity && (
            <p className="text-sm text-slate-400">
              Last activity {formatHeaderTimestamp(lastActivity)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSingle}
            disabled={!selectedSessionId}
            className={
              isDark
                ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 disabled:opacity-60"
                : "disabled:opacity-60"
            }
          >
            <Download className="mr-2 h-4 w-4" />
            Export This chat
          </Button>
          {/* <Button
            variant="outline"
            size="sm"
            onClick={handleExportAll}
            className={
              isDark
                ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                : undefined
            }
          >
            <Download className="mr-2 h-4 w-4" />
            Export all
          </Button> */}
        </div>
      </header>

      {error ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold">
            Unable to load messages
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {error.message || "Please try refreshing the session."}
          </p>
          <Button
            className={
              isDark
                ? "mt-4 border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                : "mt-4"
            }
            onClick={onRefresh}
          >
            Try again
          </Button>
        </div>
      ) : (
        <MessageList
          sessionId={selectedSessionId}
          messages={messages}
          isLoading={isLoading}
        />
      )}
    </section>
  );
}
