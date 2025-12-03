'use client';

import { Button } from "./ui/button";
import { SearchInput } from "./search-input";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { SessionListItem } from "./session-list-item";
import type { SessionSummary } from "@/lib/types";
import { useTheme } from "@/app/providers";

type InboxSidebarProps = {
  sessions?: SessionSummary[];
  isLoading: boolean;
  error?: Error | null;
  selectedSessionId: string | null;
  onSelect: (sessionId: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
};

export function InboxSidebar({
  sessions,
  isLoading,
  error,
  selectedSessionId,
  onSelect,
  searchValue,
  onSearchChange,
  onRefresh,
}: InboxSidebarProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const showEmpty =
    !isLoading && !error && (sessions?.length ?? 0) === 0 && searchValue === "";
  const showNoResults =
    !isLoading && !error && (sessions?.length ?? 0) === 0 && searchValue !== "";

  return (
    <aside
      className={`flex h-full min-h-0 w-full flex-col border-r ${
        isDark ? "border-slate-800/80 bg-slate-950" : "border-slate-100 bg-white"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Sessions
          </p>
          <p className="text-base font-semibold">
            Conversation Inbox
          </p>
        </div>
      </div>
      <div className="px-4">
        <SearchInput value={searchValue} onChange={onSearchChange} />
      </div>
      <div className="mt-3 flex-1 min-h-0">
        {isLoading ? (
          <div className="space-y-2 px-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={index}
                className={
                  isDark ? "h-16 w-full bg-slate-800/60" : "h-16 w-full"
                }
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <p className="text-sm font-semibold">
              Failed to load sessions
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {error.message || "Please try refreshing."}
            </p>
            <Button
              className={
                isDark
                  ? "mt-4 border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                  : "mt-4"
              }
              onClick={onRefresh}
            >
              Retry
            </Button>
          </div>
        ) : showEmpty ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center text-sm text-slate-500">
            No sessions available.
          </div>
        ) : showNoResults ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center text-sm text-slate-500">
            No matches for &quot;{searchValue}&quot;.
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-2 px-4 pb-4">
              {(sessions ?? []).map((session) => (
                <SessionListItem
                  key={session.session_id}
                  session={session}
                  isActive={session.session_id === selectedSessionId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </aside>
  );
}
