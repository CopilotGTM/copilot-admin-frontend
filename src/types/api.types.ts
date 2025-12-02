// Global API types

export type ApiStatus = "SUCCESS" | "ERROR";

export interface ApiResponse<T> {
  status: ApiStatus;
  message: string;
  data: T | null;
}
