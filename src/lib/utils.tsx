import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind class merging utility — used by all design system components */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { JSX } from "react";
import { FileSpreadsheet, FileText, FileImage } from "lucide-react";

// Map file extensions to icons
export const fileIconMap: { [key: string]: JSX.Element } = {
  xlsx: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
  docx: <FileText className="h-4 w-4 text-blue-500" />,
  pdf: <FileText className="h-4 w-4 text-red-500" />,
  // Image file icons
  jpg: <FileImage className="h-4 w-4 text-purple-500" />,
  jpeg: <FileImage className="h-4 w-4 text-purple-500" />,
  png: <FileImage className="h-4 w-4 text-purple-500" />,
  gif: <FileImage className="h-4 w-4 text-purple-500" />,
  webp: <FileImage className="h-4 w-4 text-purple-500" />,
  svg: <FileImage className="h-4 w-4 text-purple-500" />,
};

// Image mime types that support thumbnails
export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

// Check if a file is an image based on mime type
export const isImageFile = (mimetype: string): boolean => {
  return IMAGE_MIME_TYPES.includes(mimetype) || mimetype.startsWith("image/");
};

// Check if a file is an image based on extension
export const isImageExtension = (filename: string): boolean => {
  const ext = getFileExtension(filename).toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(
    ext,
  );
};

/**
 * Generate a thumbnail URL from a File object
 * Creates a local object URL for immediate preview
 */
export const generateThumbnailUrl = (file: File): string | null => {
  if (!isImageFile(file.type)) {
    return null;
  }
  return URL.createObjectURL(file);
};

/**
 * Revoke a thumbnail URL to free memory
 * Should be called when the thumbnail is no longer needed
 */
export const revokeThumbnailUrl = (url: string): void => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

// Function to get file extension
export const getFileExtension = (fileName: string) => {
  return fileName.split(".").pop()?.toLowerCase() || "";
};

// Function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
