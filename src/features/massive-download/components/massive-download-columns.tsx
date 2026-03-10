import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MassiveDownload } from '../data/massive-download-api'
import { DataTableRowActions } from './data-table-row-actions'

export const massiveDownloadColumns: ColumnDef<MassiveDownload>[] = [
    {
        accessorKey: 'createdAt',
        header: 'Fecha Solicitud',
        cell: ({ row }) => {
            const date = new Date(row.getValue('createdAt'))
            return (
                <span className='text-sm font-medium whitespace-nowrap'>
                    {format(date, 'dd/MM/yy HH:mm')}
                </span>
            )
        },
    },
    {
        id: 'id_solicitud',
        header: 'Solicitud',
        cell: ({ row }) => {
            const d = row.original
            return (
                <Badge variant='secondary' className='text-[10px] px-1.5 py-0.5 h-5 font-mono font-normal opacity-80'>
                    #{d.requestId?.slice(-8) || d._id.slice(-8)}
                </Badge>
            )
        },
    },
    {
        id: 'periodo',
        header: 'Periodo',
        cell: ({ row }) => {
            const d = row.original
            return (
                <span className='text-xs font-medium whitespace-nowrap'>
                    {format(new Date(d.fechaInicio), 'dd/MM/yy')} - {format(new Date(d.fechaFin), 'dd/MM/yy')}
                </span>
            )
        },
    },
    {
        accessorKey: 'tipo',
        header: 'Tipo',
        cell: ({ row }) => {
            const d = row.original
            const tipo = d.tipo as string
            const serviceType = d.serviceType || 'cfdi'
            const requestType = d.requestType || 'xml'

            return (
                <div className='flex flex-col gap-1 items-start'>
                    <div className='flex gap-1'>
                        <Badge variant='outline' className='font-normal text-[10px] uppercase tracking-wider py-0 px-2'>
                            {tipo === 'issued' ? 'Emitidas' : 'Recibidas'}
                        </Badge>
                        {serviceType === 'retenciones' && (
                            <Badge variant='secondary' className='bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 font-normal text-[9px] py-0 px-1 border-purple-200'>
                                Retenciones
                            </Badge>
                        )}
                    </div>
                    {requestType === 'metadata' && (
                        <span className='text-[9px] text-slate-400 font-bold uppercase tracking-tighter'>Solo Metadatos</span>
                    )}
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    // {
    //     id: 'filtros_avanzados',
    //     header: 'Filtros Aplicados',
    //     cell: ({ row }) => {
    //         const d = row.original
    //         const hasAdvanced = d.rfcMatch || d.complement || d.uuid || d.rfcOnBehalf || (d.documentType && d.documentType !== 'all')

    //         if (!hasAdvanced) {
    //             return (
    //                 <div className='flex items-center h-full'>
    //                     <span className='text-[10px] text-slate-400 italic opacity-60'>Sin filtros extras</span>
    //                 </div>
    //             )
    //         }

    //         return (
    //             <div className='flex flex-wrap gap-1 max-w-[200px]'>
    //                 {d.rfcMatch && (
    //                     <Badge variant='outline' className='text-[9px] py-0 h-4 bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 text-blue-600 dark:text-blue-400 font-medium'>
    //                         RFC: {d.rfcMatch}
    //                     </Badge>
    //                 )}
    //                 {d.complement && (
    //                     <Badge variant='outline' className='text-[9px] py-0 h-4 bg-orange-50/50 dark:bg-orange-900/10 border-orange-200/50 text-orange-600 dark:text-orange-400 uppercase font-medium'>
    //                         {d.complement}
    //                     </Badge>
    //                 )}
    //                 {d.uuid && (
    //                     <Badge variant='outline' className='text-[9px] py-0 h-4 bg-slate-50/50 dark:bg-slate-900/10 border-slate-200/50 font-medium'>
    //                         UUID: {d.uuid.slice(0, 8)}...
    //                     </Badge>
    //                 )}
    //                 {d.documentType && d.documentType !== 'all' && d.documentType !== 'undefined' && (
    //                     <Badge variant='outline' className='text-[9px] py-0 h-4 bg-green-50/50 dark:bg-green-900/10 border-green-200/50 text-green-600 dark:text-green-400 uppercase font-medium'>
    //                         {d.documentType}
    //                     </Badge>
    //                 )}
    //                 {d.rfcOnBehalf && (
    //                     <Badge variant='outline' className='text-[9px] py-0 h-4 bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200/50 text-yellow-600 dark:text-yellow-400 font-medium'>
    //                         Tercero: {d.rfcOnBehalf}
    //                     </Badge>
    //                 )}
    //             </div>
    //         )
    //     }
    // },
    {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            return (
                <div className='flex justify-start'>
                    {status === 'completed' && (
                        <Badge className='bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 border-green-200/50 gap-1 capitalize px-2 py-0.5 text-[10px] font-medium'>
                            <CheckCircle2 className='h-3 w-3' /> completado
                        </Badge>
                    )}
                    {status === 'pending' && (
                        <Badge className='bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 border-amber-200/50 gap-1 capitalize px-2 py-0.5 text-[10px] font-medium'>
                            <Clock className='h-3 w-3 animate-pulse' /> en proceso
                        </Badge>
                    )}
                    {status === 'error' && (
                        <Badge variant='destructive' className='gap-1 capitalize px-2 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 border-red-200 hover:bg-red-100'>
                            <AlertCircle className='h-3 w-3' /> error
                        </Badge>
                    )}
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: 'totalXmls',
        header: 'XMLs',
        cell: ({ row }) => <div className='font-bold text-sm text-slate-700 dark:text-slate-300 ml-2'>{row.getValue('totalXmls') || 0}</div>,
    },
    {
        id: 'ultima_actualizacion',
        header: 'Último Evento',
        cell: ({ row }) => {
            const d = row.original
            const latestLog = d.logs && d.logs.length > 0 ? d.logs[d.logs.length - 1] : null
            const updateDate = new Date(d.updatedAt)

            return (
                <div className='flex flex-col gap-0.5 min-w-[200px]'>
                    <span className='text-[11px] font-semibold truncate text-slate-700 dark:text-slate-300'>
                        {latestLog ? latestLog.mensaje : 'Sin registros'}
                    </span>
                    <span className='text-[10px] text-muted-foreground flex items-center gap-1'>
                        <Clock className='h-2.5 w-2.5' />
                        {format(updateDate, 'dd/MM/yy HH:mm')}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'serviceType',
        header: 'Servicio',
        cell: ({ row }) => <span className='capitalize text-xs'>{row.getValue('serviceType') || 'cfdi'}</span>,
        filterFn: (row, id, value) => value.includes(row.getValue(id) || 'cfdi'),
    },
    {
        accessorKey: 'requestType',
        header: 'Tipo Solicitud',
        cell: ({ row }) => <span className='capitalize text-xs'>{row.getValue('requestType') || 'xml'}</span>,
        filterFn: (row, id, value) => value.includes(row.getValue(id) || 'xml'),
    },
    {
        id: 'actions',
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
