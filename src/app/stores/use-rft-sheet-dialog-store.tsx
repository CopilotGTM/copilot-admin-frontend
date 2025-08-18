import { create } from "zustand";
import { RFPSheetResponse } from "../types/rfp";

type selectionsType = {
  sheet_name: string;
  question_column: string;
  answer_column: string;
};

interface RFTSheetState {
  response?: RFPSheetResponse;
  isOpen: boolean;
  /** Fetch sheets (if needed) and open */
  open: (data: RFPSheetResponse) => void;
  /** Close dialog */
  close: (selections?: selectionsType[]) => void;

  //Additionals: Need to remove
  selections: selectionsType[];
}

export const useRFTSheetDialogStore = create<RFTSheetState>((set) => ({
  response: undefined,
  isOpen: false,
  selections: [],

  open: async (data: RFPSheetResponse) => {
    set({ isOpen: true, response: data });
  },

  close: (selections?: selectionsType[]) => {
    set({ selections: selections || [], isOpen: false, response: undefined });
  },
}));
