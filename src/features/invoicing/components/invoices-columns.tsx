import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Invoice } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { formatDateUnshifted } from '@/lib/utils'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export const invoicesColumns: ColumnDef<Invoice>[] = [
    {
        accessorKey: 'folio',
        header: 'Folio',
        enableSorting: true,
        cell: ({ row }) => {
            const serie = row.original.serie || ''
            const folio = row.original.folio_number || ''
            return <div className='w-fit text-nowrap font-bold text-slate-900'>{serie}{folio ? `-${folio}` : ''}</div>
        },
    },
    {
        id: 'receptor',
        header: 'Receptor',
        cell: ({ row }) => {
            const receptor = row.original.receptor
            const customer = row.original.customer
            const name = receptor?.razon_social || customer?.razonSocial || 'N/A'
            const rfc = receptor?.rfc || customer?.rfc || ''

            return (
                <div className='flex flex-col'>
                    <div className='max-w-48 font-bold text-slate-800 dark:text-zinc-200 truncate'>{name}</div>
                    <span className='text-[10px] text-slate-500 font-mono'>{rfc}</span>
                </div>
            )
        },
        meta: {
            className: 'w-64',
        },
    },
    {
        accessorKey: 'uuid',
        header: 'UUID (Folio Fiscal)',
        cell: ({ row }) => {
            const uuid = row.getValue('uuid') as string
            if (!uuid) return <span className='text-slate-400'>-</span>

            const copyToClipboard = () => {
                navigator.clipboard.writeText(uuid)
                toast.success('UUID copiado al portapapeles')
            }

            return (
                <div className='flex items-center gap-2 group'>
                    <div className='w-32 truncate text-[10px] font-mono text-slate-500 uppercase' title={uuid}>
                        {uuid}
                    </div>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-50 hover:text-orange-600'
                        onClick={copyToClipboard}
                    >
                        <Copy className='h-3 w-3' />
                    </Button>
                </div>
            )
        },
    },
    {
        accessorKey: 'tipo_cfdi',
        header: 'Tipo',
        cell: ({ row }) => {
            const tipo = row.getValue('tipo_cfdi') as string
            const labels: Record<string, string> = {
                'I': 'Ingreso',
                'E': 'Egreso',
                'P': 'Pago',
                'N': 'Nómina',
                'T': 'Traslado'
            }
            return <div className='w-fit text-nowrap text-xs font-bold uppercase text-slate-500'>{labels[tipo] || tipo}</div>
        },
    },
    {
        accessorKey: 'fecha_emision',
        header: 'Fecha',
        enableSorting: true,
        cell: ({ row }) => {
            const dateStr = row.getValue('fecha_emision') as string
            return <div className='w-fit text-nowrap'>{formatDateUnshifted(dateStr)}</div>
        },
    },
    {
        accessorKey: 'total',
        header: 'Importe',
        enableSorting: true,
        cell: ({ row }) => {
            const tipo = row.original.tipo_cfdi
            let amount = parseFloat(row.getValue('total') ?? 0)
            let isPago = false

            // Para tipo P el total siempre es 0 (regla SAT)
            // El monto real está en complements[].data[].related_documents[].amount
            if (tipo === 'P') {
                const complements: any[] = row.original.complements || []
                amount = complements.reduce((sum: number, comp: any) => {
                    const dataArr: any[] = Array.isArray(comp.data) ? comp.data : (comp.data ? [comp.data] : [])
                    return sum + dataArr.reduce((s2: number, d: any) => {
                        const docs: any[] = d.related_documents || []
                        return s2 + docs.reduce((s3: number, doc: any) => s3 + (Number(doc.amount) || 0), 0)
                    }, 0)
                }, 0)
                isPago = true
            }

            const formatted = new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN',
            }).format(amount)

            return (
                <div className='flex flex-col'>
                    <span className='font-bold text-slate-900 dark:text-white'>{formatted}</span>
                    {isPago && <span className='text-[9px] text-slate-400 uppercase tracking-wide'>Monto pagado</span>}
                </div>
            )
        },
    },

    {
        accessorKey: 'moneda',
        header: 'Moneda',
        cell: ({ row }) => {
            const currency = row.original.moneda || 'MXN'
            const exchange = row.original.tipo_cambio
            return (
                <div className='flex flex-col items-start'>
                    <span className='font-medium'>{currency}</span>
                    {exchange && exchange !== 1 && (
                        <span className='text-[10px] text-slate-400'>TC: {exchange}</span>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: 'metodo_pago',
        header: 'Metodo Pago',
        cell: ({ row }) => {
            const val = row.getValue('metodo_pago') as string
            return <div className='text-[10px] font-bold uppercase'>{val === 'PUE' ? 'PUE - Una exhibición' : val === 'PPD' ? 'PPD - Diferido' : val || '-'}</div>
        },
    },
    {
        accessorKey: 'forma_pago',
        header: 'Forma Pago',
        cell: ({ row }) => {
            const val = row.getValue('forma_pago') as string
            const forms: Record<string, string> = {
                '01': '01 - Efectivo',
                '02': '02 - Cheque',
                '03': '03 - Transferencia',
                '04': '04 - T. Crédito',
                '28': '28 - T. Débito',
                '99': '99 - Por definir'
            }
            return <div className='text-[10px] uppercase'>{forms[val] || val || '-'}</div>
        },
    },
    {
        accessorKey: 'status',
        header: 'Estatus',
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            const labels: Record<string, string> = {
                valid: 'Válida',
                cancelled: 'Cancelada',
                draft: 'Borrador',
                pending: 'Pendiente'
            }
            return (
                <div className={cn(
                    'w-fit rounded-full px-2 py-0.5 text-[10px] font-black uppercase text-center',
                    status === 'valid' ? 'bg-green-100 text-green-700 border border-green-200' :
                        status === 'draft' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                'bg-red-100 text-red-700 border border-red-200'
                )}>
                    {labels[status] || status}
                </div>
            )
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
