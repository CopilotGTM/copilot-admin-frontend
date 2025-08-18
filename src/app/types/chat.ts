import { DeckSlide } from "../../tdeck/deck";
import { TDeckState } from "./tdeck";

export interface ChatListResponseData {
  chats: ChatListItem[];
  cursor: string | null;
}

export interface ChatListItem {
  session_id: string;
  user_id: string;
  organisation_id: string;
  title: string;
  chat_type: string;
  chat_version: string;
  properties: Record<string, unknown>;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// export interface Message {
//   content: string;
//   role: "user" | "assistant";
//   id: string;
//   timestamp: string;
//   is_edited: boolean;
//   //isComplete: boolean;
//   //isError: boolean;
// }

export type RFPAnswerContent = {
  sheetname: string;
  row_number: number;
  answer: string;
  confidence_score: number;
  confidence_level: string;
};

export interface OutlineContent {
  slide_number: number;
  slide_title: string;
  slide_content: string;
}

export interface MessageChunk {
  chat_id: string;
  message_id: string;
  isComplete: boolean;
  isLineComplete: boolean;
  isError: boolean;
  response: string | RFPAnswerContent | OutlineContent | DeckSlide;
  message_type?: MessageType;
  isFirstMessage?: boolean;
  extras?: {
    completion_percentage: number | 0;
  };
}

export type MessageType = "GENERAL_MESSAGE" | "RFP_SHEET" | "TECHNICAL_DECK";

// Type for the individual message data in the chat
export interface MessageData {
  message_id: string;
  content: string;
  timestamp: string;
  role: "user" | "assistant";
  message_type: MessageType; // You may want to refine this based on actual values
  message_version: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachments: any; // Adjust this based on your actual attachment structure
  state?: TDeckState | "";
  //Additionals Props
  isError?: boolean;
}

export interface MessageResponseData {
  chat: MessageItem;
  cursor: string | null; // Assuming you have a user ID field
}

// Type for the ChatItem response
export interface MessageItem {
  session_id: string;
  user_id: string; // Assuming you have a user ID field
  organisation_id: string; // Assuming you have an organization ID
  title: string;
  created_at: string;
  updated_at: string;
  messages: MessageData[]; // Array of messages as defined above
}
