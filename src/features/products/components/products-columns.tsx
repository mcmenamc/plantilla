import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
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
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }) => <LongText className='max-w-36'>{row.getValue('name')}</LongText>,
        meta: {
            className: 'w-36',
        },
    },
    {
        accessorKey: 'code',
        header: 'Código',
        cell: ({ row }) => <div className='w-fit text-nowrap'>{row.getValue('code')}</div>,
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
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => <div className='w-fit text-nowrap'>{row.getValue('stock')}</div>,
    },
    {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            return (
                <div className={cn(
                    'w-fit rounded-full px-2 py-1 text-xs font-medium',
                    status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                )}>
                    {status === 'active' ? 'Activo' : 'Inactivo'}
                </div>
            )
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
