"use client";

import { useState } from "react";
import { useSocket } from "../../contexts/socket-context";
import { sendMessage } from "../../../lib/socket";
import { GenerateDeckInput, GenerateOutlineInput } from "../../schemas/tdeck";

export const useSocketTDeck = () => {
  const { socket } = useSocket();
  const [error, setError] = useState<string | null>(null);

  const generateOutline = async (payload: GenerateOutlineInput) => {
    try {
      if (!socket || !socket.connected) {
        throw new Error("Socket is not connected");
      }

      // Send via socket
      sendMessage("generate_slide_content", payload);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to generate outline:", err);
      setError("Failed to generate outline: " + err.message);
    }
  };

  const generateDeck = async (payload: GenerateDeckInput) => {
    try {
      if (!socket || !socket.connected) {
        throw new Error("Socket is not connected");
      }

      // Send via socket
      sendMessage("generate_deck", payload);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to generate outline:", err);
      setError("Failed to generate outline: " + err.message);
    }
  };

  return {
    socket,
    error,
    generateOutline,
    generateDeck,
  };
};
