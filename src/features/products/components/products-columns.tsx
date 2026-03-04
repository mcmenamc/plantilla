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
        accessorKey: 'sku',
        header: 'SKU',
        cell: ({ row }) => <div className='w-fit text-nowrap font-mono text-xs text-slate-500'>{row.getValue('sku') || '-'}</div>,
    },
    {
        accessorKey: 'product_key',
        header: 'Clave SAT',
        cell: ({ row }) => (
            <div className='flex flex-col'>
                <span className='font-medium text-nowrap'>{row.original.product_key}</span>
                <span className='text-xs text-muted-foreground line-clamp-1 italic'>
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
            return <div className='font-bold text-slate-900 dark:text-zinc-100'>{formatted}</div>
        },
    },
    {
        accessorKey: 'tax_details',
        header: 'Impuestos',
        cell: ({ row }) => {
            const taxIncluded = row.original.tax_included
            const taxes = row.original.taxes || []
            const localTaxes = row.original.local_taxes || []
            const hasTaxes = taxes.length > 0 || localTaxes.length > 0

            return (
                <div className='flex flex-col gap-1 min-w-[120px]'>
                    <div className='flex items-center gap-1.5'>
                        {taxIncluded ? (
                            <span className='text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold border border-blue-100 dark:border-blue-800/50'>Incluido</span>
                        ) : (
                            <span className='text-[10px] bg-slate-50 text-slate-500 dark:bg-zinc-900 dark:text-zinc-400 px-1.5 py-0.5 rounded font-bold border border-slate-200 dark:border-zinc-800'>+ Impuestos</span>
                        )}
                    </div>
                    {hasTaxes && (
                        <div className='flex flex-wrap gap-1'>
                            {taxes.map((t, i) => (
                                <span key={i} className={`text-[9px] px-1 rounded font-medium ${t.withholding ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>
                                    {t.type} {t.rate > 1 ? t.rate : (t.rate * 100).toFixed(0)}%
                                </span>
                            ))}
                            {localTaxes.map((t, i) => (
                                <span key={`l-${i}`} className='text-[9px] bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 px-1 rounded font-medium border border-purple-100 dark:border-purple-800/30'>
                                    {t.type || (t as any).name} {(t.rate > 1 ? t.rate : t.rate * 100).toFixed(0)}%
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: 'taxability',
        header: 'Objeto SAT',
        cell: ({ row }) => {
            const val = row.getValue('taxability') as string
            return (
                <div className='flex items-center gap-2'>
                    <span className='text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-1.5 py-0.5 rounded'>
                        {val}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'unit_name',
        header: 'Unidad',
        cell: ({ row }) => (
            <div className='flex flex-col'>
                <span className='font-medium text-nowrap text-xs'>{row.original.unit_name}</span>
                <span className='text-[10px] text-muted-foreground line-clamp-1'>
                    {row.original.unit_key}
                </span>
            </div>
        ),
    },
    {
        id: 'actions',
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
