import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

let socketInstance: Socket | null = null;

const DEFAULT_SOCKET_URL = "http://localhost:4000";

function resolveSocketUrl() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return (
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.SOCKET_URL ||
    DEFAULT_SOCKET_URL
  );
}

export function getSocket() {
  if (typeof window === "undefined") {
    return null;
  }

  if (socketInstance) {
    return socketInstance;
  }

  const url = resolveSocketUrl();
  if (!url) {
    return null;
  }

  socketInstance = io(url, {
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
