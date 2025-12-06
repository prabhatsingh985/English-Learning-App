import { io } from "socket.io-client";

// In production, this would be an environment variable
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});
