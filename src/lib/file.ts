import { UploadFileURL, UploadUrlResponse } from "../app/types/file";
import restAxiosInstance from "../core/rest-client/rest-client.axios";

export const getUploadUrl = async (
  data: UploadFileURL,
): Promise<UploadUrlResponse> => {
  const response = await restAxiosInstance.post<UploadUrlResponse>(
    "/files/get_upload_url",
    data,
  );
  return response.data;
};

export const uploadFileToSignedUrl = async ({
  upload_url,
  file,
}: {
  upload_url: string;
  file: File;
}): Promise<void> => {
  await restAxiosInstance.put(upload_url, file, {
    headers: {
      "Content-Type": file.type,
    },
    // Disable default auth headers for signed URL
    transformRequest: [
      (data, headers) => {
        delete headers.Authorization; // Remove auth header if present
        return data;
      },
    ],
  });
};
