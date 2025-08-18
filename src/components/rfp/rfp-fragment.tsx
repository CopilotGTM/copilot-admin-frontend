"use client";
import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { Workbook, WorkbookInstance } from "@fortune-sheet/react";
import type { CellWithRowAndCol, Sheet } from "@fortune-sheet/core";
import "@fortune-sheet/react/dist/index.css";
import "../../../styles/custom-fortunesheet.css"; // adjust the path if needed
import { exportToExcel, parseExcelToFortuneSheet } from "./utils";
import Navbar from "./navbar";
import { MessageChunk, RFPAnswerContent } from "../../app/types/chat";
import { useSocketRFP } from "../../app/hooks/socket/use-socket-rfp";
import { useRFTSheetDialogStore } from "../../app/stores/use-rft-sheet-dialog-store";

interface RFPFragmentProps {
  sessionId: string;
  messageId: string;
}

export default function RFPFragment({
  sessionId,
  messageId,
}: RFPFragmentProps) {
  console.log("@@@@@@props", sessionId, messageId);
  const workbookRef = useRef<WorkbookInstance>(null);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const { socket } = useSocketRFP();

  const { selections } = useRFTSheetDialogStore();

  console.log("@@@@@@sheets", selections);

  // const [clickInfo, setClickInfo] = useState<{
  //   sheetIndex: number;
  //   row: number;
  //   col: number;
  // } | null>(null);

  // 1) On load: parse & post-process to inject “Generating…” + “Get AI” button
  useEffect(() => {
    (async () => {
      const res = await fetch("/my-spreadsheet-2.xlsx");
      const buffer = await res.arrayBuffer();
      const parsed = parseExcelToFortuneSheet(buffer);

      const processed = parsed.map((sheet) => {
        const sel = selections.find((s) => {
          const result = s.sheet_name === sheet.name;
          //console.log("@@@@@@sel", s.sheet_name, sheet.name, result);
          return result;
        });
        if (!sel) return sheet;

        //console.log("@@@@@@sel", sel);

        // find header row & the question/answer cols
        const headerRow = 0;
        const headers = sheet?.celldata?.filter((c) => c.r === headerRow);
        console.log("@@@@@@headers", sheet, headers);
        const qCol = headers?.find(
          (c) =>
            c.v?.m === sel.question_column || c.v?.v === sel.question_column,
        )?.c;
        const aCol = headers?.find(
          (c) => c.v?.m === sel.answer_column || c.v?.v === sel.answer_column,
        )?.c;
        if (qCol == null || aCol == null) return sheet;

        // map existing cells for easy updates
        const byPos = new Map<string, CellWithRowAndCol>();
        sheet?.celldata?.forEach((c) => byPos.set(`${c.r}_${c.c}`, c));

        // collect all data rows (that have a question cell)
        const dataRows = Array.from(
          new Set(
            sheet?.celldata
              ?.filter((c) => c.c === qCol && c.r !== headerRow)
              .map((c) => c.r),
          ),
        );

        // inject “Generating…” into the answer column
        dataRows.forEach((r) => {
          byPos.set(`${r}_${aCol}`, {
            r,
            c: aCol,
            v: {
              v: "",
              m: "Generating…",
              ct: { fa: "General", t: "s" },
            },
          });
        });

        // inject a “Get AI” button in the next free column
        const actionCol = sheet.column;
        dataRows.forEach((r) => {
          byPos.set(`${r}_${actionCol}`, {
            r,
            c: actionCol!,
            v: {
              v: "",
              m: "Get AI",
              ct: { fa: "General", t: "s" },
            },
          });
        });

        return {
          ...sheet,
          celldata: Array.from(byPos.values()),
          column: (sheet?.column ?? 0) + 1,
        };
      });

      setSheets(processed);
    })();
  }, []);

  // 2) Wire FortuneSheet change (we won’t actually edit in-grid here)
  // const handleChange = (data: Sheet[]) => {
  //   setSheets(data);
  // };

  // 3) Capture cell clicks
  // const handleCellClick = ({
  //   sheetIndex,
  //   row,
  //   col,
  // }: {
  //   sheetIndex: number;
  //   row: number;
  //   col: number;
  // }) => {
  //   setClickInfo({ sheetIndex, row, col });
  // };

  // 4) When “Get AI” is clicked: stamp “Generating…”, call AI, then patch in real answer
  // useEffect(() => {
  //   if (!clickInfo) return;
  //   const { sheetIndex, row, col } = clickInfo;
  //   const sheet = sheets[sheetIndex];
  //   const sel = selections.find((s) => s.sheet_name === sheet.name);
  //   if (!sel) {
  //     setClickInfo(null);
  //     return;
  //   }

  //   // find header & column indices again
  //   const headerRow = 0;
  //   const headers = sheet?.celldata?.filter((c) => c.r === headerRow);
  //   const qCol = headers?.find(
  //     (c) => c.v?.m === sel.question_column || c.v?.v === sel.question_column
  //   )?.c;
  //   const aCol = headers?.find(
  //     (c) => c.v?.m === sel.answer_column || c.v?.v === sel.answer_column
  //   )?.c;
  //   const actionCol = (sheet?.column ?? 0) - 1;

  //   // only proceed if they clicked the “Get AI” button
  //   if (row > headerRow && qCol != null && aCol != null && col === actionCol) {
  //     // (a) immediately reset clickInfo so we don’t loop
  //     setClickInfo(null);

  //     // (b) stamp “Generating…”
  //     setSheets((prev) =>
  //       prev.map((sh, idx) => {
  //         if (idx !== sheetIndex) return sh;
  //         const byKey = new Map(
  //           sh?.celldata?.map((c) => [`${c.r}_${c.c}`, c] as const)
  //         );
  //         byKey.set(`${row}_${aCol}`, {
  //           r: row,
  //           c: aCol,
  //           v: {
  //             v: "",
  //             m: "Generating…",
  //             ct: { fa: "General", t: "s" },
  //           },
  //         });
  //         return { ...sh, celldata: Array.from(byKey.values()) };
  //       })
  //     );

  //     // (c) pull the question text
  //     const questionCell = sheet?.celldata?.find(
  //       (c) => c.r === row && c.c === qCol
  //     );
  //     const question =
  //       questionCell?.v?.v?.toString() ?? questionCell?.v?.m?.toString() ?? "";

  //     // (d) call your AI endpoint
  //     fetch("/api/ai", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ question }),
  //     })
  //       .then((r) => r.json())
  //       .then(({ answer }) => {
  //         // (e) patch in the real answer
  //         setSheets((prev) =>
  //           prev.map((sh, idx) => {
  //             if (idx !== sheetIndex) return sh;
  //             const byKey = new Map(
  //               sh?.celldata?.map((c) => [`${c.r}_${c.c}`, c] as const)
  //             );
  //             byKey.set(`${row}_${aCol}`, {
  //               r: row,
  //               c: aCol,
  //               v: {
  //                 v: answer,
  //                 m: answer,
  //                 ct: { fa: "General", t: "s" },
  //               },
  //             });
  //             return { ...sh, celldata: Array.from(byKey.values()) };
  //           })
  //         );
  //       })
  //       .catch((err) => {
  //         console.error("AI fetch error:", err);
  //       });
  //   } else {
  //     // not our button
  //     setClickInfo(null);
  //   }
  // }, [clickInfo, sheets]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveAnswers = async (chunk: MessageChunk) => {
      if (chunk.chat_id !== sessionId) return;
      if (chunk.message_id !== messageId) return;

      // if (chunk.isComplete) {
      //   setIsLoading(false);
      // }

      // Update outline if the chunk contains outline data
      // Append new OutlineContent to outlineData
      if (
        chunk.response &&
        typeof chunk.response === "object" &&
        "sheetname" in chunk.response
      ) {
        const answer = chunk.response as RFPAnswerContent;
        const idx = sheets.findIndex((sh) => sh.name === answer.sheetname);
        if (idx === -1) return;

        // Find the answer column for the sheet
        const targetSel = selections.find(
          (s) => s.sheet_name === answer.sheetname,
        );
        if (!targetSel) {
          console.error("Selection not found for sheet:", answer.sheetname);
          return;
        }

        const targetSheet = sheets[idx];
        const headerRow = 0;
        const headers = targetSheet?.celldata?.filter((c) => c.r === headerRow);

        const aCol = headers?.find(
          (c) =>
            c.v?.m === targetSel.answer_column ||
            c.v?.v === targetSel.answer_column,
        )?.c;

        if (aCol == null) {
          console.error(
            "Answer column not found for sheet:",
            answer.sheetname,
            targetSel.answer_column,
            targetSheet,
            headers,
          );
          return;
        }

        // find the answer column index (aCol) just like you do today…
        // assume you’ve computed `aCol` already

        // const op = {
        //   op: "updateCell",
        //   sheetIndex: idx,
        //   row: answer.row_number,
        //   column: aCol,
        //   value: {
        //     v: answer.answer,
        //     m: answer.answer,
        //     ct: { fa: "General", t: "s" },
        //   },
        // } as const;

        //workbookRef.current?.applyOp([op]);

        workbookRef.current?.setCellValue(
          /* row */ answer.row_number,
          /* col */ aCol,
          /* value */ answer.answer,
          /* options */ { index: idx },
        );

        // console.log("@@@@@@sheets_check", {
        //   sheets: sheets,
        //   sheets_length: sheets?.length,
        //   answer_sheet_name: answerContent.sheetname,
        // });

        // /// do here
        // // Find the sheet index by matching sheet_name
        // const targetSheetIndex = sheets.findIndex((sh) => {
        //   console.log("@@@@@@sheet_compare", {
        //     sheet_name: sh.name,
        //     answer_sheet_name: answerContent.sheetname,
        //     comparison_result: sh.name === answerContent.sheetname,
        //   });
        //   return sh.name === answerContent.sheetname;
        // });
        // if (targetSheetIndex === -1) {
        //   console.log(
        //     "Sheet not found:",
        //     targetSheetIndex,
        //     answerContent.sheetname
        //   );
        //   return;
        // }

        // // Find the answer column for the sheet
        // const targetSel = selections.find(
        //   (s) => s.sheet_name === answerContent.sheetname
        // );
        // if (!targetSel) {
        //   console.error(
        //     "Selection not found for sheet:",
        //     answerContent.sheetname
        //   );
        //   return;
        // }

        // const targetSheet = sheets[targetSheetIndex];
        // const headerRow = 0;
        // const headers = targetSheet?.celldata?.filter((c) => c.r === headerRow);

        // const aCol = headers?.find(
        //   (c) =>
        //     c.v?.m === targetSel.answer_column ||
        //     c.v?.v === targetSel.answer_column
        // )?.c;

        // if (aCol == null) {
        //   console.error(
        //     "Answer column not found for sheet:",
        //     answerContent.sheetname, targetSel.answer_column, targetSheet, headers
        //   );
        //   return;
        // }

        // // Patch the answer into the sheet
        // setSheets((prev) =>
        //   prev.map((sh, idx) => {
        //     if (idx !== targetSheetIndex) return sh;
        //     const byKey = new Map(
        //       sh?.celldata?.map((c) => [`${c.r}_${c.c}`, c] as const)
        //     );
        //     byKey.set(`${answerContent.row_number}_${aCol}`, {
        //       r: answerContent.row_number,
        //       c: aCol,
        //       v: {
        //         v: answerContent.answer,
        //         m: answerContent.answer,
        //         ct: { fa: "General", t: "s" },
        //       },
        //     });
        //     console.log(
        //     "Answer column not found for sheet:",
        //     answerContent.sheetname, targetSel.answer_column, aCol
        //   );
        //     return { ...sh, celldata: Array.from(byKey.values()) };
        //   })
        // );
      }
    };

    socket.on("recieve_sheet_answers", handleReceiveAnswers);

    return () => {
      socket.off("recieve_sheet_answers", handleReceiveAnswers);
    };
  }, [socket, sessionId, messageId, sheets, selections]);

  return (
    <Box w="full" h="full" overflow="hidden">
      {/* Navbar */}
      <Navbar
        exportToExcel={() => {
          exportToExcel(workbookRef?.current?.getAllSheets() || [], "ggg");
        }}
      />

      <Flex
        w={"full"}
        h={`calc(100% - 55px)`}
        //mt={"55px"}
        flexDirection={"row"}
        position={"relative"}
        overflow={"hidden"}
      >
        <Box w={"full"} h={"full"} overflow={"hidden"}>
          {sheets.length === 0 ? (
            <p>Loading spreadsheet…</p>
          ) : (
            <Box w={"full"} h={"full"} overflow={"auto"}>
              <Workbook
                ref={workbookRef}
                data={sheets}
                //onChange={handleChange}
                showFormulaBar={false}
                defaultRowHeight={250}
                allowEdit={true}
                lang={"en"}
                //onCellClick={handleCellClick}
                // rowHeaderWidth={50}
                // columnHeaderHeight={30}
                config={{}}
              />
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
