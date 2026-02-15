import { useState } from 'react'
import {
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    type FilterFn,
} from '@tanstack/react-table'
import { cn, normalizeString } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { DataTableToolbar } from '@/components/data-table'
import { type WorkCenter } from '../data/schema'
import { workCentersColumns as columns } from './work-centers-columns'
import { WorkCentersActionDialog } from './work-centers-action-dialog'

type DataTableProps = {
    data: WorkCenter[]
    search: Record<string, unknown>
    navigate: NavigateFn
}

// custom filter function for accent-insensitive search
const globalFilterFn: FilterFn<WorkCenter> = (row, _columnId, value) => {
    const search = normalizeString(value)
    const name = normalizeString(row.original.workcenterName || '')
    const rfc = normalizeString(row.original.rfc || '')

    return name.includes(search) || rfc.includes(search)
}

export function WorkCentersTable({ data, search, navigate }: DataTableProps) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [sorting, setSorting] = useState<SortingState>([])

    const {
        globalFilter,
        onGlobalFilterChange,
        columnFilters,
        onColumnFiltersChange,
    } = useTableUrlState({
        search,
        navigate,
        globalFilter: { enabled: true, key: 'q' },
        columnFilters: [
            { columnId: 'estatus', searchKey: 'status', type: 'array' },
            { columnId: 'tipo_persona', searchKey: 'tipo', type: 'array' },
        ],
    })

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            globalFilter,
        },
        enableRowSelection: false,
        onColumnFiltersChange,
        onGlobalFilterChange,
        globalFilterFn,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    return (
        <div className='flex flex-1 flex-col gap-4'>
            <DataTableToolbar
                table={table}
                searchPlaceholder='Buscar por nombre o RFC...'
                filters={[
                    {
                        columnId: 'estatus',
                        title: 'Estado',
                        options: [
                            { label: 'Activo', value: 'Activo' },
                            { label: 'Inactivo', value: 'Inactivo' },
                        ],
                    },
                    {
                        columnId: 'tipo_persona',
                        title: 'Tipo Persona',
                        options: [
                            { label: 'Persona Física', value: 'Persona Física' },
                            { label: 'Persona Moral', value: 'Persona Moral' },
                        ],
                    },
                ]}
            />
            <div className='overflow-hidden rounded-md border'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className='group/row'>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className={cn(
                                                'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                                                header.column.columnDef.meta?.className as string
                                            )}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className='group/row'
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cn(
                                                'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                                                cell.column.columnDef.meta?.className as string
                                            )}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className='h-24 text-center'
                                >
                                    No hay resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <WorkCentersActionDialog />
        </div>
    )
}
