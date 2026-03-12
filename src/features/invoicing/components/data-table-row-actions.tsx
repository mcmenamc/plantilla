import { Row } from '@tanstack/react-table'
import { MoreHorizontal, Trash, Eye, FileDown, ExternalLink, FileCode, Send, Download, Edit, Mail } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Invoice } from '../data/schema'
import { useInvoices } from './invoices-provider'
import { stampDraft, downloadCancellationReceipt, resendInvoiceEmail } from '../data/invoicing-api'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useWorkCenterStore } from '@/stores/work-center-store'
import { usePermissions } from '@/hooks/use-permissions'

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
}

export function DataTableRowActions<TData>({
    row,
}: DataTableRowActionsProps<TData>) {
    const { setOpen, setCurrentRow } = useInvoices()
    const invoice = row.original as Invoice
    const queryClient = useQueryClient()
    const { selectedWorkCenterId } = useWorkCenterStore()
    const { can } = usePermissions()

    const handleStampDraft = async () => {
        try {
            toast.loading('Timbrando borrador...')
            await stampDraft(invoice._id)
            toast.dismiss()
            toast.success('Borrador timbrado exitosamente')
            queryClient.invalidateQueries({ queryKey: ['invoices', selectedWorkCenterId] })
        } catch (e: any) {
            toast.dismiss()
            toast.error(e.response?.data?.message || 'Error al timbrar borrador')
        }
    }

    const handleDownloadReceipt = async () => {
        try {
            toast.loading('Generando acuse...')
            const blob = await downloadCancellationReceipt(invoice._id)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Acuse_Cancelacion_${invoice.uuid || invoice.folio_number}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)
            toast.dismiss()
            toast.success('Acuse descargado')
        } catch (e: any) {
            toast.dismiss()
            toast.error('Error al descargar el acuse de cancelación')
        }
    }

    const handleResendEmail = async () => {
        try {
            toast.loading('Reenviando factura...')
            await resendInvoiceEmail(invoice._id)
            toast.dismiss()
            toast.success('Factura reenviada correctamente')
        } catch (e: any) {
            toast.dismiss()
            toast.error(e.response?.data?.message || 'Error al reenviar la factura')
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant='ghost'
                    className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
                >
                    <MoreHorizontal className='h-4 w-4' />
                    <span className='sr-only'>Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[200px]'>
                {(invoice.status === 'draft' ? can('Editar') : can('Ver')) && (
                    <DropdownMenuItem asChild>
                        <Link
                            to='/invoicing/$invoiceId'
                            params={{ invoiceId: invoice._id }}
                            className='w-full cursor-pointer flex items-center px-2 py-1.5'
                        >
                            {invoice.status === 'draft' ? (
                                <>
                                    <Edit className='mr-2 h-3.5 w-3.5 text-blue-600' />
                                    Editar Borrador
                                </>
                            ) : (
                                <>
                                    <Eye className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
                                    Ver Detalles
                                </>
                            )}
                        </Link>
                    </DropdownMenuItem>
                )}

                {invoice.verification_url && (
                    <DropdownMenuItem asChild>
                        <a href={invoice.verification_url} target='_blank' rel='noreferrer' className='cursor-pointer w-full'>
                            <ExternalLink className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
                            Verificar SAT
                        </a>
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {can('Descargar') && (invoice.pdfPath || invoice.status === 'valid') && (
                    <DropdownMenuItem asChild>
                        <Link
                            to='/viewer'
                            search={{
                                path: invoice.pdfPath || '',
                                title: `Factura ${invoice.serie || ''}${invoice.folio_number ? `-${invoice.folio_number}` : ''}`,
                                type: 'pdf'
                            }}
                            target='_blank'
                            className='cursor-pointer w-full'
                        >
                            <FileDown className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
                            Ver PDF
                        </Link>
                    </DropdownMenuItem>
                )}

                {can('Descargar') && (invoice.xmlPath || invoice.status === 'valid') && (
                    <DropdownMenuItem asChild>
                        <Link
                            to='/viewer'
                            search={{
                                path: invoice.xmlPath || '',
                                title: `Factura ${invoice.serie || ''}${invoice.folio_number ? `-${invoice.folio_number}` : ''}`,
                                type: 'xml'
                            }}
                            target='_blank'
                            className='cursor-pointer w-full'
                        >
                            <FileCode className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
                            Ver XML
                        </Link>
                    </DropdownMenuItem>
                )}

                {can('Reenviar') && invoice.status === 'valid' && (
                    <DropdownMenuItem onClick={handleResendEmail}>
                        <Mail className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
                        Reenviar Correo
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {can('Timbrar') && invoice.status === 'draft' && (
                    <DropdownMenuItem onClick={handleStampDraft} className='text-blue-600 font-bold'>
                        <Send className='mr-2 h-3.5 w-3.5' />
                        Timbrar Borrador
                    </DropdownMenuItem>
                )}

                {can('Descargar') && invoice.status === 'canceled' && (
                    <DropdownMenuItem onClick={handleDownloadReceipt} className='text-slate-600 font-bold'>
                        <Download className='mr-2 h-3.5 w-3.5' />
                        Acuse Cancelación
                    </DropdownMenuItem>
                )}

                {invoice.status === 'draft' && can('Eliminar') && (
                    <DropdownMenuItem
                        onClick={() => {
                            setCurrentRow(invoice)
                            setOpen('delete')
                        }}
                        className='text-red-600'
                    >
                        <Trash className='mr-2 h-3.5 w-3.5' />
                        Eliminar Borrador
                    </DropdownMenuItem>
                )}

                {invoice.status !== 'draft' && invoice.status !== 'canceled' && can('Cancelar') && (
                    <DropdownMenuItem
                        onClick={() => {
                            setCurrentRow(invoice)
                            setOpen('delete')
                        }}
                        className='text-red-600'
                    >
                        <Trash className='mr-2 h-3.5 w-3.5' />
                        Cancelar CFDI
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
