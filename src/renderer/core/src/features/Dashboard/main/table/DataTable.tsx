import React, { useState, useEffect, useMemo } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table'
import type { LogType } from 'daytalog'
import { LogSum } from './types'
import { useSelectedContext } from '../SelectedContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from '@components/ui/dropdown-menu'
import { Button } from '@components/ui/button'
import { Filter } from 'lucide-react'

interface DataTableProps {
  columns: ColumnDef<LogSum, unknown>[] // Columns array from @tanstack/react-table
  data: LogSum[] // Data array matching the structure passed to the table
}

const getInitialColumnVisibility = (columns: ColumnDef<LogSum, unknown>[]) => {
  const visibility: { [key: string]: boolean } = {}
  columns.forEach((col) => {
    // Use accessorKey or id as the key
    const key = (col as any).accessorKey || col.id
    if (key) {
      // If meta.defaultVisible is explicitly false, set to false, otherwise true
      visibility[key] = (col.meta as any)?.defaultVisible === false ? false : true
    }
  })
  return visibility
}

const DataTable = ({ columns, data }: DataTableProps): React.ReactElement => {
  const [lastSelectedRowIndex, setLastSelectedRowIndex] = useState<number | null>(null) // Track the last clicked row for Shift + Click functionality
  const [rowSelection, setRowSelection] = useState<{ [key: string]: boolean }>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<{ [key: string]: boolean }>(() =>
    getInitialColumnVisibility(columns)
  )

  const { setSelection } = useSelectedContext()

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      rowSelection,
      sorting,
      columnVisibility
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility
  })

  const selectedRows = useMemo(() => {
    return Object.keys(rowSelection)
      .filter((rowId) => rowSelection[rowId])
      .map((rowId) => table.getRowModel().rows.find((row) => row.id === rowId)?.original.raw)
      .filter((raw): raw is LogType => raw !== undefined)
  }, [rowSelection])

  useEffect(() => {
    setSelection(selectedRows)
  }, [selectedRows])

  const toggleRowSelection = (rowIndex: number, event: React.MouseEvent) => {
    event.preventDefault() // Prevent text selection when using Shift or Ctrl/Cmd clicks

    const rowId = table.getRowModel().rows[rowIndex].id
    let currentSelection = { ...rowSelection }

    if (event.shiftKey) {
      if (lastSelectedRowIndex !== null) {
        // Handle Shift + Click: select or deselect range of rows between last selected and clicked row
        const start = Math.min(lastSelectedRowIndex, rowIndex)
        const end = Math.max(lastSelectedRowIndex, rowIndex)

        // Determine whether to select or deselect based on the selection state of the clicked row
        const isRowSelected = !!rowSelection[rowId]

        for (let i = start; i <= end; i++) {
          const rowIdToToggle = table.getRowModel().rows[i].id
          if (isRowSelected) {
            // Deselect the range
            delete currentSelection[rowIdToToggle]
          } else {
            // Select the range
            currentSelection[rowIdToToggle] = true
          }
        }

        // Update lastSelectedRowIndex
        if (!isRowSelected) {
          setLastSelectedRowIndex(rowIndex)
        } else {
          // Check if any rows are still selected
          if (Object.keys(currentSelection).length === 0) {
            setLastSelectedRowIndex(null)
          }
        }
      } else {
        // No lastSelectedRowIndex, select the clicked row
        currentSelection[rowId] = true
        setLastSelectedRowIndex(rowIndex)
      }
    } else if (event.ctrlKey || event.metaKey) {
      // Handle Ctrl/Cmd + Click: toggle the individual row
      if (currentSelection[rowId]) {
        delete currentSelection[rowId] // Deselect the row

        // Reset lastSelectedRowIndex if no rows are selected
        if (Object.keys(currentSelection).length === 0) {
          setLastSelectedRowIndex(null)
        }
      } else {
        currentSelection[rowId] = true // Select the row
        setLastSelectedRowIndex(rowIndex)
      }
    } else {
      // Simple Click without modifiers - do nothing
      return
    }

    setRowSelection(currentSelection)
  }

  return (
    <Table>
      <TableHeader className="sticky z-20 top-26">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="hover:bg-transparent">
            {headerGroup.headers.map((header, i) => {
              const canSort = header.column.getCanSort()
              const sorted = header.column.getIsSorted()
              // If this is the last header cell, add the dropdown
              if (i === headerGroup.headers.length - 1) {
                return (
                  <TableHead
                    key={header.id}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    className={canSort ? 'cursor-pointer select-none' : ''}
                  >
                    {header.isPlaceholder ? null : (
                      <span className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span
                          style={{ display: 'inline-block', width: '1em', textAlign: 'center' }}
                        >
                          {sorted === 'asc' && <span>▲</span>}
                          {sorted === 'desc' && <span>▼</span>}
                          {sorted === false && <span style={{ visibility: 'hidden' }}>▲</span>}
                        </span>
                        {/* Dropdown for column visibility */}
                        <div className="relative inline-block text-left -ml-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <Filter className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {table
                                .getAllLeafColumns()
                                .filter((col) => typeof col.columnDef.header !== 'function')
                                .map((col) => (
                                  <DropdownMenuCheckboxItem
                                    key={col.id}
                                    className="capitalize"
                                    checked={col.getIsVisible()}
                                    onCheckedChange={() => col.toggleVisibility()}
                                  >
                                    {typeof col.columnDef.header === 'function'
                                      ? 'Column x'
                                      : String(col.columnDef.header)}
                                  </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {/*<div className="relative inline-block text-left -ml-16">
                          <button
                            className="px-2 py-1 rounded bg-zinc-800 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowDropdown((prev) => !prev)
                            }}
                          >
                            Columns
                          </button>
                          {showDropdown && (
                            <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-zinc-900 ring-1 ring-black ring-opacity-5">
                              {table.getAllLeafColumns().map((col) => (
                                <label
                                  key={col.id}
                                  className="flex items-center px-2 py-1 text-sm text-white"
                                >
                                  <input
                                    type="checkbox"
                                    checked={col.getIsVisible()}
                                    onChange={() => col.toggleVisibility()}
                                    className="mr-2"
                                  />
                                  {typeof col.columnDef.header === 'function'
                                    ? 'Column x'
                                    : String(col.columnDef.header)}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>*/}
                      </span>
                    )}
                  </TableHead>
                )
              }
              // Default header rendering for other columns
              return (
                <TableHead
                  key={header.id}
                  onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  className={canSort ? 'cursor-pointer select-none' : ''}
                >
                  {header.isPlaceholder ? null : (
                    <span className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span style={{ display: 'inline-block', width: '1em', textAlign: 'center' }}>
                        {sorted === 'asc' && <span>▲</span>}
                        {sorted === 'desc' && <span>▼</span>}
                        {sorted === false && <span style={{ visibility: 'hidden' }}>▲</span>}
                      </span>
                    </span>
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row, rowIndex) => {
            const isSelected = !!rowSelection[row.id]
            return (
              <TableRow
                key={row.id}
                data-state={isSelected && 'selected'}
                onClick={(event) => toggleRowSelection(rowIndex, event)}
                className="select-none whitespace-pre-line"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            )
          })
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export default DataTable
