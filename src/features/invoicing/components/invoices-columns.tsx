import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { LongText } from '@/components/long-text'
import { Invoice } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'

export const invoicesColumns: ColumnDef<Invoice>[] = [
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
        cell: ({ row }) => {
            const serie = row.original.serie || ''
            const folio = row.original.folio_number || ''
            return <div className='w-fit text-nowrap font-medium'>{serie}{folio ? `-${folio}` : ''}</div>
        },
    },
    {
        id: 'client',
        accessorKey: 'customer.razonSocial',
        header: 'Receptor',
        cell: ({ row }) => <LongText className='max-w-48'>{row.original.customer?.razonSocial || 'N/A'}</LongText>,
        meta: {
            className: 'w-48',
        },
    },
    {
        accessorKey: 'tipo_cfdi',
        header: 'Tipo Factura',
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
        cell: ({ row }) => {
            const dateStr = row.getValue('fecha_emision') as string
            if (!dateStr) return <div>-</div>
            return <div className='w-fit text-nowrap'>{format(new Date(dateStr), 'dd/MM/yyyy')}</div>
        },
    },
    {
        accessorKey: 'total',
        header: 'Importe Facturado',
        cell: ({ row }) => {
            const total = parseFloat(row.getValue('total'))
            const formatted = new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN',
            }).format(total)
            return <div className='font-bold text-slate-900 dark:text-white'>{formatted}</div>
        },
    },
    {
        id: 'balance',
        header: 'Balance',
        cell: ({ row }) => {
            const total = parseFloat(row.original.total as any)
            const formatted = new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN',
            }).format(total)
            return <div className='font-medium text-slate-500'>{formatted}</div>
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
