'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ShieldAlert, FileText, ExternalLink, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { solicitarDescarga } from '../data/massive-download-api'
import { useWorkCenterStore } from '@/stores/work-center-store'
import { useEffect } from 'react'


const formSchema = z.object({
    fechaInicio: z.date({
        message: "La fecha inicial es obligatoria.",
    }),
    fechaFin: z.date({
        message: "La fecha final es obligatoria.",
    }),
    tipo: z.enum(['issued', 'received'], {
        message: "Selecciona el tipo de facturas.",
    }),
    serviceType: z.enum(['cfdi', 'retenciones']),
    documentType: z.string().optional(),
    documentStatus: z.enum(['active', 'cancelled', 'all']).optional(),
    complement: z.string().optional(),
    rfcMatch: z.string().optional(),
    rfcOnBehalf: z.string().optional(),
    uuid: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function MassiveDownloadForm() {
    const { selectedWorkCenterId } = useWorkCenterStore()
    const { data: workCenters = [] } = useQuery({
        queryKey: ['work-centers'],
        enabled: !!selectedWorkCenterId,
    })
    const navigate = useNavigate()

    const currentWorkCenter = (workCenters as any[]).find((wc: any) => wc._id === selectedWorkCenterId)
    const hasFiel = !!currentWorkCenter?.hasFiel
    const fielExpired = currentWorkCenter?.fielVencimiento ? new Date(currentWorkCenter.fielVencimiento) < new Date() : false

    const isBlocking = !hasFiel || fielExpired

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tipo: 'issued',
            serviceType: 'cfdi',
            documentType: 'all',
            documentStatus: 'active',
            complement: '',
            uuid: '',
            rfcMatch: '',
            rfcOnBehalf: ''
        }
    })

    const tipoValue = form.watch('tipo')

    useEffect(() => {
        if (tipoValue === 'received') {
            form.setValue('documentStatus', 'active')
        }
    }, [tipoValue, form])

    const { mutate, isPending } = useMutation({
        mutationFn: (values: FormValues) => solicitarDescarga({
            fechaInicio: format(values.fechaInicio, 'yyyy-MM-dd'),
            fechaFin: format(values.fechaFin, 'yyyy-MM-dd'),
            tipo: values.tipo,
            requestType: 'xml',
            serviceType: values.serviceType,
            documentType: values.documentType === 'all' ? 'undefined' : values.documentType,
            documentStatus: values.documentStatus === 'all' ? 'undefined' : values.documentStatus,
            complement: values.complement,
            rfcMatch: values.rfcMatch,
            rfcOnBehalf: values.rfcOnBehalf,
            uuid: values.uuid,
            workCenterId: selectedWorkCenterId!
        }),
        onSuccess: () => {
            toast.success('Solicitud enviada con éxito. El SAT procesará tu descarga.')
            navigate({ to: '/massive-downloads' })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al enviar la solicitud')
        }
    })

    const onSubmit = (values: FormValues) => {
        if (!hasFiel || fielExpired) {
            toast.error('No puedes solicitar descargas sin una FIEL válida.')
            return
        }
        mutate(values)
    }

    return (
        <div className='space-y-8'>
            {/* Compliance Alerts */}
            {isBlocking && (
                <div className={cn(
                    'overflow-hidden rounded-xl border shadow-sm transition-all animate-in fade-in slide-in-from-top-4 duration-500',
                    'border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/10'
                )}>
                    <div className='flex items-start gap-4 p-4 md:p-6'>
                        <div className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                            'bg-red-100 text-red-600 dark:bg-red-900/30'
                        )}>
                            <ShieldAlert className='h-6 w-6' />
                        </div>
                        <div className='flex-1 space-y-1'>
                            <h3 className={cn(
                                'text-lg font-bold tracking-tight text-red-900 dark:text-red-400'
                            )}>
                                Acción Requerida: Firma Electrónica (FIEL)
                            </h3>
                            <p className='text-sm text-zinc-600 dark:text-zinc-400'>
                                No puedes realizar descargas masivas hasta que cargues tu Firma Electrónica (FIEL) vigente.
                            </p>

                            <div className='mt-4 flex flex-wrap gap-4'>
                                {/* FIEL Status */}
                                <div className='flex items-center gap-2 rounded-lg bg-white/50 px-3 py-2 text-xs font-medium backdrop-blur-sm dark:bg-black/20'>
                                    <FileText className={cn('h-4 w-4', hasFiel && !fielExpired ? 'text-green-500' : 'text-red-500')} />
                                    <span className='text-zinc-700 dark:text-zinc-300'>FIEL:</span>
                                    <span className={cn(hasFiel && !fielExpired ? 'text-green-600' : 'text-red-600')}>
                                        {!hasFiel ? 'No cargada' : fielExpired ? 'Expirada' : 'Vigente'}
                                    </span>
                                    {currentWorkCenter?.fielVencimiento && (
                                        <span className='ml-1 text-[10px] text-zinc-500'>
                                            (Exp: {format(new Date(currentWorkCenter.fielVencimiento), 'dd/MM/yyyy')})
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button
                            variant='outline'
                            size='sm'
                            className='shrink-0 gap-2 border-red-200 text-red-900 hover:bg-red-100 dark:border-red-800 dark:text-red-400'
                            onClick={() => navigate({ to: `/work-centers` } as any)}
                        >
                            Configurar <ExternalLink className='h-3 w-3' />
                        </Button>
                    </div>
                </div>
            )}

            {hasFiel && !fielExpired ? (
                <Card className='animate-in fade-in zoom-in-95 duration-500'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-xl font-bold'>
                            Parámetros de Descarga
                        </CardTitle>
                        <CardDescription>
                            Indica el rango de fechas y el tipo de comprobantes que deseas solicitar al SAT.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="fechaInicio"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Fecha Inicio <span className="text-destructive">*</span></FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PP", { locale: es })
                                                                ) : (
                                                                    <span>Selecciona una fecha</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) =>
                                                                date > new Date() || date < new Date("1900-01-01")
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="fechaFin"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Fecha Fin <span className="text-destructive">*</span></FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PP", { locale: es })
                                                                ) : (
                                                                    <span>Selecciona una fecha</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) =>
                                                                date > new Date() || date < new Date("1900-01-01")
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                    <FormField
                                        control={form.control}
                                        name="tipo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-slate-700 dark:text-slate-300">Tipo de Facturas <span className="text-destructive">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10">
                                                            <SelectValue placeholder="Selecciona el tipo" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="issued">Emitidas (Ventas)</SelectItem>
                                                        <SelectItem value="received">Recibidas (Gastos)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="serviceType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-bold text-slate-700 dark:text-slate-300">Servicio SAT <span className="text-destructive">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="whitespace-normal text-left h-auto min-h-[2.5rem] py-1 shadow-sm">
                                                            <SelectValue placeholder="Servicio" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="cfdi">CFDI Regulares (Ingresos, Pagos, etc.)</SelectItem>
                                                        <SelectItem value="retenciones">CFDI Retenciones e Informes</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-6 pt-8 border-t border-dashed mt-8">
                                    <div className="flex items-center justify-between px-1">
                                        <h4 className="text-xs  flex items-center gap-2 uppercase ">
                                            Filtros Avanzados (Opcional)
                                        </h4>
                                    </div>

                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                            <FormField
                                                control={form.control}
                                                name="documentType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs uppercase tracking-wider text-slate-400 font-bold">Tipo Comprobante</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-9 text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="all">Cualquiera</SelectItem>
                                                                <SelectItem value="ingreso">Ingresos</SelectItem>
                                                                <SelectItem value="egreso">Egresos</SelectItem>
                                                                <SelectItem value="traslado">Traslados</SelectItem>
                                                                <SelectItem value="pago">Complementos de Pago</SelectItem>
                                                                <SelectItem value="nomina">Nómina</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="documentStatus"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs uppercase tracking-wider text-slate-400 font-bold">Estado del CFDI</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-9 text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="active">Solo Vigentes</SelectItem>
                                                                {tipoValue === 'issued' && (
                                                                    <>
                                                                        <SelectItem value="cancelled">Solo Cancelados</SelectItem>
                                                                        <SelectItem value="all">Todos (Vigentes y Cancelados)</SelectItem>
                                                                    </>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        {tipoValue === 'received' && (
                                                            <FormDescription className="text-[10px] text-orange-500">
                                                                Para facturas recibidas, el SAT solo permite descargar vigentes.
                                                            </FormDescription>
                                                        )}
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="uuid"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs uppercase tracking-wider text-slate-400 font-bold">Folio Fiscal (UUID)</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="32 caracteres..." className="h-9 text-[11px]" />
                                                        </FormControl>
                                                        <FormDescription className="text-[10px]">Folio fiscal específico.</FormDescription>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="rfcMatch"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs uppercase tracking-wider text-slate-400 font-bold">RFC Contraparte</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="RFC del emisor o receptor..." className="h-9 text-[11px]" />
                                                        </FormControl>
                                                        <FormDescription className="text-[10px]">RFC de la otra parte.</FormDescription>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="complement"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs uppercase tracking-wider text-slate-400 font-bold">Complemento</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                value={field.value || ''}
                                                                placeholder="Ej: leyendasFiscales10"
                                                                className="h-9 text-[11px]"
                                                            />
                                                        </FormControl>
                                                        <FormDescription className="text-[10px]">Ej: pago20, nomina12.</FormDescription>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="rfcOnBehalf"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs uppercase tracking-wider text-slate-400 font-bold">RFC Terceros</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="RFC a cuenta de terceros..." className="h-9 text-[11px]" />
                                                        </FormControl>
                                                        <FormDescription className="text-[10px]">RFC emisor a cuenta de terceros.</FormDescription>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t'>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full sm:w-auto"
                                        onClick={() => navigate({ to: '/massive-downloads' })}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
                                        {isPending ? 'Enviando solicitud...' : 'Solicitar Descarga al SAT'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            ) : (
                <div className='flex h-96 flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 text-center dark:border-zinc-900/20 dark:bg-zinc-950/5'>
                    <ShieldAlert className='h-16 w-16 text-zinc-300' />
                    <div className='max-w-md space-y-2 px-4'>
                        <h4 className='text-xl font-bold text-zinc-900 dark:text-zinc-100'>Solicitud Deshabilitada</h4>
                        <p className='text-sm text-zinc-500'>
                            Revisa el panel superior para conocer los requisitos de cumplimiento pendientes antes de continuar.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
