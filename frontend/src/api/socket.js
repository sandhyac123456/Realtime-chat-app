import { io } from "socket.io-client";

const SOCKET_URL = "https://realtime-chat-app-a8xi.onrender.com";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
});