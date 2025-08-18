import restAxiosInstance from "../core/rest-client/rest-client.axios";
import type { DocumentEditorProps } from "@onlyoffice/document-editor-react";

interface OnlyOfficeTokenResponse {
  token: string;
}
/**
 * Request a signed ONLYOFFICE JWT for the given editor config.
 */
export const fetchOnlyOfficeToken = async (
  config: DocumentEditorProps["config"],
): Promise<string> => {
  const response = await restAxiosInstance.post<OnlyOfficeTokenResponse>(
    "/onlyoffice/token",
    { config },
  );
  return response.data.token;
};
