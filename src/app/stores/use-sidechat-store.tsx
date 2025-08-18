import { create } from "zustand";

interface SideChatState {
  isSideChatOpen: boolean;
  openSideChat: () => void;
  closeSideChat: () => void;
}

export const useSideChatStore = create<SideChatState>((set) => ({
  isSideChatOpen: true,
  openSideChat: () => set({ isSideChatOpen: true }),
  closeSideChat: () => set({ isSideChatOpen: false }),
}));
