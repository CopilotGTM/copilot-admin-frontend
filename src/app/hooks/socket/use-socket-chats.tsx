"use client";

import { useState } from "react";
import { useSocket } from "../../contexts/socket-context";
import { sendMessage } from "../../../lib/socket";
import { SendMessageInput } from "../../schemas/chat";

export const useSocketChats = () => {
  const { socket } = useSocket();
  const [error, setError] = useState<string | null>(null);

  const sendQAChat = async (chatPayload: SendMessageInput) => {
    try {
      if (!socket || !socket.connected) {
        throw new Error("Socket is not connected");
      }

      // Send via socket
      sendMessage("send_chat_messages", chatPayload);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to send message:", err);
      setError("Failed to send message: " + err.message);
    }
  };

  const sendDeckChat = async (chatPayload: SendMessageInput) => {
    try {
      if (!socket || !socket.connected) {
        throw new Error("Socket is not connected");
      }

      // Send via socket
      sendMessage("send_transript_messages", chatPayload);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to send message:", err);
      setError("Failed to send message: " + err.message);
    }
  };

  return {
    socket,
    error,
    sendQAChat,
    sendDeckChat,
  };
};
