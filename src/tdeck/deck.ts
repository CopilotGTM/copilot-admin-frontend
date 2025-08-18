export interface DeckCover {
  type: "cover";
  data: {
    title: string;
    text: string;
    image?: string;
  };
}

export interface DeckContents {
  type: "contents";
  data: {
    items: string[];
    image?: string;
  };
  offset?: number;
}

export interface DeckTransition {
  type: "transition";
  data: {
    title: string;
    text: string;
    image?: string;
  };
}

export interface DeckContent {
  type: "content";
  data: {
    title: string;
    items: {
      title: string;
      text: string;
    }[];
    image?: string;
  };
  offset?: number;
}

export interface DeckEnd {
  type: "end";
  data?: {
    image?: string;
  };
}

export type DeckSlide =
  | DeckCover
  | DeckContents
  | DeckTransition
  | DeckContent
  | DeckEnd;
