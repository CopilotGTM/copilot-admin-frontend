import restAxiosInstance from "../core/rest-client/rest-client.axios";
import { CreateChatInput } from "../app/schemas/chat";
import {
  ChatListItem,
  ChatListResponseData,
  MessageResponseData,
} from "../app/types/chat";

export const createChat = async (
  data: CreateChatInput,
): Promise<ChatListItem> => {
  const response = await restAxiosInstance.post<ChatListItem>(
    "/chats/create_chat",
    data,
  );
  return response.data;
};

export const getChats = async (
  limit: number,
  cursor: string,
): Promise<ChatListResponseData> => {
  const response = await restAxiosInstance.get<ChatListResponseData>(
    `/chats/get_chats?limit=${limit}&cursor=${cursor}`,
  );
  return response.data;
};

export const getChat = async (
  session_id: string,
  limit: number,
  cursor: string,
): Promise<MessageResponseData> => {
  const response = await restAxiosInstance.get<MessageResponseData>(
    `/chats/get_chat/${session_id}?limit=${limit}&cursor=${cursor}`,
  );
  return response.data;
};
