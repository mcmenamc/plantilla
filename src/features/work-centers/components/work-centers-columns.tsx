import { parseISO, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { ColumnDef } from '@tanstack/react-table'
import { cn, formatDateUnshifted } from '@/lib/utils'
import { LongText } from '@/components/long-text'
import { WorkCenter } from '../data/schema'
import { DataTableRowActions } from './work-centers-row-actions'
import { WorkCentersLogoColumn } from './work-centers-logo-column'
import { useWorkCenters } from './work-centers-provider'
import { usePermissions } from '@/hooks/use-permissions'


const FielCell = ({ row }: { row: WorkCenter }) => {
    const { setOpen, setCurrentRow } = useWorkCenters()
    const { can } = usePermissions()
    const hasFiel = row.hasFiel as boolean
    const dateStr = row.fielVencimiento

    const onOpen = () => {
        if (!can('Subir FIEL')) return
        setCurrentRow(row)
        setOpen('upload-fiel')
    }

    if (!hasFiel) {
        return (
            <button
                onClick={onOpen}
                disabled={!can('Subir FIEL')}
                className='bg-slate-100 text-slate-500 w-fit rounded-full px-2 py-0.5 text-[10px] font-medium text-nowrap hover:bg-slate-200 transition-colors cursor-pointer disabled:cursor-not-allowed'
            >
                No cargada
            </button>
        )
    }

    if (!dateStr) {
        return (
            <button
                onClick={onOpen}
                className='bg-green-100 text-green-700 w-fit rounded-full px-2 py-0.5 text-[10px] font-medium text-nowrap hover:bg-green-200 transition-colors cursor-pointer'
            >
                Cargada (Sin fecha)
            </button>
        )
    }

    try {
        const date = parseISO(dateStr)
        const relativeTime = formatDistanceToNow(date, { locale: es, addSuffix: true })
        const isExpired = date < new Date()

        return (
            <button
                onClick={onOpen}
                className='flex flex-col gap-0.5 text-left hover:opacity-80 transition-opacity cursor-pointer group'
            >
                <div className={cn(
                    'w-fit rounded-full px-2 py-0.5 text-[10px] font-medium group-hover:scale-105 transition-transform',
                    isExpired ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                )}>
                    {isExpired ? 'Expirada' : 'Cargada'}
                </div>
                <div className='text-[11px] font-bold text-nowrap'>
                    {formatDateUnshifted(dateStr)}
                </div>
                <div className='text-[10px] text-muted-foreground italic text-nowrap'>
                    ({relativeTime})
                </div>
            </button>
        )
    } catch (e) {
        return <div className='text-destructive text-xs italic'>Error fecha</div>
    }
}

const CsdCell = ({ row }: { row: WorkCenter }) => {
    const { setOpen, setCurrentRow } = useWorkCenters()
    const { can } = usePermissions()
    const hasStamps = row.hasStamps as boolean
    const dateStr = row.fechaVencimiento

    const onOpen = () => {
        if (!can('Subir CSD')) return
        setCurrentRow(row)
        setOpen('upload-cert')
    }

    if (!hasStamps) {
        return (
            <button
                onClick={onOpen}
                disabled={!can('Subir CSD')}
                className='bg-slate-100 text-slate-500 w-fit rounded-full px-2 py-0.5 text-[10px] font-medium text-nowrap hover:bg-slate-200 transition-colors cursor-pointer disabled:cursor-not-allowed'
            >
                No cargados
            </button>
        )
    }

    if (!dateStr) {
        return (
            <button
                onClick={onOpen}
                className='bg-green-100 text-green-700 w-fit rounded-full px-2 py-0.5 text-[10px] font-medium text-nowrap hover:bg-green-200 transition-colors cursor-pointer'
            >
                Cargados (Sin fecha)
            </button>
        )
    }

    try {
        const date = parseISO(dateStr)
        const relativeTime = formatDistanceToNow(date, { locale: es, addSuffix: true })
        const isExpired = date < new Date()

        return (
            <button
                onClick={onOpen}
                className='flex flex-col gap-0.5 text-left hover:opacity-80 transition-opacity cursor-pointer group'
            >
                <div className={cn(
                    'w-fit rounded-full px-2 py-0.5 text-[10px] font-medium group-hover:scale-105 transition-transform',
                    isExpired ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                )}>
                    {isExpired ? 'Expirados' : 'Cargados'}
                </div>
                <div className='text-[11px] font-bold text-nowrap'>
                    {formatDateUnshifted(dateStr)}
                </div>
                <div className='text-[10px] text-muted-foreground italic text-nowrap'>
                    ({relativeTime})
                </div>
            </button>
        )
    } catch (e) {
        return <div className='text-destructive text-xs italic'>Error fecha</div>
    }
}

const OpinionSatCell = ({ row }: { row: WorkCenter }) => {
    const { setOpen, setCurrentRow } = useWorkCenters()
    const { can } = usePermissions()
    const op = row.opinionCumplimiento

    const onOpen = () => {
        if (!can('Subir Opinión de Cumplimiento')) return
        setCurrentRow(row)
        setOpen('upload-opinion')
    }

    if (!op || !op.url) {
        return (
            <button
                onClick={onOpen}
                disabled={!can('Subir Opinión de Cumplimiento')}
                className='bg-slate-100 text-slate-500 w-fit rounded-full px-2 py-0.5 text-[10px] font-medium hover:bg-slate-200 transition-colors cursor-pointer disabled:cursor-not-allowed'
            >
                No cargada
            </button>
        )
    }

    const opinionDate = op.fecha ? parseISO(op.fecha) : null
    const isFresh = opinionDate ? (new Date().getTime() - opinionDate.getTime()) < (180 * 24 * 60 * 60 * 1000) : false
    const relativeTime = opinionDate ? formatDistanceToNow(opinionDate, { locale: es, addSuffix: true }) : null

    return (
        <button
            onClick={onOpen}
            className='flex flex-col gap-0.5 text-left hover:opacity-80 transition-opacity cursor-pointer group'
        >
            <div className={cn(
                'w-fit rounded-full px-2 py-0.5 text-[10px] font-medium group-hover:scale-105 transition-transform',
                op.valida && isFresh ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            )}>
                {op.valida && isFresh ? 'Positiva' : (!op.valida ? 'Negativa' : 'Desactualizada')}
            </div>
            {relativeTime && (
                <div className={cn(
                    'text-[10px] text-muted-foreground italic text-nowrap',
                    !(op.valida && isFresh) && 'text-orange-600'
                )}>
                    {op.valida && isFresh ? `(${relativeTime})` : `Hace ${relativeTime.replace('hace ', '')}`}
                </div>
            )}
        </button>
    )
}

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
        cell: ({ row }) => <FielCell row={row.original} />,
    },
    {
        accessorKey: 'hasStamps',
        header: 'CSD / Vencimiento',
        cell: ({ row }) => <CsdCell row={row.original} />,
    },

    {
        id: 'opinion_sat',
        header: 'Opinión SAT',
        cell: ({ row }) => <OpinionSatCell row={row.original} />,
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
