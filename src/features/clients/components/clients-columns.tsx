import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { LongText } from '@/components/long-text'
import { Client } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const clientsColumns: ColumnDef<Client>[] = [
    {
        accessorKey: 'razonSocial',
        header: 'Razón Social',
        cell: ({ row }) => <LongText className='max-w-48'>{row.getValue('razonSocial')}</LongText>,
        meta: {
            className: 'w-55',
        },
    },
    {
        accessorKey: 'rfc',
        header: 'RFC',
        cell: ({ row }) => <div className='w-fit text-nowrap font-mono text-xs'>{row.getValue('rfc')}</div>,
    },
    {
        accessorKey: 'tipo_persona',
        header: 'Tipo Persona',
        cell: ({ row }) => <div className='w-fit text-nowrap text-xs'>{row.getValue('tipo_persona')}</div>,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <div className='w-fit text-nowrap text-xs'>{row.getValue('email')}</div>,
    },
    {
        accessorKey: 'cp',
        header: 'C.P.',
        cell: ({ row }) => <div className='w-fit text-nowrap text-xs'>{row.getValue('cp')}</div>,
    },
    {
        accessorKey: 'estatus',
        header: 'Estado',
        cell: ({ row }) => {
            const status = row.getValue('estatus') as string
            const colorClass =
                status === 'Activo' ? 'bg-green-100 text-green-700' :
                    status === 'Inactivo' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
            return (
                <div className={cn(
                    'w-fit rounded-full px-2 py-1 text-xs font-medium',
                    colorClass
                )}>
                    {status}
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
