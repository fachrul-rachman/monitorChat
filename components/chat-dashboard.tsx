"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InboxSidebar } from "./inbox-sidebar";
import { ChatPanel } from "./chat-panel";
import { ThemeToggle } from "./theme-toggle";
import { fetchMessages, fetchSessions, type DataSource } from "@/lib/api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useRealtimeUpdates } from "@/hooks/use-realtime-updates";
import { useTheme } from "@/app/providers";
import { Button } from "./ui/button";

export function ChatDashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [source, setSource] = useState<DataSource>("al-azhar");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [manualSessionId, setManualSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("dashboard-source");
    if (stored === "al-azhar" || stored === "lestari") {
      setSource(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("dashboard-source", source);
    setManualSessionId(null);
  }, [source]);

  const {
    data: sessions,
    isLoading: sessionsLoading,
    isRefetching: sessionsRefetching,
    error: sessionsError,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["sessions", source],
    queryFn: () => fetchSessions(source),
    refetchInterval: 15000,
  });

  const selectedSessionId = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return null;
    }
    if (
      manualSessionId &&
      sessions.some((session) => session.session_id === manualSessionId)
    ) {
      return manualSessionId;
    }
    return sessions[0].session_id;
  }, [sessions, manualSessionId]);

  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
    isRefetching: messagesRefetching,
  } = useQuery({
    queryKey: ["messages", source, selectedSessionId],
    queryFn: () => fetchMessages(selectedSessionId as string, source),
    enabled: Boolean(selectedSessionId),
    refetchInterval: selectedSessionId ? 10000 : false,
  });

  const realtimeConnected = useRealtimeUpdates({
    activeSessionId: selectedSessionId,
  });

  const filteredSessions = useMemo(() => {
    if (!sessions) {
      return [];
    }
    if (!debouncedSearch) {
      return sessions;
    }
    const lowered = debouncedSearch.toLowerCase();
    return sessions.filter((session) => {
      const message = session.last_message ? session.last_message : "";
      return (
        session.session_id.toLowerCase().includes(lowered) ||
        message.toLowerCase().includes(lowered)
      );
    });
  }, [sessions, debouncedSearch]);

  const activeSession = sessions?.find(
    (session) => session.session_id === selectedSessionId,
  );

  const handleRefresh = async () => {
    await refetchSessions();
    if (selectedSessionId) {
      await refetchMessages();
    }
  };

  const normalizedSessionsError =
    sessionsError instanceof Error
      ? sessionsError
      : sessionsError
        ? new Error("Unable to load sessions.")
        : undefined;

  const normalizedMessagesError =
    messagesError instanceof Error
      ? messagesError
      : messagesError
        ? new Error("Unable to load messages.")
        : undefined;

  return (
    <div
      className={`flex h-screen flex-col overflow-hidden ${
        isDark
          ? "bg-slate-950 text-slate-50"
          : "bg-white text-slate-900"
      }`}
    >
      <header
        className={`flex items-center justify-between border-b px-6 py-4 lg:px-8 ${
          isDark ? "border-slate-800/80" : "border-slate-100"
        }`}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Internal Dashboard
          </p>
          <h1 className="mt-0.5 text-lg font-semibold">
            Conversation Review Console
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1 rounded-2xl border px-1 py-0.5 text-xs ${
              isDark
                ? "border-slate-700 bg-slate-900/70 text-slate-100"
                : "border-slate-200 bg-slate-50 text-slate-800"
            }`}
          >
            <Button
              type="button"
              size="sm"
              variant={source === "al-azhar" ? "default" : "ghost"}
              className={`h-7 px-2 text-xs ${
                source === "al-azhar"
                  ? "rounded-xl bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
                  : "rounded-xl"
              }`}
              onClick={() => setSource("al-azhar")}
            >
              Al Azhar
            </Button>
            <Button
              type="button"
              size="sm"
              variant={source === "lestari" ? "default" : "ghost"}
              className={`h-7 px-2 text-xs ${
                source === "lestari"
                  ? "rounded-xl bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
                  : "rounded-xl"
              }`}
              onClick={() => setSource("lestari")}
            >
              Lestari
            </Button>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex w-full min-h-0 flex-col border-b border-slate-800/60 lg:w-[360px] lg:flex-none lg:border-b-0 lg:border-r">
          <InboxSidebar
            sessions={filteredSessions}
            isLoading={sessionsLoading}
            isRefetching={sessionsRefetching}
            error={normalizedSessionsError}
            selectedSessionId={selectedSessionId}
            onSelect={setManualSessionId}
            searchValue={search}
            onSearchChange={setSearch}
            onRefresh={handleRefresh}
          />
        </div>
        <ChatPanel
          selectedSessionId={selectedSessionId}
          messages={messages}
          isLoading={messagesLoading && Boolean(selectedSessionId)}
          error={normalizedMessagesError}
          onRefresh={handleRefresh}
          isRefetching={messagesRefetching || sessionsRefetching}
          lastActivity={activeSession?.last_message_at}
          isRealtimeConnected={realtimeConnected}
        />
      </div>
    </div>
  );
}
