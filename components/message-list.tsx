"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { MessageBubble } from "./message-bubble";
import { NewMessagesButton } from "./new-messages-button";
import { Skeleton } from "./ui/skeleton";

type MessageListProps = {
  messages?: ChatMessage[];
  isLoading: boolean;
  sessionId: string | null;
};

const GROUP_GAP_MS = 3 * 60 * 1000;

export function MessageList({
  messages = [],
  isLoading,
  sessionId,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNotice, setShowNotice] = useState(false);
  const previousCount = useRef(0);

  const groupedMessages = useMemo(() => {
    return messages.map((message, index) => {
      const previous = messages[index - 1];
      const isFirstOfGroup =
        !previous ||
        previous.role !== message.role ||
        new Date(message.created_at).getTime() -
          new Date(previous.created_at).getTime() >
          GROUP_GAP_MS;
      return { message, isFirstOfGroup };
    });
  }, [messages]);

  useEffect(() => {
    previousCount.current = 0;
  }, [sessionId]);

  useEffect(() => {
    if (!scrollRef.current) return;
    const element = scrollRef.current;

    const handleScroll = () => {
      const isNearBottom =
        element.scrollHeight - element.scrollTop - element.clientHeight < 120;
      setIsAtBottom(isNearBottom);
      if (isNearBottom) {
        setShowNotice(false);
      }
    };

    element.addEventListener("scroll", handleScroll, { passive: true });
    return () => element.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      if (!scrollRef.current) {
        return;
      }
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
      setShowNotice(false);
    });
  }, []);

  useEffect(() => {
    if (sessionId) {
      scrollToBottom(false);
    }
  }, [sessionId, scrollToBottom]);

  useEffect(() => {
    let noticeFrame: number | null = null;

    if (messages.length === 0) {
      scrollToBottom(false);
      return () => {
        if (noticeFrame) {
          cancelAnimationFrame(noticeFrame);
        }
      };
    }

    const addedNewerMessage = messages.length > previousCount.current;
    previousCount.current = messages.length;

    if (addedNewerMessage) {
      if (isAtBottom) {
        scrollToBottom();
      } else {
        noticeFrame = requestAnimationFrame(() => setShowNotice(true));
      }
    }
    return () => {
      if (noticeFrame) {
        cancelAnimationFrame(noticeFrame);
      }
    };
  }, [messages, isAtBottom, scrollToBottom]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col justify-end space-y-2 p-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-1/2" />
        ))}
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
        Select a session to view the conversation thread.
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={scrollRef}
        className="flex h-full flex-col space-y-2 overflow-y-auto px-4 pb-20 pt-4"
      >
        {groupedMessages.length === 0 ? (
          <p className="mt-6 text-center text-sm text-slate-500">
            No messages yet.
          </p>
        ) : (
          groupedMessages.map(({ message, isFirstOfGroup }) => (
            <MessageBubble
              key={message.id}
              message={message}
              isFirstOfGroup={isFirstOfGroup}
            />
          ))
        )}
      </div>
      <NewMessagesButton
        visible={showNotice && !isAtBottom}
        onClick={() => scrollToBottom()}
      />
    </div>
  );
}
