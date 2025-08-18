import { useInfiniteQuery } from "@tanstack/react-query";
import { getChat, getChats } from "../../lib/chat";
import { ChatListResponseData, MessageResponseData } from "../types/chat";
import { CHAT_LIST_LIMIT } from "../../lib/CONSTANTS";

export const useChatList = () => {
  const limit = CHAT_LIST_LIMIT;
  // Default limit for chat list, can be adjusted as needed

  return useInfiniteQuery<ChatListResponseData>({
    queryKey: ["chat_list", limit],
    queryFn: async ({ pageParam = "" }) => {
      return await getChats(limit, pageParam as string);
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.cursor,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // Keep cache for 10 minutes
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
  });
};

export const useChat = (session_id: string, limit: number) => {
  return useInfiniteQuery<MessageResponseData>({
    queryKey: ["chat", session_id, limit],
    queryFn: async ({ pageParam = "" }) => {
      return await getChat(session_id, limit, pageParam as string);
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.cursor,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // Keep cache for 10 minutes
    retry: 3, // Retry failed requests up to 3 times
    enabled: !!session_id, // only run if session_id is provided
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
  });
};

// export const useChat = (session_id: string) => {
//   return useQuery<MessageItemResponseData>({
//     queryKey: ["chat", session_id],
//     queryFn: () => getChat(session_id),
//     enabled: !!session_id, // only run if session_id is provided
//     staleTime: 1000 * 60 * 5, // 5 minutes
//     refetchOnWindowFocus: false,
//     refetchOnMount: false,
//   });
// };
