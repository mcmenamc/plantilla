import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { LongText } from '@/components/long-text'
import { Quote } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'

export const quotesColumns: ColumnDef<Quote>[] = [
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
        accessorKey: 'folio',
        header: 'Folio',
        cell: ({ row }) => <div className='w-fit text-nowrap font-medium'>{row.getValue('folio')}</div>,
    },
    {
        accessorKey: 'client',
        header: 'Cliente',
        cell: ({ row }) => <LongText className='max-w-36'>{row.getValue('client')}</LongText>,
        meta: {
            className: 'w-36',
        },
    },
    {
        accessorKey: 'date',
        header: 'Fecha',
        cell: ({ row }) => <div className='w-fit text-nowrap'>{format(row.getValue('date'), 'dd/MM/yyyy')}</div>,
    },
    {
        accessorKey: 'validUntil',
        header: 'Válida Hasta',
        cell: ({ row }) => <div className='w-fit text-nowrap'>{format(row.getValue('validUntil'), 'dd/MM/yyyy')}</div>,
    },
    {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => {
            const total = parseFloat(row.getValue('total'))
            const formatted = new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN',
            }).format(total)
            return <div className='font-medium'>{formatted}</div>
        },
    },
    {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            return (
                <div className={cn(
                    'w-fit rounded-full px-2 py-1 text-xs font-medium',
                    status === 'accepted' ? 'bg-green-100 text-green-700' :
                        status === 'sent' ? 'bg-blue-100 text-blue-700' :
                            status === 'draft' ? 'bg-gray-100 text-gray-700' :
                                'bg-red-100 text-red-700'
                )}>
                    {status === 'accepted' ? 'Aceptada' :
                        status === 'sent' ? 'Enviada' :
                            status === 'draft' ? 'Borrador' : 'Rechazada'}
                </div>
            )
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
