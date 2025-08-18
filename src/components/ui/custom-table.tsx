"use client"

import React, { useState } from "react"
import { Table, Pagination, Stack, ButtonGroup, IconButton } from "@chakra-ui/react"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"

export type Column<T> = {
  header: string
  key: keyof T
  isNumeric?: boolean
  render?: (row: T) => React.ReactNode
}

export interface CustomTableProps<T extends { id: string | number }> {
  /** Data rows */
  data: T[]
  /** Column definitions */
  columns: Column<T>[]
  /** Rows per page (default 10) */
  pageSize?: number
  /** Hide built-in pagination (useful when using server-side cursor pagination) */
  hidePagination?: boolean
}

/**
 * A fully‐generic, Chakra UI v3.22.0 table with rounded outline, striped rows, and pagination.
 */
export function CustomTable<T extends { id: string | number }>({
  data,
  columns,
  pageSize = 10,
  hidePagination = false,
}: CustomTableProps<T>) {
  const [page, setPage] = useState(1)
  const startIdx = (page - 1) * pageSize
  const pageData = data.slice(startIdx, startIdx + pageSize)

  return (
    <Stack width="full" gap="5">
      <Table.ScrollArea borderWidth="1px" borderColor="gray.200" rounded="lg">
        <Table.Root size="md" variant="outline">
          <Table.Header>
            <Table.Row>
              {columns.map((col) => (
                <Table.ColumnHeader key={String(col.key)} paddingX={4} paddingY={3}>
                  {col.header}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {pageData.map((row) => (
              <Table.Row key={row.id}>
                {columns.map((col) => (
                  <Table.Cell key={String(col.key)} paddingX={4} paddingY={3}>
                    {col.render ? col.render(row) : String(row[col.key])}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      {!hidePagination && (
        <Pagination.Root
          count={data.length}
          pageSize={pageSize}
          page={page}
          onPageChange={(details) => setPage(details.page)}
        >
          <ButtonGroup variant="ghost" size="sm" wrap="wrap">
            <Pagination.PrevTrigger asChild>
              <IconButton aria-label="Previous"><LuChevronLeft /></IconButton>
            </Pagination.PrevTrigger>

            <Pagination.Items
              render={(p) => (
                <IconButton
                  key={p.value}
                  variant={{ base: "ghost", _selected: "outline" }}
                  aria-current={p.value === page ? "page" : undefined}
                  onClick={() => setPage(p.value)}
                >
                  {p.value}
                </IconButton>
              )}
            />

            <Pagination.NextTrigger asChild>
              <IconButton aria-label="Next"><LuChevronRight /></IconButton>
            </Pagination.NextTrigger>
          </ButtonGroup>
        </Pagination.Root>
      )}
    </Stack>
  )
}
