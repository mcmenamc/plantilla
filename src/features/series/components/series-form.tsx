import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { invoiceSeriesSchema, type InvoiceSeries } from '../data/schema'
import { Loader2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWorkCenterStore } from '@/stores/work-center-store'
import { useEffect } from 'react'

interface SeriesFormProps {
    initialData?: Partial<InvoiceSeries>
    onSubmit: (data: InvoiceSeries) => void
    disabled?: boolean
}

export function SeriesForm({ initialData, onSubmit, disabled }: SeriesFormProps) {
    const navigate = useNavigate()
    const { selectedWorkCenterId } = useWorkCenterStore()
    const isEdit = !!initialData?._id

    const form = useForm<InvoiceSeries>({
        resolver: zodResolver(invoiceSeriesSchema) as any,
        defaultValues: {
            workCenter: initialData?.workCenter || selectedWorkCenterId || '',
            enabled: initialData?.enabled ?? true,
            isPerType: initialData?.isPerType ?? false,
            globalConfig: initialData?.globalConfig || { prefix: 'F', next_folio: 1 },
            typeConfigs: initialData?.typeConfigs || {
                I: { prefix: 'F', next_folio: 1 },
                E: { prefix: 'NC', next_folio: 1 },
                P: { prefix: 'CP', next_folio: 1 },
                N: { prefix: 'NOM', next_folio: 1 },
                T: { prefix: 'T', next_folio: 1 },
            },
            status: initialData?.status || 'active'
        }
    })

    const isPerType = form.watch('isPerType')
    const isEnabled = form.watch('enabled')

    // Sync workCenter with store if creating new
    useEffect(() => {
        if (!initialData?._id && selectedWorkCenterId) {
            form.setValue('workCenter', selectedWorkCenterId)
        }
    }, [selectedWorkCenterId, initialData, form])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <Card className='shadow-sm border-muted-foreground/10'>
                    <CardHeader>
                        <CardTitle className='text-xl'>
                            {isEdit ? 'Editar Configuración' : 'Nueva Configuración'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        <div className='grid gap-6'>
                            <div className='flex items-center justify-between rounded-xl border p-4 shadow-sm bg-muted/5'>
                                <div className='space-y-0.5'>
                                    <FormLabel className='text-base font-semibold'>Habilitar Series</FormLabel>
                                    <FormDescription>Activa o desactiva el uso de series.</FormDescription>
                                </div>
                                <FormField
                                    control={form.control}
                                    name='enabled'
                                    render={({ field }) => (
                                        <FormControl>
                                            <Switch
                                                disabled={disabled}
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    )}
                                />
                            </div>

                            {isEnabled && (
                                <div className='flex items-center justify-between rounded-xl border p-4 shadow-sm bg-muted/5'>
                                    <div className='space-y-0.5'>
                                        <FormLabel className='text-base font-semibold'>Configuración por Tipo</FormLabel>
                                        <FormDescription>Diferentes prefijos según el tipo de CFDI.</FormDescription>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name='isPerType'
                                        render={({ field }) => (
                                            <FormControl>
                                                <Switch
                                                    disabled={disabled}
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        )}
                                    />
                                </div>
                            )}

                            {isEnabled && !isPerType && (
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 rounded-xl bg-muted/20 p-6 border border-dashed'>
                                    <FormField
                                        control={form.control}
                                        name='globalConfig.prefix'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='font-bold uppercase text-xs text-muted-foreground'>Prefijo Global</FormLabel>
                                                <FormControl>
                                                    <Input {...field} disabled={disabled} className='uppercase h-11' placeholder='EJ. F' />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='globalConfig.next_folio'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='font-bold uppercase text-xs text-muted-foreground'>Siguiente Folio</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type='number'
                                                        disabled={disabled}
                                                        {...field}
                                                        onChange={e => field.onChange(Number(e.target.value))}
                                                        className='h-11'
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {isEnabled && isPerType && (
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    {[
                                        { id: 'I', label: 'Ingreso' },
                                        { id: 'E', label: 'Egreso' },
                                        { id: 'P', label: 'Pago' },
                                        { id: 'T', label: 'Traslado' },
                                    ].map((type) => (
                                        <div key={type.id} className='flex flex-col gap-4 p-5 border rounded-2xl bg-card shadow-sm transition-all hover:shadow-md'>
                                            <span className='text-lg font-bold border-b border-muted pb-2'>{type.label}</span>
                                            <div className='grid grid-cols-2 gap-4'>
                                                <FormField
                                                    control={form.control}
                                                    name={`typeConfigs.${type.id}.prefix` as any}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-[10px] uppercase font-bold text-muted-foreground/70'>Prefijo</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} disabled={disabled} className='uppercase h-10' />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`typeConfigs.${type.id}.next_folio` as any}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-[10px] uppercase font-bold text-muted-foreground/70'>Sig. Folio</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type='number'
                                                                    disabled={disabled}
                                                                    {...field}
                                                                    onChange={e => field.onChange(Number(e.target.value))}
                                                                    className='h-10'
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className='flex justify-end gap-3'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => navigate({ to: '/series', search: { page: 1, perPage: 10 } as any })}
                        disabled={disabled}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type='submit'
                        disabled={disabled}
                    >
                        {disabled ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                {isEdit ? 'Guardando...' : 'Registrando...'}
                            </>
                        ) : (
                            isEdit ? 'Guardar Cambios' : 'Registrar Serie'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
