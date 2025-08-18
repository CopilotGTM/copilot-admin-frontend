export interface Column {
  name: string;
  is_question_column?: boolean;
  is_answer_column?: boolean;
}

export interface SheetDetail {
  sheet_name: string;
  is_sheet_selected: boolean;
  columns: Column[];
  column_row_number: number;
}

export interface RFPSheetResponse {
  status: "SUCCESS" | "ERROR"; // Adjust based on possible status values
  data: {
    sheets_details: SheetDetail[];
    message_id: string;
  };
  message: string;
}
