/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx";
import type {
  Sheet,
  Cell,
  CellWithRowAndCol,
  SheetConfig,
} from "@fortune-sheet/core";
import { saveAs } from "file-saver";

function detectCellType(value: any): string {
  if (typeof value === "number") return "n";
  if (typeof value === "boolean") return "b";
  if (value instanceof Date) return "d";
  if (typeof value === "string" && !isNaN(Date.parse(value))) return "d";
  return "s";
}

function extractStyleFromCell(xlsxCell: any, workbook: any): Partial<Cell> {
  const result: Partial<Cell> = {};

  if (!xlsxCell) return result;

  // Log what we have
  // console.log("Cell analysis:", {
  //   hasS: !!xlsxCell.s,
  //   sValue: xlsxCell.s,
  //   hasZ: !!xlsxCell.z,
  //   zValue: xlsxCell.z,
  //   cellType: xlsxCell.t,
  //   cellValue: xlsxCell.v,
  //   workbookHasStyles: !!(workbook.Styles)
  // });

  // Check if workbook has styles information
  if (workbook.Styles) {
    // console.log("Workbook styles structure:", {
    //   CellXf: workbook.Styles.CellXf ? workbook.Styles.CellXf.length : 0,
    //   Fonts: workbook.Styles.Fonts ? workbook.Styles.Fonts.length : 0,
    //   Fills: workbook.Styles.Fills ? workbook.Styles.Fills.length : 0,
    //   Borders: workbook.Styles.Borders ? workbook.Styles.Borders.length : 0,
    //   NumFmts: workbook.Styles.NumFmts ? workbook.Styles.NumFmts.length : 0,
    //   fillsStyles: workbook.Styles.Fills ? workbook.Styles.Fills : {},
    //   FontsStyles: workbook.Styles.Fonts ? workbook.Styles.Fills : {},
    //   type: xlsxCell.s
    // });

    // Try to get style by index
    if (typeof xlsxCell.s === "number" && workbook.Styles.CellXf) {
      const styleObj = workbook.Styles.CellXf[xlsxCell.s];
      //console.log("Style object from index:", styleObj);

      if (styleObj) {
        // Extract font information
        if (styleObj.fontId !== undefined && workbook.Styles.Fonts) {
          const font = workbook.Styles.Fonts[styleObj.fontId];
          //console.log("Font object:", font);

          if (font) {
            if (font.bold) result.bl = 1;
            if (font.italic) result.it = 1;
            if (font.underline) result.un = 1;
            if (font.strike) result.cl = 1;
            if (font.name) result.ff = font.name;
            if (font.sz) result.fs = font.sz;
            if (font.color?.rgb) result.fc = `#${font.color.rgb}`;
          }
        }

        // Extract fill information
        if (styleObj.fillId !== undefined && workbook.Styles.Fills) {
          const fill = workbook.Styles.Fills[styleObj.fillId];
          //console.log("Fill object:", fill);

          if (fill && fill.fgColor?.rgb) {
            result.bg = `#${fill.fgColor.rgb}`;
          }
        }

        // Extract border information
        if (styleObj.borderId !== undefined && workbook.Styles.Borders) {
          const border = workbook.Styles.Borders[styleObj.borderId];
          //console.log("Border object:", border);

          if (border) {
            const borderStyle: any = {};

            const processBorder = (borderSide: any, key: string) => {
              if (
                borderSide &&
                borderSide.style &&
                borderSide.style !== "none"
              ) {
                const styleMap: Record<string, number> = {
                  thin: 1,
                  medium: 2,
                  thick: 3,
                  double: 4,
                  dotted: 5,
                  dashed: 6,
                  hair: 1,
                };

                borderStyle[key] = {
                  style: styleMap[borderSide.style] || 1,
                  color: borderSide.color?.rgb
                    ? `#${borderSide.color.rgb}`
                    : "#000000",
                };
              }
            };

            processBorder(border.top, "t");
            processBorder(border.bottom, "b");
            processBorder(border.left, "l");
            processBorder(border.right, "r");

            if (Object.keys(borderStyle).length > 0) {
              //result.bd = borderStyle;
            }
          }
        }

        // Extract alignment
        if (styleObj.alignment) {
          //console.log("Alignment object:", styleObj.alignment);

          const alignMap: Record<string, number> = {
            left: 1,
            center: 2,
            right: 3,
            top: 1,
            middle: 2,
            bottom: 3,
          };

          if (styleObj.alignment.horizontal) {
            result.ht = alignMap[styleObj.alignment.horizontal] || 2;
          }
          if (styleObj.alignment.vertical) {
            result.vt = alignMap[styleObj.alignment.vertical] || 2;
          }
          if (styleObj.alignment.wrapText) {
            //result.tb = 2;
          }
        }

        // Extract number format
        if (styleObj.numFmtId !== undefined) {
          let numFmt = styleObj.numFmtId;

          // Check custom number formats
          if (workbook.Styles.NumFmts) {
            const customFmt = workbook.Styles.NumFmts.find(
              (fmt: any) => fmt.numFmtId === styleObj.numFmtId,
            );
            if (customFmt) {
              numFmt = customFmt.formatCode;
            }
          }

          //console.log("Number format:", numFmt);
          result.ct = { fa: String(numFmt), t: detectCellType(xlsxCell.v) };
        }
      }
    }
  }

  // Fallback: try to extract from cell.s if it's an object
  if (typeof xlsxCell.s === "object" && xlsxCell.s !== null) {
    const style = xlsxCell.s;

    // Direct style properties (less common but possible)
    if (style.font) {
      if (style.font.bold) result.bl = 1;
      if (style.font.italic) result.it = 1;
      if (style.font.underline) result.un = 1;
      if (style.font.name) result.ff = style.font.name;
      if (style.font.sz) result.fs = style.font.sz;
      if (style.font.color?.rgb) result.fc = `#${style.font.color.rgb}`;
    }

    if (style.fill?.fgColor?.rgb) {
      result.bg = `#${style.fill.fgColor.rgb}`;
    }

    if (style.alignment) {
      const alignMap: Record<string, number> = {
        left: 1,
        center: 2,
        right: 3,
        top: 1,
        middle: 2,
        bottom: 3,
      };

      if (style.alignment.horizontal) {
        result.ht = alignMap[style.alignment.horizontal] || 2;
      }
      if (style.alignment.vertical) {
        result.vt = alignMap[style.alignment.vertical] || 2;
      }
    }
  }

  // Handle number format from cell.z
  if (xlsxCell.z && !result.ct) {
    result.ct = { fa: xlsxCell.z, t: detectCellType(xlsxCell.v) };
  }

  return result;
}

export function parseExcelToFortuneSheet(buffer: ArrayBuffer): Sheet[] {
  // Read with all possible options for style extraction
  const wb = XLSX.read(buffer, {
    type: "array",
    cellStyles: true,
    cellNF: true,
    cellDates: true,
    sheetStubs: true,
    bookVBA: false,
    cellFormula: true,
    cellText: false,
    dense: false,
    WTF: false, // Set to true for debugging if needed
  });

  // Debug: Log workbook structure
  //   console.log("=== WORKBOOK DEBUG INFO ===");
  //   console.log("SheetNames:", wb.SheetNames);
  //   console.log("Has Workbook.Styles:", !!(wb as any).Styles);
  //   console.log("SSF:", Object.keys(wb.SSF || {}).length);

  if ((wb as any).Styles) {
    //const styles = (wb as any).Styles;
    // console.log("Styles structure:", {
    //   CellXf: styles.CellXf?.length || 0,
    //   Fonts: styles.Fonts?.length || 0,
    //   Fills: styles.Fills?.length || 0,
    //   Borders: styles.Borders?.length || 0,
    //   NumFmts: styles.NumFmts?.length || 0
    // });
  }
  //console.log("=== END WORKBOOK DEBUG ===");

  return wb.SheetNames.map((sheetName, idx) => {
    const ws = wb.Sheets[sheetName];

    // Get the range of the worksheet
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
    const maxRow = range.e.r + 1;
    const maxCol = range.e.c + 1;

    //console.log(`Sheet ${sheetName} range:`, ws['!ref'], `Rows: ${maxRow}, Cols: ${maxCol}`);

    // Build merge info
    const mergeMap: Record<
      string,
      { r: number; c: number; rs: number; cs: number }
    > = {};
    const mergedCells = new Set<string>();

    if (ws["!merges"]) {
      ws["!merges"].forEach((merge: any) => {
        const sr = merge.s.r,
          sc = merge.s.c,
          er = merge.e.r,
          ec = merge.e.c;
        const key = `${sr}_${sc}`;
        mergeMap[key] = { r: sr, c: sc, rs: er - sr + 1, cs: ec - sc + 1 };
        for (let r = sr; r <= er; r++) {
          for (let c = sc; c <= ec; c++) {
            if (!(r === sr && c === sc)) mergedCells.add(`${r}_${c}`);
          }
        }
      });
    }

    // Compose celldata
    const celldata: CellWithRowAndCol[] = [];

    for (let r = 0; r <= maxRow; r++) {
      for (let c = 0; c <= maxCol; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        const xlsxCell = ws[cellAddress];
        const key = `${r}_${c}`;

        // Skip merged cells (except the main cell)
        if (mergedCells.has(key)) continue;

        // Debug: Log cell info for a few cells
        if ((r < 3 && c < 3) || xlsxCell) {
          // console.log(`Cell ${cellAddress}:`, {
          //   exists: !!xlsxCell,
          //   value: xlsxCell?.v,
          //   type: xlsxCell?.t,
          //   hasStyle: xlsxCell?.s !== undefined,
          //   styleValue: xlsxCell?.s,
          //   hasFormat: !!xlsxCell?.z,
          //   format: xlsxCell?.z
          // });
        }

        // Get cell value
        const value = xlsxCell?.v;
        const displayValue =
          xlsxCell?.w || (value !== undefined ? String(value) : "");

        // Create cell object
        const cell: Cell = {
          v: value !== undefined && value !== null ? value : "",
          m: displayValue,
          ct: {
            fa: xlsxCell?.z || "General",
            t: xlsxCell?.t || detectCellType(value),
          },
          // Apply styles using the enhanced extraction
          ...extractStyleFromCell(xlsxCell, wb),
        };

        // Add merge info if this is a merged cell's main cell
        if (mergeMap[key]) {
          cell.mc = mergeMap[key];
        }

        // Add cells that have content, styling, or are merged
        if (
          (value !== undefined && value !== null && value !== "") ||
          xlsxCell?.s !== undefined ||
          mergeMap[key]
        ) {
          celldata.push({ r, c, v: cell });
        }
      }
    }

    // Build config
    const config: SheetConfig = {};

    if (Object.keys(mergeMap).length) {
      config.merge = mergeMap;
    }

    if (ws["!cols"]) {
      config.columnlen = {};
      ws["!cols"].forEach((col: any, i: number) => {
        if (col?.wpx) {
          config.columnlen![i] = col.wpx;
        } else if (col?.width) {
          config.columnlen![i] = col.width * 7;
        }
      });
    }

    if (ws["!rows"]) {
      config.rowlen = {};
      ws["!rows"].forEach((row: any, i: number) => {
        if (row?.hpx) {
          config.rowlen![i] = row.hpx;
        } else if (row?.hpt) {
          config.rowlen![i] = row.hpt * 1.33;
        }
      });
    }

    return {
      id: String(idx),
      name: sheetName,
      celldata,
      config,
      row: Math.max(maxRow + 10, 50),
      column: Math.max(maxCol + 5, 20),
      order: idx,
      status: idx === 0 ? 1 : 0,
      hide: 0,
      zoomRatio: 1,
      defaultRowHeight: 19,
      defaultColWidth: 73,
      showGridLines: 1,
    };
  });
}

export function exportToExcel(allSheets: Sheet[], filename: string) {
  const wb = XLSX.utils.book_new();

  allSheets.forEach((sh) => {
    // 1) start with an empty, sparse worksheet
    const ws: XLSX.WorkSheet = {};

    // 2) write every non-null entry from sh.data
    sh?.data?.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell == null) return; // skip blank cells
        const raw = cell.v != null ? cell.v : cell.m != null ? cell.m : "";
        const addr = XLSX.utils.encode_cell({ r, c });
        ws[addr] = {
          v: raw,
          t: typeof raw === "number" ? "n" : "s",
          // if you want to preserve styling you can add
          // an `.s` object here, but that requires xlsx-js-style
        };
      });
    });

    // 3) inject merges from FortuneSheet’s config.merge
    if (sh.config?.merge) {
      const merges: XLSX.Range[] = [];
      for (const { r, c, rs, cs } of Object.values(sh.config.merge)) {
        merges.push({
          s: { r, c },
          e: { r: r + rs - 1, c: c + cs - 1 },
        });
      }
      if (merges.length) ws["!merges"] = merges;
    }

    // 4) compute the sheet’s used range
    const cells = Object.keys(ws).filter((k) => k[0] !== "!");
    ws["!ref"] = cells.length
      ? XLSX.utils.encode_range({
          s: XLSX.utils.decode_cell(cells[0]),
          e: XLSX.utils.decode_cell(cells[cells.length - 1]),
        })
      : "A1";

    // 5) append
    XLSX.utils.book_append_sheet(wb, ws, sh.name);
  });

  // 4) Serialize & trigger download
  // 6) Write with compression (and styles, if you used them)
  const wbout = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
    compression: true, // 🔥 turn on ZIP compression
    //cellStyles: true, // if you added any ws[cell].s style objects
  });
  saveAs(
    new Blob([wbout], { type: "application/octet-stream" }),
    `${filename}.xlsx`,
  );
}
