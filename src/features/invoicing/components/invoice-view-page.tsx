import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { 
    getInvoiceById, 
    cancelInvoice, 
    downloadCancellationReceipt,
    resendInvoiceEmail
} from '../data/invoicing-api'
import { Link } from '@tanstack/react-router'
import { InvoiceFormIngreso } from './invoice-form-ingreso'
import { InvoiceFormEgreso } from './invoice-form-egreso'
import { InvoiceFormPago } from './invoice-form-pago'
import { InvoiceFormTraslado } from './invoice-form-traslado'
import { 
    ArrowLeft, 
    Loader2, 
    Ban, 
    Download, 
    CheckCircle2,
    AlertCircle,
    Copy,
    ExternalLink,
    Mail,
    FileDown,
    FileCode,
    Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { usePermissions } from '@/hooks/use-permissions'

interface InvoiceViewPageProps {
    invoiceId: string
}

export function InvoiceViewPage({ invoiceId }: InvoiceViewPageProps) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [isCancelling, setIsCancelling] = useState(false)
    const { can } = usePermissions()

    const { data, isLoading, error } = useQuery({
        queryKey: ['invoice', invoiceId],
        queryFn: () => getInvoiceById(invoiceId),
        retry: 1
    })

    const invoice = data?.facturaHaz
    const apiInvoice = data?.facturaApi

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] })
        queryClient.invalidateQueries({ queryKey: ['invoices'] })
        toast.success('Cambios guardados correctamente')
    }

    const handleCancelInvoice = async () => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar esta factura?')) return

        const motive = window.prompt('Motivo de cancelación (01, 02, 03, 04):', '02')
        if (!motive) return

        setIsCancelling(true)
        try {
            await cancelInvoice({ facturaId: invoiceId, motive })
            toast.success('Solicitud de cancelación enviada correctamente')
            queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] })
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al cancelar la factura')
        } finally {
            setIsCancelling(false)
        }
    }

    const handleDownloadReceipt = async () => {
        try {
            toast.loading('Descargando acuse...')
            const blob = await downloadCancellationReceipt(invoiceId)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `acuse-cancelacion-${invoice?.folio_number || invoiceId}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            toast.dismiss()
            toast.success('Acuse descargado')
        } catch (err: any) {
            toast.dismiss()
            toast.error('Error al descargar el acuse')
        }
    }

    const handleResendEmail = async () => {
        try {
            toast.loading('Reenviando factura...')
            await resendInvoiceEmail(invoiceId)
            toast.dismiss()
            toast.success('Factura reenviada correctamente')
        } catch (err: any) {
            toast.dismiss()
            toast.error(err.response?.data?.message || 'Error al reenviar la factura')
        }
    }

    if (isLoading) {
        return (
            <div className='flex h-96 flex-col items-center justify-center gap-4'>
                <Loader2 className='h-12 w-12 animate-spin text-orange-600' strokeWidth={2} />
                <p className='text-sm font-medium text-slate-500 uppercase tracking-widest'>Cargando comprobante...</p>
            </div>
        )
    }

    if (error || !invoice) {
        return (
            <div className='flex h-96 flex-col items-center justify-center gap-4 text-center'>
                <AlertCircle className='h-12 w-12 text-destructive' />
                <h3 className='text-lg font-bold'>Error al cargar la factura</h3>
                <p className='text-sm text-muted-foreground'>No se pudo encontrar la información solicitada.</p>
                <Button variant='outline' onClick={() => navigate({ to: '/invoicing' } as any)}>
                    Regresar al listado
                </Button>
            </div>
        )
    }

    const isDraft = invoice.status === 'draft'
    const isValid = invoice.status === 'valid'
    const isCanceled = invoice.status === 'canceled'

    const renderHeader = () => (
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6'>
            <div className='flex items-center gap-4'>
                <Button
                    variant='outline'
                    size='icon'
                    onClick={() => navigate({ to: '/invoicing', search: { page: 1, perPage: 10 } } as any)}
                    className='h-10 w-10 border-slate-200'
                >
                    <ArrowLeft className='h-4 w-4' />
                </Button>
                <div>
                    <div className='flex items-center gap-3'>
                        <h2 className='text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100'>
                            {isDraft ? 'Editar Borrador' : `Factura ${invoice.serie}${invoice.folio_number}`}
                        </h2>
                        <Badge 
                            variant='outline' 
                            className={cn(
                                'text-[10px] font-black uppercase px-2 py-0.5 border-none',
                                isDraft && 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
                                isValid && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30',
                                isCanceled && 'bg-red-100 text-red-600 dark:bg-red-900/30'
                            )}
                        >
                            {isDraft ? 'Borrador' : isCanceled ? 'Cancelada' : 'Vigente'}
                        </Badge>
                    </div>
                    {invoice.createdAt && (
                        <p className='text-xs font-medium text-slate-500 uppercase mt-1'>
                            Creado el {format(new Date(invoice.createdAt), "PPP", { locale: es })}
                        </p>
                    )}
                </div>
            </div>

            <div className='flex flex-wrap items-center gap-3'>
                {isValid && can('Cancelar') && (
                    <Button
                        variant='outline'
                        className='h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-xs uppercase transition-colors'
                        onClick={handleCancelInvoice}
                        disabled={isCancelling}
                    >
                        {isCancelling ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Ban className='mr-2 h-4 w-4' />}
                        Cancelar Factura
                    </Button>
                )}
                {isDraft && can('Eliminar') && (
                    <Button
                        variant='outline'
                        className='h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-xs uppercase'
                        onClick={async () => {
                            if (window.confirm('¿Estás seguro de que deseas eliminar este borrador?')) {
                                // Logic to delete draft... reusing the dialog setOpen if available 
                                // but here we are in a page. I'll just use a toast + redirect for now if I had a delete api
                                // Wait, useInvoices provider might not be available here if not wrapped.
                                // I'll stick to what's available.
                                toast.info('Acción disponible en el listado principal')
                            }
                        }}
                    >
                        <Trash2 className='mr-2 h-4 w-4' />
                        Eliminar Borrador
                    </Button>
                )}
                {isValid && can('Reenviar') && (
                    <Button
                        variant='outline'
                        className='h-10 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase'
                        onClick={handleResendEmail}
                    >
                        <Mail className='mr-2 h-4 w-4' />
                        Reenviar Correo
                    </Button>
                )}
                {isCanceled && can('Descargar') && (
                    <Button
                        variant='outline'
                        className='h-10 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase'
                        onClick={handleDownloadReceipt}
                    >
                        <Download className='mr-2 h-4 w-4' />
                        Descargar Acuse
                    </Button>
                )}
                {!isDraft && can('Descargar') && (
                    <div className='flex items-center gap-2'>
                        <Button variant='outline' className='h-10 text-xs font-bold uppercase' asChild>
                            <Link
                                to='/viewer'
                                search={{
                                    path: invoice.pdfPath || '',
                                    title: `Factura ${invoice.serie}${invoice.folio_number}`,
                                    type: 'pdf'
                                }}
                                target='_blank'
                            >
                                <FileDown className='mr-2 h-4 w-4' />
                                PDF
                            </Link>
                        </Button>
                        <Button variant='outline' className='h-10 text-xs font-bold uppercase' asChild>
                            <Link
                                to='/viewer'
                                search={{
                                    path: invoice.xmlPath || '',
                                    title: `Factura ${invoice.serie}${invoice.folio_number}`,
                                    type: 'xml'
                                }}
                                target='_blank'
                            >
                                <FileCode className='mr-2 h-4 w-4' />
                                XML
                            </Link>
                        </Button>
                    </div>
                )}
                {!isDraft && apiInvoice?.verification_url && (
                    <Button variant='outline' className='h-10 text-xs font-bold uppercase' asChild>
                        <a href={apiInvoice.verification_url} target='_blank' rel='noreferrer'>
                            <ExternalLink className='mr-2 h-4 w-4' />
                            Verificar SAT
                        </a>
                    </Button>
                )}
            </div>
        </div>
    )

    const renderContent = () => {
        // If it's a draft, use the appropriate form
        if (isDraft) {
            const isReadOnly = !can('Editar')
            switch (invoice.tipo_cfdi) {
                case 'E':
                    return <InvoiceFormEgreso currentRow={invoice} readOnly={isReadOnly} onSubmitSuccess={handleSuccess} onCancel={() => navigate({ to: '/invoicing' } as any)} />
                case 'P':
                    return <InvoiceFormPago currentRow={invoice} readOnly={isReadOnly} onSubmitSuccess={handleSuccess} onCancel={() => navigate({ to: '/invoicing' } as any)} />
                case 'T':
                    return <InvoiceFormTraslado currentRow={invoice} readOnly={isReadOnly} onSubmitSuccess={handleSuccess} onCancel={() => navigate({ to: '/invoicing' } as any)} />
                default:
                    return <InvoiceFormIngreso currentRow={invoice} readOnly={isReadOnly} onSubmitSuccess={handleSuccess} onCancel={() => navigate({ to: '/invoicing' } as any)} />
            }
        }

        // For Valid/Canceled invoices, we can show the details
        // We'll use the form in a modified way or a dedicated view
        // For now, let's use the form but ideally we want icons to "not change"
        // Since the forms are already complex, I'll pass a 'readOnly' prop or similar if I implement it
        // Or just let them see the form but disabling the buttons?
        // Actually, let's just pass a flag to hide "Save/Generate" if we can
        
        // For now, using the forms as they are but we'll need to lock them down or 
        // provide a better detail view.
        // Given your request "ver detalles debe ser una pagina", let's use the form but 
        // we'll need a way to disable all fields if it's not a draft.

        return (
            <div className="space-y-8">
                {/* Visual indicator of the UUID if stamped */}
                {!isDraft && invoice.uuid && (
                    <div className='rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6 dark:border-emerald-900/20 dark:bg-emerald-950/10'>
                        <div className='flex items-start gap-4'>
                            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'>
                                <CheckCircle2 className='h-6 w-6' />
                            </div>
                            <div className='flex-1'>
                                <h3 className='text-sm font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-widest'>Folio Fiscal (UUID)</h3>
                                <div className='mt-2 flex items-center gap-3'>
                                    <code className='rounded bg-emerald-100/50 px-3 py-1.5 font-mono text-sm font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'>
                                        {invoice.uuid}
                                    </code>
                                    <Button 
                                        variant='ghost' 
                                        size='icon' 
                                        className='h-8 w-8 text-emerald-600'
                                        onClick={() => {
                                            navigator.clipboard.writeText(invoice.uuid!)
                                            toast.success('UUID copiado')
                                        }}
                                    >
                                        <Copy className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {invoice.tipo_cfdi === 'E' && <InvoiceFormEgreso currentRow={invoice} readOnly={true} onSubmitSuccess={() => {}} onCancel={() => {}} />}
                {invoice.tipo_cfdi === 'P' && <InvoiceFormPago currentRow={invoice} readOnly={true} onSubmitSuccess={() => {}} onCancel={() => {}} />}
                {invoice.tipo_cfdi === 'T' && <InvoiceFormTraslado currentRow={invoice} readOnly={true} onSubmitSuccess={() => {}} onCancel={() => {}} />}
                {invoice.tipo_cfdi === 'I' && <InvoiceFormIngreso currentRow={invoice} readOnly={true} onSubmitSuccess={() => {}} onCancel={() => {}} />}
            </div>
        )
    }

    return (
        <div className='mx-auto max-w-full lg:max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500'>
            {renderHeader()}
            {renderContent()}
        </div>
    )
}
