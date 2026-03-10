import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { InvoiceTypeSelector, type InvoiceType } from './invoice-type-selector'
import { InvoiceFormIngreso } from './invoice-form-ingreso'
import { InvoiceFormEgreso } from './invoice-form-egreso'
import { InvoiceFormPago } from './invoice-form-pago'
import { InvoiceFormTraslado } from './invoice-form-traslado'
import { useWorkCenterStore } from '@/stores/work-center-store'
import { useQuery } from '@tanstack/react-query'
import { getWorkCenters } from '@/features/work-centers/data/work-centers-api'
import { AlertTriangle, ShieldAlert, FileText, Calendar, Building2, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { Button as UIButton } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function InvoiceCreateView() {
    const navigate = useNavigate()
    const [selectedType, setSelectedType] = useState<InvoiceType>('I')

    const handleSuccess = () => {
        navigate({
            to: '/invoicing',
            search: { page: 1, perPage: 10 }
        } as any)
    }

    const { selectedWorkCenterId } = useWorkCenterStore()
    const { data: workCenters = [], isLoading } = useQuery({
        queryKey: ['work-centers'],
        queryFn: getWorkCenters,
    })

    const activeWorkCenter = workCenters.find(wc => wc._id === selectedWorkCenterId)

    const hasStamps = !!activeWorkCenter?.hasStamps
    const stampsExpired = activeWorkCenter?.fechaVencimiento ? new Date(activeWorkCenter.fechaVencimiento) < new Date() : true
    const hasOpinion = !!activeWorkCenter?.opinionCumplimiento?.url
    const opinionValida = !!activeWorkCenter?.opinionCumplimiento?.valida

    // Freshness check for opinion (180 days - half a year)
    const opinionDate = activeWorkCenter?.opinionCumplimiento?.fecha ? new Date(activeWorkCenter.opinionCumplimiento.fecha) : null
    const isOpinionFresh = opinionDate ? (new Date().getTime() - opinionDate.getTime()) < (180 * 24 * 60 * 60 * 1000) : false

    const isBlocking = !hasStamps || stampsExpired
    const hasWarnings = !hasOpinion || !opinionValida || !isOpinionFresh
    const shouldHideForm = isBlocking || hasWarnings

    if (isLoading) {
        return (
            <div className='flex h-64 items-center justify-center'>
                <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
            </div>
        )
    }

    if (!activeWorkCenter) {
        return (
            <div className='rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-950/20'>
                <Building2 className='mx-auto mb-4 h-12 w-12 text-zinc-400' />
                <h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>No hay Centro de Trabajo seleccionado</h3>
                <p className='mt-2 text-zinc-500'>Por favor, selecciona o crea un centro de trabajo para comenzar a facturar.</p>
                <UIButton
                    className='mt-6'
                    onClick={() => navigate({ to: '/work-centers' } as any)}
                >
                    Ir a Centros de Trabajo
                </UIButton>
            </div>
        )
    }

    return (
        <div className='space-y-8'>
            {/* Compliance Alerts */}
            {shouldHideForm && (
                <div className={cn(
                    'overflow-hidden rounded-xl border shadow-sm transition-all animate-in fade-in slide-in-from-top-4 duration-500',
                    isBlocking
                        ? 'border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/10'
                        : 'border-orange-200 bg-orange-50/50 dark:border-orange-900/30 dark:bg-orange-950/10'
                )}>
                    <div className='flex items-start gap-4 p-4 md:p-6'>
                        <div className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                            isBlocking
                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                                : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                        )}>
                            {isBlocking ? <ShieldAlert className='h-6 w-6' /> : <AlertTriangle className='h-6 w-6' />}
                        </div>
                        <div className='flex-1 space-y-1'>
                            <h3 className={cn(
                                'text-lg font-bold tracking-tight',
                                isBlocking ? 'text-red-900 dark:text-red-400' : 'text-orange-900 dark:text-orange-400'
                            )}>
                                Acción Requerida: {isBlocking ? 'Sellos Digitales' : 'Cumplimiento Fiscal'}
                            </h3>
                            <p className='text-sm text-zinc-600 dark:text-zinc-400'>
                                {isBlocking
                                    ? 'No puedes generar facturas hasta que cargues tus sellos digitales (CSD) vigentes.'
                                    : 'No puedes generar facturas hasta que actualices tu Opinión de Cumplimiento SAT.'
                                }
                            </p>

                            <div className='mt-4 flex flex-wrap gap-4'>
                                {/* CSD Status */}
                                <div className='flex items-center gap-2 rounded-lg bg-white/50 px-3 py-2 text-xs font-medium backdrop-blur-sm dark:bg-black/20'>
                                    <FileText className={cn('h-4 w-4', hasStamps && !stampsExpired ? 'text-green-500' : 'text-red-500')} />
                                    <span className='text-zinc-700 dark:text-zinc-300'>CSD:</span>
                                    <span className={cn(hasStamps && !stampsExpired ? 'text-green-600' : 'text-red-600')}>
                                        {!hasStamps ? 'No cargado' : stampsExpired ? 'Expirado' : 'Vigente'}
                                    </span>
                                    {activeWorkCenter.fechaVencimiento && (
                                        <span className='ml-1 text-[10px] text-zinc-500'>
                                            (Exp: {format(new Date(activeWorkCenter.fechaVencimiento), 'dd/MM/yyyy')})
                                        </span>
                                    )}
                                </div>

                                {/* Opinion Status */}
                                <div className='flex items-center gap-2 rounded-lg bg-white/50 px-3 py-2 text-xs font-medium backdrop-blur-sm dark:bg-black/20'>
                                    <Calendar className={cn('h-4 w-4', (hasOpinion && opinionValida && isOpinionFresh) ? 'text-green-500' : 'text-orange-500')} />
                                    <span className='text-zinc-700 dark:text-zinc-300'>Opinión SAT:</span>
                                    <span className={cn((hasOpinion && opinionValida && isOpinionFresh) ? 'text-green-600' : 'text-orange-600')}>
                                        {!hasOpinion ? 'No cargada' : !opinionValida ? 'Negativa' : !isOpinionFresh ? 'Desactualizada' : 'Válida'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <UIButton
                            variant='outline'
                            size='sm'
                            className='shrink-0 gap-2 border-current hover:bg-current/10'
                            onClick={() => navigate({ to: `/work-centers` } as any)}
                        >
                            Configurar <ExternalLink className='h-3 w-3' />
                        </UIButton>
                    </div>
                </div>
            )}

            {!shouldHideForm ? (
                <>
                    {/* Type Selection Section */}
                    <div className='rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm dark:border-zinc-800 dark:bg-black'>
                        <h3 className='mb-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400/80'>
                            Tipo de Comprobante
                        </h3>
                        <InvoiceTypeSelector
                            selectedType={selectedType}
                            onSelect={(type) => setSelectedType(type)}
                        />
                    </div>

                    {/* Form Section */}
                    <div className='overflow-hidden animate-in fade-in zoom-in-95 duration-500'>
                        {selectedType === 'I' ? (
                            <InvoiceFormIngreso
                                onSubmitSuccess={handleSuccess}
                                onCancel={() => navigate({ to: '/invoicing', search: { page: 1, perPage: 10 } } as any)}
                            />
                        ) : selectedType === 'E' ? (
                            <InvoiceFormEgreso
                                onSubmitSuccess={handleSuccess}
                                onCancel={() => navigate({ to: '/invoicing', search: { page: 1, perPage: 10 } } as any)}
                            />
                        ) : selectedType === 'P' ? (
                            <InvoiceFormPago
                                onSubmitSuccess={handleSuccess}
                                onCancel={() => navigate({ to: '/invoicing', search: { page: 1, perPage: 10 } } as any)}
                            />
                        ) : selectedType === 'T' ? (
                            <InvoiceFormTraslado
                                onSubmitSuccess={handleSuccess}
                                onCancel={() => navigate({ to: '/invoicing', search: { page: 1, perPage: 10 } } as any)}
                            />
                        ) : (
                            <div className='py-20 text-center text-muted-foreground'>
                                El formulario para el tipo {selectedType} está en desarrollo...
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className='flex h-96 flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 text-center dark:border-zinc-900/20 dark:bg-zinc-950/5'>
                    <Building2 className='h-16 w-16 text-zinc-300' />
                    <div className='max-w-md space-y-2'>
                        <h4 className='text-xl font-bold text-zinc-900 dark:text-zinc-100'>Generación Deshabilitada</h4>
                        <p className='text-sm text-zinc-500'>
                            Revisa el panel superior para conocer los requisitos de cumplimiento pendientes antes de continuar.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
