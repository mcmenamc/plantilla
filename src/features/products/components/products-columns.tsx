import { ColumnDef } from '@tanstack/react-table'
import { LongText } from '@/components/long-text'
import { Product } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const productsColumns: ColumnDef<Product>[] = [
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
        cell: ({ row }) => (
            <div className='flex flex-col'>
                <span className='font-medium text-nowrap'>{row.original.product_key}</span>
                <span className='text-xs text-muted-foreground line-clamp-1'>
                    {row.original.product_key_nombre}
                </span>
            </div>
        ),
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
        cell: ({ row }) => (
            <div className='flex flex-col'>
                <span className='font-medium text-nowrap'>{row.original.unit_name}</span>
                <span className='text-xs text-muted-foreground line-clamp-1'>
                    {row.original.unit_key}
                </span>
            </div>
        ),
    },
    {
        accessorKey: 'taxability',
        header: 'Objeto SAT',
        filterFn: 'arrIncludesSome',
        cell: ({ row }) => {
            const val = row.getValue('taxability') as string
            const labels: Record<string, string> = {
                '01': '01 - No objeto de impuesto',
                '02': '02 - Sí objeto de impuesto',
                '03': '03 - Sí objeto de impuesto, pero no obligado a desglose',
                '04': '04 - Sí objeto de impuesto, y no causa impuesto',
            }
            return <div className='w-fit text-nowrap'>{labels[val] || val}</div>
        },
    },
    {
        accessorKey: 'tax_included',
        header: 'IVA Incluido',
        cell: ({ row }) => (
            <div className='w-fit text-nowrap'>
                {row.getValue('tax_included') ? 'Sí' : 'No'}
            </div>
        ),
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
