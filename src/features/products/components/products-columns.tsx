import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { LongText } from '@/components/long-text'
import { Product } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const productsColumns: ColumnDef<Product>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
                className='translate-y-[2px]'
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label='Select row'
                className='translate-y-[2px]'
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'description',
        header: 'Descripción',
        cell: ({ row }) => <LongText className='max-w-36'>{row.getValue('description')}</LongText>,
        meta: {
            className: 'w-36',
        },
    },
    {
        accessorKey: 'product_key',
        header: 'Clave SAT',
        cell: ({ row }) => <div className='w-fit text-nowrap'>{row.getValue('product_key')}</div>,
    },
    {
        accessorKey: 'price',
        header: 'Precio',
        cell: ({ row }) => {
            const price = parseFloat(row.getValue('price'))
            const formatted = new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN',
            }).format(price)
            return <div className='font-medium'>{formatted}</div>
        },
    },
    {
        accessorKey: 'unit_name',
        header: 'Unidad',
        cell: ({ row }) => <div className='w-fit text-nowrap'>{row.getValue('unit_name')}</div>,
    },
    {
        accessorKey: 'sku',
        header: 'SKU',
        cell: ({ row }) => <div className='w-fit text-nowrap'>{row.getValue('sku') || '-'}</div>,
    },
    {
        id: 'actions',
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
