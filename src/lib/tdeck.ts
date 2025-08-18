import { FormattedTranscriptResponse, TDeckResponse } from "../app/types/tdeck";
import restAxiosInstance from "../core/rest-client/rest-client.axios";

export const getTdeckDetails = async (
  session_id: string,
  message_id: string,
  state: string,
): Promise<TDeckResponse> => {
  const response = await restAxiosInstance.get<TDeckResponse>(
    "/tdeck/get_details",
    {
      params: {
        session_id,
        message_id,
        state,
      },
    },
  );
  return response.data;
};

export const parseTranscript = async (
  session_id: string,
  teachnical_deck_message_id: string,
): Promise<FormattedTranscriptResponse> => {
  const response = await restAxiosInstance.get<FormattedTranscriptResponse>(
    "/tdeck/parse_transcript",
    {
      params: {
        session_id,
        teachnical_deck_message_id,
      },
    },
  );
  return response.data;
};
