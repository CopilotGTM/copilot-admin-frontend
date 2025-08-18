export interface UploadFileURL {
  file_name: string;
  file_type: string;
  file_size: number;
  session_id: string;
}

export interface UploadUrlResponse {
  upload_url: string;
}

// Interfaces
export type AttachmentMetadata = {
  filename: string;
  url: string;
  mimetype: string;
  size_bytes?: number;
  uploaded_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>;
};
