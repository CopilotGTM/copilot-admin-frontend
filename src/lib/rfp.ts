import { SendMessageInput } from "../app/schemas/chat";
import { RFPSheetResponse } from "../app/types/rfp";
import restAxiosInstance from "../core/rest-client/rest-client.axios";

export const identifyRFPSheet = async (
  data: SendMessageInput,
): Promise<RFPSheetResponse> => {
  const response = await restAxiosInstance.post<RFPSheetResponse>(
    "/rfp/identify_sheet",
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};
