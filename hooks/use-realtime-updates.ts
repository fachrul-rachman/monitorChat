"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import type { ChatMessage, SessionSummary } from "@/lib/types";
import { appendMessage, mergeSession, type DataSource } from "@/lib/api";

type UseRealtimeUpdatesOptions = {
  activeSessionId: string | null;
  source: DataSource;
};

type NewMessagePayload = {
  session_id: string;
  message: {
    type: "human" | "ai";
    content: string;
  };
  created_at: string;
  id: number;
};

export function useRealtimeUpdates({
  activeSessionId,
  source,
}: UseRealtimeUpdatesOptions) {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let statusFrame: number | null = null;
    const setStatus = (value: boolean) => {
      statusFrame = requestAnimationFrame(() => setConnected(value));
    };

    const socket = getSocket();
    if (!socket) {
      setStatus(false);
      return () => {
        if (statusFrame) {
          cancelAnimationFrame(statusFrame);
        }
      };
    }

    if (!socket.connected) {
      socket.connect();
    }

    setStatus(socket.connected);

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleNewMessage = (payload: NewMessagePayload) => {
      const sessionSummary: SessionSummary = {
        session_id: payload.session_id,
        last_message: payload.message.content,
        last_message_at: payload.created_at,
      };

      queryClient.setQueryData<SessionSummary[]>(
        ["sessions", source],
        (current) => {
          if (!current) return [sessionSummary];
          return mergeSession(current, sessionSummary);
        },
      );

      const newMessage: ChatMessage = {
        id: payload.id,
        session_id: payload.session_id,
        role: payload.message.type === "ai" ? "ai" : "human",
        content: payload.message.content,
        created_at: payload.created_at,
      };

      if (activeSessionId === payload.session_id) {
        queryClient.setQueryData<ChatMessage[] | undefined>(
          ["messages", source, payload.session_id],
          (messages) => appendMessage(messages, newMessage),
        );
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("new_message", handleNewMessage);
      if (statusFrame) {
        cancelAnimationFrame(statusFrame);
      }
    };
  }, [activeSessionId, queryClient, source]);

  return connected;
}
