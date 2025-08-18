"use client";

import { useState } from "react";
import { useSocket } from "../../contexts/socket-context";
import { sendMessage } from "../../../lib/socket";
import { GenerateAnswersInput } from "../../schemas/rfp";

export const useSocketRFP = () => {
  const { socket } = useSocket();
  const [error, setError] = useState<string | null>(null);

  const generateAnswers = async (payload: GenerateAnswersInput) => {
    try {
      if (!socket || !socket.connected) {
        throw new Error("Socket is not connected");
      }

      // Send via socket
      sendMessage("send_sheet_selections", payload);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to generate outline:", err);
      setError("Failed to generate outline: " + err.message);
    }
  };

  return {
    socket,
    error,
    generateAnswers,
  };
};
