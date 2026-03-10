import { parseISO, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { ColumnDef } from '@tanstack/react-table'
import { cn, formatDateUnshifted } from '@/lib/utils'
import { LongText } from '@/components/long-text'
import { WorkCenter } from '../data/schema'
import { DataTableRowActions } from './work-centers-row-actions'
import { WorkCentersLogoColumn } from './work-centers-logo-column'

export const workCentersColumns: ColumnDef<WorkCenter>[] = [
    {
        id: 'logo',
        header: 'Logo',
        cell: ({ row }) => <WorkCentersLogoColumn row={row.original} />,
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'workcenterName',
        header: 'Centro de Trabajo',
        cell: ({ row }) => <LongText className='max-w-48'>{row.getValue('workcenterName')}</LongText>,
        meta: {
            className: 'w-55',
        },
    },
    {
        accessorKey: 'rfc',
        header: 'RFC',
        cell: ({ row }) => <div className='w-fit text-nowrap font-mono text-xs'>{row.getValue('rfc') || '-'}</div>,
    },
    {
        accessorKey: 'tipo_persona',
        header: 'Tipo Persona',
        cell: ({ row }) => <div className='w-fit text-nowrap'>{row.getValue('tipo_persona') || '-'}</div>,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: 'hasFiel',
        header: 'FIEL / Vencimiento',
        cell: ({ row }) => {
            const hasFiel = row.original.hasFiel as boolean
            const dateStr = row.original.fielVencimiento

            if (!hasFiel) {
                return (
                    <div className='bg-slate-100 text-slate-500 w-fit rounded-full px-2 py-0.5 text-[10px] font-medium text-nowrap'>
                        No cargada
                    </div>
                )
            }

            if (!dateStr) {
                return (
                    <div className='bg-green-100 text-green-700 w-fit rounded-full px-2 py-0.5 text-[10px] font-medium text-nowrap'>
                        Cargada (Sin fecha)
                    </div>
                )
            }

            try {
                const date = parseISO(dateStr)
                const relativeTime = formatDistanceToNow(date, { locale: es, addSuffix: true })
                const isExpired = date < new Date()

                return (
                    <div className='flex flex-col gap-0.5'>
                        <div className={cn(
                            'w-fit rounded-full px-2 py-0.5 text-[10px] font-medium',
                            isExpired ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        )}>
                            {isExpired ? 'Expirada' : 'Cargada'}
                        </div>
                        <div className='text-[11px] font-medium text-nowrap'>
                            {formatDateUnshifted(dateStr)}
                        </div>
                        <div className='text-[10px] text-muted-foreground italic text-nowrap'>
                            ({relativeTime})
                        </div>
                    </div>
                )
            } catch (e) {
                return <div className='text-destructive text-xs italic'>Error fecha</div>
            }
        },
    },
    {
        accessorKey: 'hasStamps',
        header: 'CSD / Vencimiento',
        cell: ({ row }) => {
            const hasStamps = row.getValue('hasStamps') as boolean
            const dateStr = row.original.fechaVencimiento

            if (!hasStamps) {
                return (
                    <div className='bg-slate-100 text-slate-500 w-fit rounded-full px-2 py-0.5 text-[10px] font-medium text-nowrap'>
                        No cargados
                    </div>
                )
            }

            if (!dateStr) {
                return (
                    <div className='bg-green-100 text-green-700 w-fit rounded-full px-2 py-0.5 text-[10px] font-medium text-nowrap'>
                        Cargados (Sin fecha)
                    </div>
                )
            }

            try {
                const date = parseISO(dateStr)
                const relativeTime = formatDistanceToNow(date, { locale: es, addSuffix: true })
                const isExpired = date < new Date()

                return (
                    <div className='flex flex-col gap-0.5'>
                        <div className={cn(
                            'w-fit rounded-full px-2 py-0.5 text-[10px] font-medium',
                            isExpired ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        )}>
                            {isExpired ? 'Expirados' : 'Cargados'}
                        </div>
                        <div className='text-[11px] font-medium text-nowrap'>
                            {formatDateUnshifted(dateStr)}
                        </div>
                        <div className='text-[10px] text-muted-foreground italic text-nowrap'>
                            ({relativeTime})
                        </div>
                    </div>
                )
            } catch (e) {
                return <div className='text-destructive text-xs italic'>Error fecha</div>
            }
        },
    },

    {
        id: 'opinion_sat',
        header: 'Opinión SAT',
        cell: ({ row }) => {
            const op = row.original.opinionCumplimiento
            if (!op || !op.url) {
                return (
                    <div className='bg-slate-100 text-slate-500 w-fit rounded-full px-2 py-0.5 text-[10px] font-medium'>
                        No cargada
                    </div>
                )
            }

            const opinionDate = op.fecha ? parseISO(op.fecha) : null
            const isFresh = opinionDate ? (new Date().getTime() - opinionDate.getTime()) < (180 * 24 * 60 * 60 * 1000) : false
            const relativeTime = opinionDate ? formatDistanceToNow(opinionDate, { locale: es, addSuffix: true }) : null

            if (op.valida && isFresh) {
                return (
                    <div className='flex flex-col gap-0.5'>
                        <div className='bg-green-100 text-green-700 w-fit rounded-full px-2 py-0.5 text-[10px] font-medium'>
                            Positiva
                        </div>
                        {relativeTime && (
                            <div className='text-[10px] text-muted-foreground italic text-nowrap'>
                                ({relativeTime})
                            </div>
                        )}
                    </div>
                )
            }

            return (
                <div className='flex flex-col gap-0.5'>
                    <div className={cn(
                        'w-fit rounded-full px-2 py-0.5 text-[10px] font-medium',
                        'bg-orange-100 text-orange-700'
                    )}>
                        {!op.valida ? 'Negativa' : 'Desactualizada'}
                    </div>
                    {relativeTime && (
                        <div className='text-[10px] text-muted-foreground italic text-nowrap text-orange-600'>
                            Hace {relativeTime.replace('hace ', '')}
                        </div>
                    )}
                </div>
            )
        },
    },


    // {
    //     accessorKey: 'estatus',
    //     header: 'Estado',
    //     cell: ({ row }) => {
    //         const status = row.getValue('estatus') as string
    //         if (!status) return '-'
    //         const colorClass =
    //             status === 'Activo' ? 'bg-green-100 text-green-700' :
    //                 status === 'Inactivo' ? 'bg-yellow-100 text-yellow-700' :
    //                     'bg-red-100 text-red-700'
    //         return (
    //             <div className={`w-fit rounded-full px-2 py-1 text-xs font-medium ${colorClass}`}>
    //                 {status}
    //             </div>
    //         )
    //     },
    //     filterFn: (row, id, value) => {
    //         return value.includes(row.getValue(id))
    //     },
    // },
    {
        id: 'actions',
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
