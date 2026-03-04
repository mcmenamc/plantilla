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
import { type Invoice } from '../data/schema'
import { invoicesColumns as columns } from './invoices-columns'

type DataTableProps = {
    data: Invoice[]
    search: Record<string, unknown>
    navigate: NavigateFn
}

export function InvoicesTable({ data, search, navigate }: DataTableProps) {
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [sorting, setSorting] = useState<SortingState>([])

    const {
        columnFilters,
        onColumnFiltersChange,
        globalFilter,
        onGlobalFilterChange,
    } = useTableUrlState({
        search,
        navigate,
        globalFilter: { enabled: true, key: 'q' },
        columnFilters: [
            { columnId: 'status', searchKey: 'status', type: 'array' },
            { columnId: 'tipo_cfdi', searchKey: 'tipo', type: 'array' },
            { columnId: 'metodo_pago', searchKey: 'metodo', type: 'array' },
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
        enableRowSelection: false,
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
                searchPlaceholder='Buscar por nombre, RFC, UUID...'
                filters={[
                    {
                        columnId: 'status',
                        title: 'Estado',
                        options: [
                            { label: 'Válida', value: 'valid' },
                            { label: 'Borrador', value: 'draft' },
                            { label: 'Pendiente', value: 'pending' },
                            { label: 'Cancelada', value: 'cancelled' },
                        ],
                    },
                    {
                        columnId: 'tipo_cfdi',
                        title: 'Tipo',
                        options: [
                            { label: 'Ingreso', value: 'I' },
                            { label: 'Egreso', value: 'E' },
                            { label: 'Pago', value: 'P' },
                            { label: 'Nómina', value: 'N' },
                            { label: 'Traslado', value: 'T' },
                        ],
                    },
                    {
                        columnId: 'metodo_pago',
                        title: 'Método',
                        options: [
                            { label: 'PUE - Una exhibición', value: 'PUE' },
                            { label: 'PPD - Diferido', value: 'PPD' },
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
