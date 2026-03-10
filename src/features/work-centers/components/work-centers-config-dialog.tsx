'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    Palette,
    FileText,
    CheckCircle2,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
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
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useWorkCenters } from './work-centers-provider'
import { updateCustomization } from '../data/work-centers-api'

const configSchema = z.object({
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color hexadecimal inválido').or(z.literal('')),
    codes: z.boolean(),
    product_key: z.boolean(),
    round_unit_price: z.boolean(),
    tax_breakdown: z.boolean(),
    ieps_breakdown: z.boolean(),
    render_carta_porte: z.boolean(),
})

type ConfigFormValues = z.infer<typeof configSchema>

function InvoicePreview({ color }: { color: string }) {
    return (
        <div className='border rounded-lg bg-[#f8f8f8] dark:bg-zinc-950/50 overflow-hidden shadow-sm h-full flex flex-col min-h-[400px] select-none'>
            <div className='p-4 bg-white dark:bg-zinc-900 space-y-4 flex-1 shadow-inner'>
                {/* Header: Logo and Folio Box */}
                <div className='flex justify-between items-start'>
                    <div className='flex items-center gap-1.5'>
                        <div className='flex flex-col gap-1'>
                            <div className='h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-sm' />
                            <div className='h-1.5 w-8 bg-zinc-100 dark:bg-zinc-800/50 rounded-sm' />
                        </div>
                    </div>
                    <div className='flex flex-col items-center gap-1'>
                        <div className='h-1 w-6 bg-zinc-200 dark:bg-zinc-800 rounded' />
                        <div
                            className='w-12 h-6 rounded-sm border-2 transition-all bg-zinc-50 dark:bg-zinc-800'
                            style={{ borderColor: color }}
                        />
                    </div>
                </div>

                {/* Main Title Line */}
                <div className='h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-sm mt-2' />

                {/* Emisor / Metadata Section */}
                <div className='grid grid-cols-2 gap-x-10 pb-3 border-b-2 transition-colors' style={{ borderBottomColor: color }}>
                    <div className='space-y-1.5'>
                        <div className='h-1.5 w-6 bg-zinc-300 dark:bg-zinc-700 rounded-sm' />
                        <div className='h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-sm' />
                        <div className='h-1.5 w-3/4 bg-zinc-100 dark:bg-zinc-800/50 rounded-sm' />
                        <div className='h-1.5 w-1/2 bg-zinc-100 dark:bg-zinc-800/50 rounded-sm' />
                    </div>
                    <div className='space-y-1.5'>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className='flex justify-end gap-2'>
                                <div className='h-1.5 w-10 bg-zinc-100 dark:bg-zinc-800/50 rounded-sm' />
                                <div className='h-1.5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-sm' />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Receptor Section (Boxed) */}
                <div
                    className='p-3 rounded-lg border-2 space-y-2'
                    style={{ borderColor: `${color}40`, backgroundColor: `${color}05` }}
                >
                    <div className='h-1.5 w-8 bg-zinc-300 dark:bg-zinc-700 rounded-sm' />
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-1.5'>
                            <div className='h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-sm' />
                            <div className='h-1.5 w-2/3 bg-zinc-100 dark:bg-zinc-800/50 rounded-sm' />
                        </div>
                        <div className='space-y-1.5'>
                            <div className='h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-sm' />
                            <div className='h-1.5 w-2/3 bg-zinc-100 dark:bg-zinc-800/50 rounded-sm' />
                        </div>
                    </div>
                </div>

                {/* Concept Table Header */}
                <div className='pt-2 border-t-2 space-y-3' style={{ borderTopColor: color }}>
                    <div className='flex justify-between px-1'>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className='h-1.5 w-8 bg-zinc-200 dark:bg-zinc-800 rounded-sm' />
                        ))}
                    </div>
                    {/* Only One Concept Row Skeleton */}
                    <div className='flex justify-between items-start px-1 pb-2'>
                        <div className='space-y-1 flex-1'>
                            <div className='h-2 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-sm' />
                            <div className='h-1.5 w-20 bg-zinc-100 dark:bg-zinc-800/50 rounded-sm ml-2' />
                        </div>
                        <div className='flex gap-4'>
                            <div className='h-2 w-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-sm' />
                            <div className='h-2 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-sm' />
                        </div>
                    </div>
                </div>

                {/* Summary Section */}
                <div className='flex justify-end pt-2'>
                    <div className='w-1/3 space-y-2'>
                        <div className='flex justify-between'>
                            <div className='h-1.5 w-10 bg-zinc-100 dark:bg-zinc-800/50 rounded-sm' />
                            <div className='h-1.5 w-6 bg-zinc-200 dark:bg-zinc-800 rounded-sm' />
                        </div>
                        <div className='flex justify-between'>
                            <div className='h-1.5 w-10 bg-zinc-100 dark:bg-zinc-800/50 rounded-sm' />
                            <div className='h-1.5 w-6 bg-zinc-200 dark:bg-zinc-800 rounded-sm' />
                        </div>
                    </div>
                </div>
            </div>
            <div className='bg-zinc-50 dark:bg-zinc-950 p-2 text-[6px] text-center text-zinc-400 font-bold uppercase tracking-[0.2em]'>
                Estructura de Factura
            </div>
        </div>
    )
}

const PRESET_COLORS = [
    { name: 'Haz Factura', value: '#F97316' },
    { name: 'Azul', value: '#2563EB' },
    { name: 'Verde', value: '#16A34A' },
    { name: 'Rojo', value: '#DC2626' },
    { name: 'Indigo', value: '#4F46E5' },
    { name: 'Negro', value: '#000000' },
]

export function WorkCentersConfigDialog() {
    const { open, setOpen, currentRow, setCurrentRow } = useWorkCenters()
    const queryClient = useQueryClient()

    const form = useForm<ConfigFormValues>({
        resolver: zodResolver(configSchema),
        defaultValues: {
            color: '#F97316',
            codes: true,
            product_key: true,
            round_unit_price: false,
            tax_breakdown: true,
            ieps_breakdown: true,
            render_carta_porte: false,
        },
    })

    const selectedColor = form.watch('color')

    useEffect(() => {
        if (currentRow?.customization) {
            const cust = currentRow.customization
            const pdf = cust.pdf_extra
            form.reset({
                color: cust.color || '#F97316',
                codes: pdf.codes ?? true,
                product_key: pdf.product_key ?? true,
                round_unit_price: pdf.round_unit_price ?? false,
                tax_breakdown: pdf.tax_breakdown ?? true,
                ieps_breakdown: pdf.ieps_breakdown ?? true,
                render_carta_porte: pdf.render_carta_porte ?? false,
            })
        }
    }, [currentRow, form])

    const { mutate: updateMutate, isPending } = useMutation({
        mutationFn: (values: ConfigFormValues) => {
            return updateCustomization({
                workCenterId: currentRow?._id,
                ...values,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-centers'] })
            toast.success('Configuración actualizada correctamente')
            handleOpenChange(false)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al actualizar la configuración')
        }
    })

    const handleOpenChange = (state: boolean) => {
        if (!state) {
            setOpen(null)
            setTimeout(() => {
                setCurrentRow(null)
                form.reset()
            }, 500)
        }
    }

    const onSubmit = (data: ConfigFormValues) => {
        updateMutate(data)
    }

    const isOpen = open === 'edit-config'

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className='sm:max-w-3xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Personalización del Centro de Trabajo</DialogTitle>
                    <DialogDescription>
                        Configura la identidad visual y las opciones del PDF para <span className='font-bold text-zinc-900 dark:text-zinc-100'>{currentRow?.workcenterName}</span>.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        {/* Branding Section */}
                        <div className='space-y-4'>
                            <div className='flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider'>
                                <Palette className='h-4 w-4' /> Identidad Visual
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                {/* Left: Selection */}
                                <div className='space-y-6'>
                                    <FormField
                                        control={form.control}
                                        name='color'
                                        render={({ field }) => (
                                            <FormItem className='space-y-4'>
                                                <div className='space-y-1.5'>
                                                    <FormLabel>Color de Marca</FormLabel>
                                                    <FormDescription className='text-xs'>
                                                        Selecciona el color distintivo de tu organización.
                                                    </FormDescription>
                                                </div>

                                                <div className='flex flex-wrap gap-2.5'>
                                                    {PRESET_COLORS.map((preset) => (
                                                        <button
                                                            key={preset.value}
                                                            type='button'
                                                            className={`size-8 rounded-full border-2 transition-all hover:scale-110 active:scale-95 ${field.value === preset.value
                                                                ? 'border-zinc-900 ring-2 ring-zinc-100 dark:border-white dark:ring-zinc-800 scale-110'
                                                                : 'border-white dark:border-zinc-900 shadow-sm'
                                                                }`}
                                                            style={{ backgroundColor: preset.value }}
                                                            onClick={() => field.onChange(preset.value)}
                                                            title={preset.name}
                                                        />
                                                    ))}
                                                    <div className='relative size-8 group'>
                                                        <input
                                                            type="color"
                                                            value={field.value || '#F97316'}
                                                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                            className='absolute inset-0 size-full opacity-0 cursor-pointer z-10'
                                                        />
                                                        <div className='size-full rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800 transition-colors'>
                                                            <div className='size-4 rounded-full border' style={{ backgroundColor: field.value }} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <FormControl>
                                                    <div className='flex items-center gap-2 max-w-[160px]'>
                                                        <div className='size-10 rounded-lg border shadow-sm' style={{ backgroundColor: field.value }} />
                                                        <Input
                                                            {...field}
                                                            placeholder='#F97316'
                                                            className='font-mono uppercase h-10 text-center tracking-wider'
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Right: Preview */}
                                <InvoicePreview color={selectedColor} />
                            </div>
                        </div>

                        <Separator />

                        {/* PDF Options Section */}
                        <div className='space-y-4 pt-2'>
                            <div className='flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider'>
                                <FileText className='h-4 w-4' /> Configuración de PDF
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
                                <FormField
                                    control={form.control}
                                    name='codes'
                                    render={({ field }) => (
                                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors'>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className='space-y-1 leading-none'>
                                                <FormLabel className='cursor-pointer'>Mostrar Códigos SAT</FormLabel>
                                                <FormDescription className='text-[10px]'>Incluye códigos de catálogos junto a descripciones.</FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='product_key'
                                    render={({ field }) => (
                                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors'>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className='space-y-1 leading-none'>
                                                <FormLabel className='cursor-pointer'>Clave de Producto/Servicio</FormLabel>
                                                <FormDescription className='text-[10px]'>Muestra la clave SAT de cada concepto.</FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='round_unit_price'
                                    render={({ field }) => (
                                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors'>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className='space-y-1 leading-none'>
                                                <FormLabel className='cursor-pointer'>Redondear Precio Unitario</FormLabel>
                                                <FormDescription className='text-[10px]'>Redondea a 2 decimales en PDF (mantiene 6 en XML).</FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='tax_breakdown'
                                    render={({ field }) => (
                                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors'>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className='space-y-1 leading-none'>
                                                <FormLabel className='cursor-pointer'>Desglose de Impuestos</FormLabel>
                                                <FormDescription className='text-[10px]'>Muestra impuestos por cada concepto individual.</FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='ieps_breakdown'
                                    render={({ field }) => (
                                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors'>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className='space-y-1 leading-none'>
                                                <FormLabel className='cursor-pointer'>Mostrar IEPS</FormLabel>
                                                <FormDescription className='text-[10px]'>Desglosa el IEPS en lugar de sumarlo al total.</FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='render_carta_porte'
                                    render={({ field }) => (
                                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors'>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className='space-y-1 leading-none'>
                                                <FormLabel className='cursor-pointer'>Renderizar Carta Porte</FormLabel>
                                                <FormDescription className='text-[10px]'>Muestra el complemento Carta Porte 3.1 en el PDF.</FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter className='pt-4'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => handleOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancelar
                            </Button>
                            <Button type='submit' disabled={isPending}>
                                {isPending ? 'Guardando...' : (
                                    <>
                                        <CheckCircle2 className='mr-2 h-4 w-4' />
                                        Guardar Cambios
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
