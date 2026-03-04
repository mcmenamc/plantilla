'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useWorkCenterStore } from '@/stores/work-center-store'
import { createProducto, getProductoById, updateProducto, searchSatProducts, searchSatUnits } from '../data/products-api'
import { TAXABILITY_CATALOG } from '@/features/invoicing/data/invoicing-api'
import { createProductSchema, type CreateProductPayload, type Product } from '../data/schema'
import { Loader2, Trash2, Eye } from 'lucide-react'
import { RemoteCombobox } from '@/components/remote-combobox'
import { useFieldArray } from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { ComboboxDropdown } from '@/components/combobox-dropdown'
import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface ProductsFormProps {
    productId?: string
    initialData?: Product
    onSuccess?: (data: Product) => void
    onCancel?: () => void
}

export function ProductsForm({ productId, initialData, onSuccess, onCancel }: ProductsFormProps) {
    const isEdit = !!productId

    const { data: fetchedProduct, isLoading: isLoadingProduct } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => getProductoById(productId!),
        enabled: isEdit && !initialData,
    })

    const product = initialData || fetchedProduct

    if (isEdit && isLoadingProduct) {
        return (
            <div className='flex h-64 items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        )
    }

    if (isEdit && !product) {
        return null
    }

    return <ProductsFormInner product={product} onSuccess={onSuccess} onCancel={onCancel} />
}

interface ProductsFormInnerProps {
    product?: Product
    onSuccess?: (data: Product) => void
    onCancel?: () => void
}

function ProductsFormInner({ product, onSuccess, onCancel }: ProductsFormInnerProps) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { selectedWorkCenterId } = useWorkCenterStore()
    const isEdit = !!product

    const [taxModalOpen, setTaxModalOpen] = useState(false)
    const [editingTaxIndex, setEditingTaxIndex] = useState<number | null>(null)
    const [isLocalTax, setIsLocalTax] = useState(false)

    const [taxData, setTaxData] = useState<{
        type: string,
        rate: number,
        base: number,
        isLocal: boolean,
        withholding: boolean,
        factor: 'Tasa' | 'Cuota' | 'Exento',
    }>({
        type: 'IVA',
        rate: 16,
        base: 0,
        isLocal: false,
        withholding: false,
        factor: 'Tasa',
    })

    const defaultValues: CreateProductPayload = {
        descripcion: product?.description || '',
        product_key: product?.product_key || '',
        product_key_nombre: product?.product_key_nombre || '',
        precio: product?.price || 0,
        tax_included: product?.tax_included ?? true,
        taxability: product?.taxability || (isEdit ? '01' : '02'),
        taxes: product
            ? (product.taxes?.map(t => ({
                type: (t.type as 'IVA' | 'ISR' | 'IEPS') || 'IVA',
                rate: t.rate > 1 ? t.rate : t.rate * 100,
                withholding: !!(t.withholding ?? (t as any).is_retention ?? false),
                base: product.price || 0,
                factor: (t.factor as 'Tasa' | 'Cuota' | 'Exento') || 'Tasa'
            })) || [])
            : [],
        local_taxes: product?.local_taxes?.map(t => ({
            type: String(t.type || (t as any).name || ''),
            rate: t.rate > 1 ? t.rate : t.rate * 100,
            withholding: !!(t.withholding ?? (t as any).is_retention ?? false),
            base: product.price || 0
        })) || [],
        unit_key: product?.unit_key || 'H87',
        unit_name: product?.unit_name || 'Pieza',
        sku: product?.sku || '',
        workCenterId: product?.workCenter || selectedWorkCenterId || '',
    }

    const form = useForm<CreateProductPayload>({
        resolver: zodResolver(createProductSchema) as any,
        defaultValues: defaultValues,
    })

    const { fields: taxFields, append: appendTax, remove: removeTax, update: updateTax } = useFieldArray({
        control: form.control as any,
        name: 'taxes',
    })

    const { fields: localTaxFields, append: appendLocalTax, remove: removeLocalTax, update: updateLocalTax } = useFieldArray({
        control: form.control as any,
        name: 'local_taxes',
    })

    const precio = form.watch('precio')

    const openTaxModal = (index?: number, isLocal: boolean = false) => {
        setIsLocalTax(isLocal)
        setEditingTaxIndex(index !== undefined ? index : null)

        if (index !== undefined) {
            const tax = (isLocal ? localTaxFields[index] : taxFields[index]) as any
            setTaxData({
                type: tax.type,
                rate: tax.rate,
                base: tax.base || precio,
                isLocal: isLocal,
                withholding: !!tax.withholding,
                factor: (tax as any).factor || 'Tasa',
            })
        } else {
            setTaxData({
                type: isLocal ? '' : 'IVA',
                rate: isLocal ? 0 : 16,
                base: precio,
                isLocal: isLocal,
                withholding: false,
                factor: 'Tasa',
            })
        }
        setTaxModalOpen(true)
    }

    const handleSaveTax = () => {
        const newTax = { ...taxData }
        if (editingTaxIndex !== null) {
            if (isLocalTax) {
                updateLocalTax(editingTaxIndex, newTax as any)
            } else {
                updateTax(editingTaxIndex, newTax as any)
            }
        } else {
            if (isLocalTax) {
                appendLocalTax(newTax as any)
            } else {
                appendTax(newTax as any)
            }
        }
        setTaxModalOpen(false)
    }

    // Sync tax base with price
    useEffect(() => {
        taxFields.forEach((t: any, i) => {
            if (t.base !== precio) updateTax(i, { ...t, base: precio })
        })
        localTaxFields.forEach((t: any, i) => {
            if (t.base !== precio) updateLocalTax(i, { ...t, base: precio })
        })
    }, [precio])

    const { mutate: createMutate, isPending: isCreating } = useMutation({
        mutationFn: createProducto,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products', selectedWorkCenterId] })
            toast.success('Producto registrado correctamente')
            if (onSuccess) onSuccess(data)
            else navigate({ to: '/products', search: { page: 1, perPage: 10 } as any })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al registrar el producto')
        },
    })

    const { mutate: updateMutate, isPending: isUpdating } = useMutation({
        mutationFn: (data: CreateProductPayload) => updateProducto(product!._id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', selectedWorkCenterId] })
            queryClient.invalidateQueries({ queryKey: ['product', product?._id] })
            toast.success('Producto actualizado correctamente')
            navigate({ to: '/products', search: { page: 1, perPage: 10 } as any })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al actualizar el producto')
        },
    })

    const isPending = isCreating || isUpdating

    const onSubmit = (data: CreateProductPayload) => {
        // Normalize rates before sending
        const payload = {
            ...data,
            taxes: data.taxes?.map(t => ({ ...t, rate: t.rate > 1 ? t.rate / 100 : t.rate })),
            local_taxes: data.local_taxes?.map(t => ({ ...t, rate: t.rate > 1 ? t.rate / 100 : t.rate }))
        }
        if (isEdit) updateMutate(payload as any)
        else createMutate(payload as any)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className='space-y-8'>
                <div className='bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden'>
                    <div className='pb-4 px-4 md:px-6 pt-6 border-b border-slate-100 dark:border-zinc-900'>
                        <div className='flex items-center gap-2 text-slate-700 dark:text-zinc-300'>
                            <h3 className='text-sm font-bold uppercase tracking-wide'>{isEdit ? 'Editar Producto' : 'Registro de Producto'}</h3>
                        </div>
                    </div>
                    <div className='space-y-6 px-4 md:px-6 py-6'>
                        <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
                            <div className='md:col-span-8'>
                                <FormField
                                    control={form.control as any}
                                    name='descripcion'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-bold text-slate-500 uppercase'>Descripción *</FormLabel>
                                            <Input placeholder='Descripción del producto o servicio' {...field} className='border-slate-200 focus:ring-orange-500' />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='md:col-span-4'>
                                <FormField
                                    control={form.control as any}
                                    name='sku'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-bold text-slate-500 uppercase'>SKU</FormLabel>
                                            <Input placeholder='Código interno' {...field} className='border-slate-200 focus:ring-orange-500 font-mono' />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
                            <div className='md:col-span-6'>
                                <FormField
                                    control={form.control as any}
                                    name='product_key'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-bold text-slate-500 uppercase'>Clave SAT *</FormLabel>
                                            <RemoteCombobox
                                                value={field.value}
                                                onValueChange={(val, label) => {
                                                    field.onChange(val)
                                                    form.setValue('product_key_nombre', label)
                                                }}
                                                fetchFn={searchSatProducts}
                                                placeholder='Buscar clave...'
                                                initialLabel={form.getValues('product_key_nombre')}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='md:col-span-6'>
                                <FormField
                                    control={form.control as any}
                                    name='unit_key'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-bold text-slate-500 uppercase'>Clave de Unidad *</FormLabel>
                                            <RemoteCombobox
                                                value={field.value}
                                                onValueChange={(val, label) => {
                                                    field.onChange(val)
                                                    form.setValue('unit_name', label)
                                                }}
                                                fetchFn={searchSatUnits}
                                                placeholder='Buscar unidad...'
                                                initialLabel={form.getValues('unit_name')}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
                            <div className='md:col-span-4'>
                                <FormField
                                    control={form.control as any}
                                    name='precio'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-bold text-slate-500 uppercase'>Precio Unitario *</FormLabel>
                                            <div className='relative'>
                                                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>$</span>
                                                <Input type='number' step='0.01' placeholder='0.00' {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} className='pl-7 border-slate-200 focus:ring-orange-500 font-bold' />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='md:col-span-8'>
                                <FormField
                                    control={form.control as any}
                                    name='taxability'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-bold text-slate-500 uppercase'>Objeto de Impuesto *</FormLabel>
                                            <select
                                                className='flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm focus:ring-orange-500'
                                                {...field}
                                            >
                                                {TAXABILITY_CATALOG.map((o) => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Impuestos */}
                <div className='bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden'>
                    <div className='bg-slate-50/50 dark:bg-zinc-900/30 px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-900'>
                        <div className='flex items-center gap-2 text-slate-700 dark:text-zinc-300'>
                            <h3 className='text-sm font-bold uppercase tracking-wide'>Configuración de Impuestos</h3>
                        </div>
                        <FormField
                            control={form.control as any}
                            name='tax_included'
                            render={({ field }) => (
                                <div className='flex items-center space-x-2'>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    <Label className='text-xs font-medium text-slate-500 uppercase cursor-pointer'>Impuestos incluidos en precio</Label>
                                </div>
                            )}
                        />
                    </div>
                    <div className='p-6'>
                        <div className='rounded-lg border border-slate-100 dark:border-zinc-800 overflow-hidden'>
                            <table className='w-full text-left text-sm'>
                                <thead className='bg-slate-50 dark:bg-zinc-900/50 text-[10px] font-black text-slate-400 uppercase'>
                                    <tr>
                                        <th className='px-4 py-3'>Tipo</th>
                                        <th className='px-4 py-3'>Impuesto</th>
                                        <th className='px-4 py-3 text-center'>Tasa</th>
                                        <th className='px-4 py-3'>Categoría</th>
                                        <th className='px-4 py-3 text-right'>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-slate-100 dark:divide-zinc-900'>
                                    {taxFields.map((tax: any, i) => (
                                        <tr key={tax.id} className='group hover:bg-slate-50/50 dark:hover:bg-zinc-900/40 transition-colors uppercase'>
                                            <td className='px-4 py-3'><span className='text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-black'>Federal</span></td>
                                            <td className='px-4 py-3 font-bold text-slate-700'>{tax.type}</td>
                                            <td className='px-4 py-3 text-center font-bold'>{tax.rate}%</td>
                                            <td className='px-4 py-3 text-[10px] font-black'>
                                                {tax.withholding ? <span className='text-rose-500'>Retención</span> : <span className='text-emerald-500'>Traslado</span>}
                                            </td>
                                            <td className='px-4 py-3 text-right'>
                                                <div className='flex justify-end gap-2 transition-all'>
                                                    <button type='button' onClick={() => openTaxModal(i, false)} className='text-blue-500 hover:scale-110'><Eye size={14} /></button>
                                                    <button type='button' onClick={() => removeTax(i)} className='text-rose-500 hover:scale-110'><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {localTaxFields.map((tax: any, i) => (
                                        <tr key={tax.id} className='group hover:bg-slate-50/50 dark:hover:bg-zinc-900/40 transition-colors uppercase'>
                                            <td className='px-4 py-3'><span className='text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black'>Local</span></td>
                                            <td className='px-4 py-3 font-bold text-slate-700'>{tax.type}</td>
                                            <td className='px-4 py-3 text-center font-bold'>{tax.rate}%</td>
                                            <td className='px-4 py-3 text-[10px] font-black'>
                                                {tax.withholding ? <span className='text-rose-500'>Retención</span> : <span className='text-emerald-500'>Traslado</span>}
                                            </td>
                                            <td className='px-4 py-3 text-right'>
                                                <div className='flex justify-end gap-2 transition-all'>
                                                    <button type='button' onClick={() => openTaxModal(i, true)} className='text-blue-500 hover:scale-110'><Eye size={14} /></button>
                                                    <button type='button' onClick={() => removeLocalTax(i)} className='text-rose-500 hover:scale-110'><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {taxFields.length === 0 && localTaxFields.length === 0 && (
                                        <tr><td colSpan={5} className='px-4 py-8 text-center text-slate-400 italic font-medium'>No hay impuestos configurados</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className='mt-6'>
                            <Button type='button' variant='outline' size='sm' className='border-orange-200 text-orange-600 h-8 text-[11px] font-black uppercase' onClick={() => openTaxModal(undefined, false)}>
                                + Agregar Impuesto
                            </Button>
                        </div>

                        <Separator className='my-6' />

                        <div className='flex flex-wrap gap-4 bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800 rounded-lg px-6 py-4'>
                            {(() => {
                                const p = form.watch('precio') || 0
                                const inc = form.watch('tax_included')
                                const txs = form.watch('taxes') || []
                                const ltxs = form.watch('local_taxes') || []
                                const rFactor = [...txs, ...ltxs].reduce((a, t) => a + ((t.rate / 100) * (t.withholding ? -1 : 1)), 0)
                                const sub = inc ? p / (1 + rFactor) : p
                                const txT = sub * rFactor
                                return (
                                    <>
                                        <div className='flex flex-col'><span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Subtotal</span><span className='text-sm font-black text-slate-700'>{(sub || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></div>
                                        <div className='flex flex-col'><span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Impuestos</span><span className='text-sm font-black text-emerald-600'>{(txT || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></div>
                                        <div className='flex flex-col ml-auto text-right'><span className='text-[10px] font-black text-orange-600 uppercase tracking-widest'>Precio Final</span><span className='text-xl font-black text-orange-600'>{(sub + txT).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span></div>
                                    </>
                                )
                            })()}
                        </div>
                    </div>
                </div>

                <div className='flex justify-end gap-3 pt-4'>
                    <Button type='button' variant='ghost' className='font-bold uppercase text-xs tracking-widest' onClick={() => onCancel ? onCancel() : navigate({ to: '/products' } as any)}>Cancelar</Button>
                    <Button type='submit' disabled={isPending} className='bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase text-xs tracking-widest px-8'>{isPending ? 'Procesando...' : (isEdit ? 'Actualizar Producto' : 'Crear Producto')}</Button>
                </div>

                {/* Tax Modal */}
                <Dialog open={taxModalOpen} onOpenChange={setTaxModalOpen}>
                    <DialogContent className='sm:max-w-[450px]'>
                        <DialogHeader>
                            <DialogTitle>{editingTaxIndex !== null ? 'Editar Impuesto' : 'Agregar Impuesto'}</DialogTitle>
                            <DialogDescription>
                                Configura los detalles del impuesto {taxData.isLocal ? 'local' : 'federal'}.
                            </DialogDescription>
                        </DialogHeader>

                        <div className='flex p-1 bg-slate-100 dark:bg-zinc-900 rounded-lg mb-2'>
                            <button
                                type='button'
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${!taxData.isLocal ? 'bg-white dark:bg-zinc-800 shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
                                onClick={() => setTaxData({ ...taxData, isLocal: false, type: 'IVA', rate: 16 })}
                            >
                                Federal
                            </button>
                            <button
                                type='button'
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${taxData.isLocal ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                onClick={() => setTaxData({ ...taxData, isLocal: true, type: '', rate: 0 })}
                            >
                                Local
                            </button>
                        </div>

                        {!taxData.isLocal && (
                            <div className='space-y-3 mb-4'>
                                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>Selección Rápida</p>
                                <div className='grid grid-cols-2 gap-2'>
                                    {[
                                        { label: 'IVA 16%', type: 'IVA', rate: 16, factor: 'Tasa', wh: false },
                                        { label: 'IVA 8%', type: 'IVA', rate: 8, factor: 'Tasa', wh: false },
                                        { label: 'IVA Exento', type: 'IVA', rate: 0, factor: 'Exento', wh: false },
                                        { label: 'ISR 1.25%', type: 'ISR', rate: 1.25, factor: 'Tasa', wh: true },
                                        { label: 'Ret. IVA 10.67%', type: 'IVA', rate: 10.6667, factor: 'Tasa', wh: true },
                                        { label: 'IEPS 8%', type: 'IEPS', rate: 8, factor: 'Tasa', wh: false },
                                    ].map((preset) => (
                                        <Button
                                            key={preset.label}
                                            type='button'
                                            variant='outline'
                                            size='sm'
                                            className='h-8 text-[10px] font-bold border-slate-200 hover:border-orange-500 hover:text-orange-600'
                                            onClick={() => setTaxData({
                                                ...taxData,
                                                type: preset.type,
                                                rate: preset.rate,
                                                factor: preset.factor as any,
                                                withholding: preset.wh
                                            })}
                                        >
                                            {preset.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className='grid gap-4 py-2'>
                            {taxData.isLocal ? (
                                <div className='grid grid-cols-4 items-center gap-4'>
                                    <Label className='text-right text-xs font-bold uppercase'>Nombre</Label>
                                    <Input
                                        className='col-span-3'
                                        placeholder='Ej. ISH'
                                        value={taxData.type}
                                        onChange={(e) => setTaxData({ ...taxData, type: e.target.value })}
                                    />
                                </div>
                            ) : (
                                <div className='grid grid-cols-4 items-center gap-4'>
                                    <Label className='text-right text-xs font-bold uppercase'>Impuesto</Label>
                                    <div className='col-span-3'>
                                        <ComboboxDropdown
                                            defaultValue={taxData.type}
                                            onValueChange={(val) => setTaxData({ ...taxData, type: val as any })}
                                            items={[
                                                { label: 'IVA', value: 'IVA' },
                                                { label: 'ISR', value: 'ISR' },
                                                { label: 'IEPS', value: 'IEPS' },
                                            ]}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label className='text-right text-xs font-bold uppercase'>Tasa (%)</Label>
                                <Input
                                    type='number'
                                    step='any'
                                    className='col-span-3'
                                    value={taxData.rate}
                                    onChange={(e) => setTaxData({ ...taxData, rate: Number(e.target.value) })}
                                />
                            </div>

                            {!taxData.isLocal && (
                                <>
                                    <div className='grid grid-cols-4 items-center gap-4'>
                                        <Label className='text-right text-xs font-bold uppercase'>Factor</Label>
                                        <div className='col-span-3'>
                                            <ComboboxDropdown
                                                defaultValue={taxData.factor}
                                                onValueChange={(val) => setTaxData({ ...taxData, factor: val as any })}
                                                items={[
                                                    { label: 'Tasa', value: 'Tasa' },
                                                    { label: 'Cuota', value: 'Cuota' },
                                                    { label: 'Exento', value: 'Exento' },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                    <div className='grid grid-cols-4 items-center gap-4'>
                                        <Label className='text-right text-xs font-bold uppercase'>Tipo</Label>
                                        <div className='col-span-3 flex items-center space-x-2'>
                                            <Switch
                                                checked={taxData.withholding}
                                                onCheckedChange={(val) => setTaxData({ ...taxData, withholding: val })}
                                            />
                                            <span className='text-xs font-bold uppercase text-slate-500'>
                                                {taxData.withholding ? 'Retención' : 'Traslado'}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className='bg-slate-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-slate-100 dark:border-zinc-800'>
                                <div className='flex justify-between items-center'>
                                    <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Base del Impuesto</span>
                                    <span className='text-xs font-black text-slate-700 dark:text-zinc-200'>{(taxData.base || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type='button' variant='outline' onClick={() => setTaxModalOpen(false)}>Cancelar</Button>
                            <Button
                                type='button'
                                className='bg-orange-600 hover:bg-orange-700'
                                onClick={handleSaveTax}
                            >
                                {editingTaxIndex !== null ? 'Guardar' : 'Agregar'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </form>
        </Form>
    )
}
