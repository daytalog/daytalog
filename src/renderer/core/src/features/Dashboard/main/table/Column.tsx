import { ColumnDef } from '@tanstack/react-table'
import { LogSum } from './types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@components/ui/dropdown-menu'
import { Checkbox } from '@components/ui/checkbox'
import { MoreHorizontal, Trash2, Pencil } from 'lucide-react'
import { Button } from '@components/ui/button'
import type { LogType } from 'daytalog'
import { format } from 'daytalog'

export const Columns = (handlers: {
  handleDelete: (log: LogType) => void
  handleEdit: (id: string) => void
}): ColumnDef<LogSum>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'id',
    header: 'Index',
    enableSorting: true
  },
  {
    accessorKey: 'day',
    header: 'Day',
    enableSorting: true
  },
  {
    accessorKey: 'date',
    header: 'Date',
    enableSorting: true
  },
  {
    accessorKey: 'unit',
    header: 'Unit',
    enableSorting: true,
    meta: { defaultVisible: false }
  },
  {
    accessorKey: 'ocfClips',
    header: 'OCF Clips',
    enableSorting: true,
    meta: { defaultVisible: false }
  },
  {
    accessorKey: 'ocfSize',
    header: 'OCF Size',
    enableSorting: true,
    cell: ({ getValue }) => format.formatBytes(getValue() as number, { output: 'string' })
  },
  {
    accessorKey: 'ocfDuration',
    header: 'OCF Duration',
    enableSorting: true,
    cell: ({ getValue }) => format.formatDuration(getValue() as string, { asString: true })
  },
  {
    accessorKey: 'ocfCopies',
    header: 'OCF Copies',
    enableSorting: false
  },
  {
    accessorKey: 'proxyClips',
    header: 'Proxy Clips',
    enableSorting: true,
    meta: { defaultVisible: false }
  },
  {
    accessorKey: 'proxySize',
    header: 'Proxy Size',
    enableSorting: true,
    meta: { defaultVisible: false },
    cell: ({ getValue }) => format.formatBytes(getValue() as number, { output: 'string' })
  },
  {
    accessorKey: 'soundClips',
    header: 'Sound Clips',
    enableSorting: true,
    meta: { defaultVisible: false }
  },
  {
    accessorKey: 'soundSize',
    header: 'Sound Size',
    enableSorting: true,
    meta: { defaultVisible: false },
    cell: ({ getValue }) => format.formatBytes(getValue() as number, { output: 'string' })
  },
  {
    accessorKey: 'soundCopies',
    header: 'Sound Copies',
    enableSorting: false,
    meta: { defaultVisible: false }
  },

  {
    accessorKey: 'reels',
    header: 'Reels',
    enableSorting: false
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const log = row.original.raw
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handlers.handleEdit(log.id)}>
              <Pencil />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => handlers.handleDelete(log)}>
              <Trash2 />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
