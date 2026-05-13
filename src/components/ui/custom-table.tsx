"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type Column<T> = {
  header: string;
  key: keyof T;
  isNumeric?: boolean;
  render?: (row: T) => React.ReactNode;
};

export interface CustomTableProps<T extends { id: string | number }> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  hidePagination?: boolean;
  onRowClick?: (row: T) => void;
  selectedRowId?: string | number;
}

export function CustomTable<T extends { id: string | number }>({
  data,
  columns,
  pageSize = 10,
  hidePagination = false,
  onRowClick,
  selectedRowId,
}: CustomTableProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageData = useMemo(() => {
    if (hidePagination) return data;
    const startIdx = (currentPage - 1) * pageSize;
    return data.slice(startIdx, startIdx + pageSize);
  }, [currentPage, data, hidePagination, pageSize]);

  const goToPage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="overflow-hidden rounded-lg border border-border bg-surface-primary shadow-xs">
        <Table>
          <TableHeader className="bg-surface-secondary/70">
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={cn("h-11 px-4 text-xs font-semibold uppercase text-fg-muted", col.isNumeric && "text-right")}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((row) => {
              const isSelected = selectedRowId !== undefined && row.id === selectedRowId;
              return (
                <TableRow
                  key={row.id}
                  data-state={isSelected ? "selected" : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                >
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className={cn("h-12 px-4", col.isNumeric && "text-right tabular-nums")}>
                      {col.render ? col.render(row) : String(row[col.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {!hidePagination ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-fg-secondary">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft data-icon="inline-start" />
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}