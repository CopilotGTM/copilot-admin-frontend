import { create } from "zustand";

// Define possible panel types
type PanelType = "Deck" | "RFP";

// Define the generic state interface
interface PanelState<T extends PanelType> {
  isPanelOpen: boolean;
  entityId: string | null;
  panelType: T | null;
  openedBy: "Auto" | "Click";
  openPanel: (
    entityId: string,
    panelType: T,
    openedBy?: "Auto" | "Click",
  ) => void;
  closePanel: () => void;
}

// Create the generic store
export const usePanelStore = create<PanelState<PanelType>>((set) => ({
  isPanelOpen: false,
  entityId: null,
  panelType: null,
  openedBy: "Auto",
  openPanel: (
    entityId: string,
    panelType: PanelType,
    openedBy: "Auto" | "Click" = "Auto",
  ) => set({ isPanelOpen: true, entityId, panelType, openedBy }),
  closePanel: () =>
    set({
      isPanelOpen: false,
      entityId: null,
      panelType: null,
      openedBy: "Auto",
    }),
}));
