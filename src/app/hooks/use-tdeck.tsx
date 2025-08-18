import { useQuery } from "@tanstack/react-query";
import {} from "../../lib/chat";
import { getTdeckDetails, parseTranscript } from "../../lib/tdeck";
import { FormattedTranscriptResponse, TDeckResponse } from "../types/tdeck";

export const useTdeckDetails = (
  session_id: string,
  message_id: string,
  state: string,
  openBy: "Auto" | "Click",
) => {
  console.log("@@@@@@calling");
  return useQuery<TDeckResponse>({
    queryKey: ["tdeck_details", session_id, message_id, state],
    queryFn: () => getTdeckDetails(session_id, message_id, state),
    enabled: !!session_id && !!message_id && openBy === "Click", // only run if session_id and message_id are provided
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // initialData: {
    //   data: { complete_transcript_summary: "", formatted_transcript: [] },
    //   status: "SUCESS",
    //   message: "Initial data loaded",
    // },
  });
};

export const useParseTranscript = (
  session_id: string,
  teachnical_deck_message_id: string,
  openBy: "Auto" | "Click",
) => {
  return useQuery<FormattedTranscriptResponse>({
    queryKey: [
      "parse_transcript",
      session_id,
      teachnical_deck_message_id,
      openBy,
    ],
    queryFn: () => parseTranscript(session_id, teachnical_deck_message_id),
    enabled: !!session_id && !!teachnical_deck_message_id && openBy === "Auto",
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
