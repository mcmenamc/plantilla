import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableRowActions } from './series-row-actions'

export type SeriesRow = {
    _id: string
    workCenter: string
    enabled: boolean
    typeCode: string
    typeName: string
    prefix: string
    next_folio: number
    originalConfig: any
}

export const seriesColumns: ColumnDef<SeriesRow>[] = [
    {
        accessorKey: 'typeName',
        header: 'Tipo de Comprobante',
        cell: ({ row }) => {
            return <span className='font-medium'>{row.getValue('typeName')}</span>
        },
        meta: {
            className: 'min-w-[200px]',
        },
    },
    {
        accessorKey: 'prefix',
        header: 'Prefijo',
        cell: ({ row }) => {
            const prefix = row.getValue('prefix') as string
            return <Badge variant='outline' className='font-mono uppercase px-2 py-0.5'>{prefix || '-'}</Badge>
        },
        meta: {
            className: 'w-[100px]',
        },
    },
    {
        accessorKey: 'next_folio',
        header: 'Sig. Folio',
        cell: ({ row }) => {
            return <span className='text-sm tabular-nums font-medium'>{row.getValue('next_folio')}</span>
        },
        meta: {
            className: 'w-[100px]',
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <DataTableRowActions row={row} />,
        enableHiding: false,
        meta: {
            className: 'w-[50px]',
        },
    },
]
