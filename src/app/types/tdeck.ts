import { OutlineContent } from "./chat";

export interface Dialogue {
  speaker: string;
  content: string;
  timestamp: string;
}

export interface Section {
  section_name: string;
  dialogues: Dialogue[];
}

export interface Transcript {
  meeting_title: string;
  sections: Section[];
}

export interface FormattedTranscriptResponse {
  status: string;
  data: {
    formatted_transcript: Transcript[];
  };
  message: string;
}

export interface TranscriptSummary {
  url: string;
  summary: string;
}

export type SummaryData = {
  formatted_transcript: Transcript[];
  complete_transcript_summary: string;
};

export type OutlineData = {
  slide_content_summary: OutlineContent[];
  user_outline_input: Record<string, unknown>;
};

export type DeckData = {
  technical_deck_url: string;
};

export interface TDeckResponse {
  status: "SUCCESS" | "ERROR" | string;
  data: SummaryData | OutlineData | DeckData;
  message: string;
}

export type TDeckState =
  | "TRANSCRIPT_SUMMARY"
  | "SLIDE_CONTENT"
  | "SLIDE_TEMPLATE"
  | "SLIDE_OUTPUT";
