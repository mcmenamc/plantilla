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
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { DataTableToolbar } from '@/components/data-table'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { MassiveDownload } from '../data/massive-download-api'
import { massiveDownloadColumns as columns } from './massive-download-columns'

interface MassiveDownloadTableViewProps {
    data: MassiveDownload[]
    search: Record<string, unknown>
    navigate: NavigateFn
    isLoading: boolean
}

export function MassiveDownloadTableView({ data, search, navigate, isLoading }: MassiveDownloadTableViewProps) {
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        serviceType: false,
        requestType: false,
    })
    const [sorting, setSorting] = useState<SortingState>([])

    const {
        columnFilters,
        onColumnFiltersChange,
        globalFilter,
        onGlobalFilterChange,
    } = useTableUrlState({
        search,
        navigate,
        globalFilter: { enabled: true },
        columnFilters: [
            { columnId: 'status', searchKey: 'status', type: 'array' },
            { columnId: 'tipo', searchKey: 'type', type: 'array' },
            { columnId: 'serviceType', searchKey: 'service', type: 'array' },
            { columnId: 'requestType', searchKey: 'request', type: 'array' },
        ],
    })

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            rowSelection,
            columnFilters,
            columnVisibility,
            globalFilter,
        },
        enableRowSelection: true,
        onColumnFiltersChange,
        onGlobalFilterChange,
        onRowSelectionChange: setRowSelection,
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
                searchPlaceholder='Buscar por RFC o ID...'
                filters={[
                    {
                        columnId: 'tipo',
                        title: 'Tipo',
                        options: [
                            { label: 'Emitidas', value: 'issued' },
                            { label: 'Recibidas', value: 'received' },
                        ],
                    },
                    {
                        columnId: 'status',
                        title: 'Estado',
                        options: [
                            { label: 'Completado', value: 'completed' },
                            { label: 'En proceso', value: 'pending' },
                            { label: 'Error', value: 'error' },
                        ],
                    },
                    {
                        columnId: 'serviceType',
                        title: 'Servicio',
                        options: [
                            { label: 'CFDI', value: 'cfdi' },
                            { label: 'Retenciones', value: 'retenciones' },
                        ],
                    },

                ]}
            />
            <div className='overflow-hidden rounded-md border text-xs sm:text-sm bg-background'>
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
                                                header.column.columnDef.meta?.className
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
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className='h-24 text-center'>
                                    Cargando descargas...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
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
                                                cell.column.columnDef.meta?.className
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
        </div>
    )
}
