import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, Save, Zap, FileText, Globe, CreditCard, Eye, AlertCircle, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ComboboxDropdown } from '@/components/combobox-dropdown'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useWorkCenterStore } from '@/stores/work-center-store'
import { getClientsByWorkCenter } from '@/features/clients/data/clients-api'
import { getProductosByWorkCenter } from '@/features/products/data/products-api'
import { createInvoiceIngresoSchema, type CreateInvoiceIngresoPayload } from '../data/schema'
import {
    getPaymentForms,
    getCfdiUses,
    getExportationOptions,
    createInvoice
} from '../data/invoicing-api'
import { searchSatProducts, searchSatUnits } from '@/features/products/data/products-api'

interface InvoiceFormIngresoProps {
    onSubmitSuccess: () => void
    onCancel: () => void
}

export function InvoiceFormIngreso({ onSubmitSuccess }: InvoiceFormIngresoProps) {
    const { selectedWorkCenterId } = useWorkCenterStore()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitType, setSubmitType] = useState<'draft' | 'pending'>('pending')
    const [showGlobalInfo, setShowGlobalInfo] = useState(false)
    const [showRelatedCfdi, setShowRelatedCfdi] = useState(false)
    const [taxModalOpen, setTaxModalOpen] = useState(false)
    const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)

    // Data fetching
    const { data: clients = [] } = useQuery({
        queryKey: ['clients', selectedWorkCenterId],
        queryFn: () => getClientsByWorkCenter(selectedWorkCenterId || ''),
        enabled: !!selectedWorkCenterId,
    })

    const { data: catalogProducts = [] } = useQuery({
        queryKey: ['products-catalog', selectedWorkCenterId],
        queryFn: () => getProductosByWorkCenter(selectedWorkCenterId || ''),
        enabled: !!selectedWorkCenterId,
    })

    const [paymentForms, setPaymentForms] = useState<{ label: string, value: string }[]>([])
    const [cfdiUses, setCfdiUses] = useState<{ label: string, value: string }[]>([])
    const [exportOptions, setExportOptions] = useState<{ label: string, value: string }[]>([])
    const [satProducts, setSatProducts] = useState<{ label: string, value: string }[]>([])
    const [satUnits, setSatUnits] = useState<{ label: string, value: string }[]>([])

    useEffect(() => {
        const loadCatalogs = async () => {
            const [pf, cu, eo, sp, su] = await Promise.all([
                getPaymentForms(),
                getCfdiUses(),
                getExportationOptions(),
                searchSatProducts(''),
                searchSatUnits(''),
            ])
            setPaymentForms(pf)
            setCfdiUses(cu)
            setExportOptions(eo)
            setSatProducts(sp.data.map(i => ({ label: `${i.id} - ${i.name}`, value: i.id })))
            setSatUnits(su.data.map(i => ({ label: `${i.id} - ${i.name}`, value: i.id })))
        }
        loadCatalogs()
    }, [])

    const form = useForm<CreateInvoiceIngresoPayload>({
        resolver: zodResolver(createInvoiceIngresoSchema) as any,
        defaultValues: {
            workCenterId: selectedWorkCenterId || '',
            tipo: 'I',
            currency: 'MXN',
            exchange: 1,
            payment_method: 'PUE',
            payment_form: '01',
            export: '01',
            status: 'pending',
            num_decimales: 2,
            date: 'now',
            items: [],
            comments: ''
        }
    })

    useEffect(() => {
        if (selectedWorkCenterId) {
            form.setValue('workCenterId', selectedWorkCenterId)
        }
    }, [selectedWorkCenterId, form])

    const [currentItem, setCurrentItem] = useState<any>({
        product_id: '',
        sku: '',
        description: '',
        product_key: '',
        unit_key: 'H87',
        unit_name: 'Pieza',
        quantity: 1,
        price: 0,
        tax_included: false,
        discount: 0,
        objeto_imp: '02',
        taxes: []
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items'
    })

    const { fields: relatedFields, append: appendRelated, remove: removeRelated } = useFieldArray({
        control: form.control,
        name: 'related_documents' as any
    })

    const watchItems = form.watch('items') as any[]
    const subtotal = watchItems.reduce((acc, item) => acc + (item.quantity * item.price), 0)
    const discount = watchItems.reduce((acc, item) => acc + Number(item.discount || 0), 0)

    // Calculate taxes from added items
    const TrasladadosTotal = watchItems.reduce((acc, item) => {
        const itemTaxes = item.taxes?.reduce((tAcc: number, tax: any) => {
            if (tax.withholding) return tAcc
            const base = tax.base || ((item.quantity * item.price) - (item.discount || 0))
            const rateFactor = tax.rate > 1 ? tax.rate / 100 : tax.rate
            const amount = base * rateFactor
            return tAcc + amount
        }, 0) || 0
        return acc + itemTaxes
    }, 0)

    const RetenidosTotal = watchItems.reduce((acc, item) => {
        const itemTaxes = item.taxes?.reduce((tAcc: number, tax: any) => {
            if (!tax.withholding) return tAcc
            const base = tax.base || ((item.quantity * item.price) - (item.discount || 0))
            const rateFactor = tax.rate > 1 ? tax.rate / 100 : tax.rate
            const amount = base * rateFactor
            return tAcc + amount
        }, 0) || 0
        return acc + itemTaxes
    }, 0)

    const total = subtotal - discount + TrasladadosTotal - RetenidosTotal

    const onSubmit = async (values: CreateInvoiceIngresoPayload) => {
        const isDraft = values.status === 'draft' || submitType === 'draft'

        // Manual Validation for "Generar CFDI"
        if (!isDraft) {
            let hasError = false
            if (!values.payment_form) {
                form.setError('payment_form', { message: 'Requerido para CFDI' })
                hasError = true
            }

            values.items.forEach((item, index) => {
                if (!item.product_id) {
                    if (!item.description) {
                        form.setError(`items.${index}.description` as any, { message: 'Requerido' })
                        hasError = true
                    }
                    if (!item.product_key) {
                        form.setError(`items.${index}.product_key` as any, { message: 'Requerido' })
                        hasError = true
                    }
                    if (item.price === undefined || item.price === null) {
                        form.setError(`items.${index}.price` as any, { message: 'Requerido' })
                        hasError = true
                    }
                }
            })

            if (hasError) {
                // Scroll to top or just stop
                return
            }
        }

        setIsSubmitting(true)
        try {
            // Transform values to match the backend expectation
            const apiPayload = {
                workCenterId: values.workCenterId,
                customer_id: values.customer_id,
                tipo: values.tipo || 'I',
                payment_form: values.payment_form,
                payment_method: values.payment_method,
                use: values.use,
                currency: values.currency,
                exchange: values.exchange || 1,
                conditions: values.conditions || values.comments,
                exportation: values.export || '01',
                status: isDraft ? 'draft' : 'pending',
                date: values.date || 'now',
                series: values.series,
                folio_number: values.folio_number,
                global: values.global && Object.keys(values.global).length > 0 ? values.global : undefined,
                related_documents: values.related_documents && values.related_documents.length > 0 ? values.related_documents : undefined,
                items: values.items.map(item => {
                    // product can be string (id) OR object (new product)
                    const productValue = item.product_id ? item.product_id : {
                        description: item.description,
                        product_key: item.product_key,
                        unit_key: item.unit_key || 'H87',
                        unit_name: item.unit_name || 'Pieza',
                        price: item.price || 0,
                        tax_included: item.tax_included || false,
                        taxes: (item.taxes || []).map((tax: any) => {
                            let rate = tax.rate > 1 ? tax.rate / 100 : tax.rate
                            rate = Math.round(rate * 10000) / 10000
                            if (tax.type === 'IVA' && rate > 0.16) rate = 0.16
                            return {
                                type: tax.type,
                                rate: rate,
                                base: Number((tax.base || ((item.quantity * (item.price || 0)) - (item.discount || 0))).toFixed(2)),
                                withholding: tax.withholding
                            }
                        })
                    }

                    return {
                        product: productValue,
                        quantity: item.quantity || 1,
                        discount: item.discount || 0
                    }
                })
            }

            console.log('Final API Payload:', JSON.stringify(apiPayload, null, 2))
            await createInvoice(apiPayload as any)
            onSubmitSuccess()
        } catch (error) {
            console.error('Submit error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const addItemToList = () => {
        // Relaxed validation: only need product_id OR description to identify item
        if (!currentItem.product_id && !currentItem.description) {
            return
        }

        if (editingIndex !== null) {
            // Update existing item
            form.setValue(`items.${editingIndex}`, currentItem)
            setEditingIndex(null)
        } else {
            // Add new item
            append(currentItem)
        }

        // Reset form
        setCurrentItem({
            product_id: '',
            sku: '',
            description: '',
            product_key: '',
            product_key_nombre: '', // Reset this field
            unit_key: 'H87',
            unit_name: 'Pieza',
            quantity: 1,
            price: 0,
            tax_included: false,
            discount: 0,
            objeto_imp: '02',
            taxes: []
        })
    }

    const editItem = (index: number) => {
        const item = watchItems[index]
        setCurrentItem({ ...item })
        setEditingIndex(index)
    }

    const [taxData, setTaxData] = useState<{ type: 'IVA' | 'ISR' | 'IEPS', rate: number, base: number }>({ type: 'IVA', rate: 16, base: 0 })

    const openTaxModal = (isNewItem: boolean, index?: number) => {
        if (isNewItem) {
            setActiveItemIndex(null)
            const base = (currentItem.price || 0) * (currentItem.quantity || 0)
            setTaxData({ type: 'IVA', rate: 16, base })
        } else if (index !== undefined) {
            setActiveItemIndex(index)
            const item = form.getValues(`items.${index}`)
            setTaxData({ type: 'IVA', rate: 16, base: (item.price || 0) * (item.quantity || 0) })
        }
        setTaxModalOpen(true)
    }

    const handleAddTax = () => {
        const newTax = { ...taxData, withholding: taxData.type === 'ISR' }
        if (activeItemIndex !== null) {
            const currentTaxes = form.getValues(`items.${activeItemIndex}.taxes`) || []
            form.setValue(`items.${activeItemIndex}.taxes`, [...currentTaxes, newTax])
        } else {
            // New item being edited in the form
            setCurrentItem({ ...currentItem, taxes: [...(currentItem.taxes || []), newTax] })
        }
        setTaxModalOpen(false)
    }

    const removeTaxFromCurrent = (index: number) => {
        const newTaxes = [...currentItem.taxes]
        newTaxes.splice(index, 1)
        setCurrentItem({ ...currentItem, taxes: newTaxes })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className='space-y-8'>

                {/* Section 1: Billing Details */}
                <div className='bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden'>
                    <div className='pb-4 px-4 md:px-6 pt-6 border-b border-slate-100 dark:border-zinc-900'>
                        <div className='flex items-center gap-2 text-orange-600'>
                            <FileText size={20} className='stroke-[2.5]' />
                            <h3 className='text-base font-bold uppercase tracking-tight'>Detalles de Facturación (CFDI 4.0)</h3>
                        </div>
                    </div>
                    <div className='space-y-6 px-4 md:px-6 py-6'>
                        <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
                            <div className='md:col-span-12'>
                                <FormField
                                    control={form.control as any}
                                    name='customer_id'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-bold text-slate-500 uppercase'>Cliente *</FormLabel>
                                            <div className='flex gap-2 transition-all'>
                                                <ComboboxDropdown
                                                    className='flex-1 border-slate-200 focus:ring-orange-500'
                                                    defaultValue={field.value}
                                                    onValueChange={field.onChange}
                                                    placeholder='Buscar por nombre o RFC...'
                                                    items={clients.map(c => ({ label: `${c.razonSocial} (${c.rfc})`, value: c._id }))}
                                                />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className='md:col-span-12'>
                                <FormField
                                    control={form.control as any}
                                    name='use'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-bold text-slate-500 uppercase'>Uso de CFDI *</FormLabel>
                                            <ComboboxDropdown
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                placeholder='Escribe para buscar (ej. G03)...'
                                                items={cfdiUses}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className='lg:col-span-6 col-span-12'>
                                <FormField
                                    control={form.control as any}
                                    name='payment_method'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-bold text-slate-500 uppercase'>Método de pago *</FormLabel>
                                            <ComboboxDropdown
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                items={[
                                                    { label: 'PUE - Pago en una sola exhibición', value: 'PUE' },
                                                    { label: 'PPD - Pago en parcialidades o diferido', value: 'PPD' }
                                                ]}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className='lg:col-span-6 col-span-12'>
                                <FormField
                                    control={form.control as any}
                                    name='payment_form'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-bold text-slate-500 uppercase'>Forma de pago *</FormLabel>
                                            <ComboboxDropdown
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                placeholder='01 - Efectivo'
                                                items={paymentForms}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='pt-2'>
                            <div className='flex items-center gap-2 text-slate-900 dark:text-zinc-100 mb-4'>
                                <div className='h-1.5 w-1.5 rounded-full bg-orange-500' />
                                <h4 className='text-xs font-bold uppercase'>Información de Fecha</h4>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
                                <FormField
                                    control={form.control as any}
                                    name='date'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs text-slate-400'>Fecha de expedición</FormLabel>
                                            <ComboboxDropdown
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                items={[
                                                    { label: 'Timbrar con fecha actual (Ahora)', value: 'now' },
                                                    { label: 'Timbrar con fecha de ayer', value: 'yesterday' },
                                                    { label: 'Timbrar con fecha de hace 2 días', value: '2days' },
                                                    { label: 'Timbrar con fecha de hace 3 días', value: '3days' },
                                                ]}
                                            />
                                        </FormItem>
                                    )}
                                />
                                <div className='flex items-center justify-center p-3 rounded-lg bg-orange-50/20 border border-orange-100/30 text-[10px] md:text-[11px] text-orange-700 font-medium'>
                                    <AlertCircle size={14} className='mr-2 shrink-0' />
                                    No puede ser anterior a 72 horas en el pasado.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Section 2: Global info & Logistics */}
                <div className='bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden'>
                    <div className='bg-slate-50/50 dark:bg-zinc-900/30 px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-900'>
                        <div className='flex items-center gap-2 text-slate-700 dark:text-zinc-300'>
                            <Globe size={18} className='text-orange-500' />
                            <h3 className='text-sm font-bold uppercase tracking-wide'>Información y Comercio</h3>
                        </div>
                        <div className='flex items-center space-x-4'>
                            <div className='flex items-center space-x-2'>
                                <Switch checked={showGlobalInfo} onCheckedChange={setShowGlobalInfo} className='data-[state=checked]:bg-orange-600' />
                                <Label className='text-xs font-medium text-slate-500 uppercase'>Factura Global</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Switch checked={showRelatedCfdi} onCheckedChange={setShowRelatedCfdi} className='data-[state=checked]:bg-orange-600' />
                                <Label className='text-xs font-medium text-slate-500 uppercase'>Relacionar Factura</Label>
                            </div>
                        </div>
                    </div>
                    <div className='p-4 md:p-6 space-y-6 md:space-y-8'>
                        {showGlobalInfo && (
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300'>
                                <FormField
                                    control={form.control as any}
                                    name='global.periodicity'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-bold text-slate-500 uppercase'>Periodicidad</FormLabel>
                                            <ComboboxDropdown
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                items={[
                                                    { label: '01 - Diario', value: '01' },
                                                    { label: '02 - Semanal', value: '02' },
                                                    { label: '03 - Quincenal', value: '03' },
                                                    { label: '04 - Mensual', value: '04' },
                                                    { label: '05 - Bimestral', value: '05' },
                                                ]}
                                            />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name='global.months'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-bold text-slate-500 uppercase'>Mes / Bimestre</FormLabel>
                                            <ComboboxDropdown
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                items={[
                                                    { label: 'Enero', value: '01' },
                                                    { label: 'Febrero', value: '02' },
                                                    { label: 'Marzo', value: '03' },
                                                    { label: 'Abril', value: '04' },
                                                    { label: 'Mayo', value: '05' },
                                                    { label: 'Junio', value: '06' },
                                                    { label: 'Julio', value: '07' },
                                                    { label: 'Agosto', value: '08' },
                                                    { label: 'Septiembre', value: '09' },
                                                    { label: 'Octubre', value: '10' },
                                                    { label: 'Noviembre', value: '11' },
                                                    { label: 'Diciembre', value: '12' },
                                                ]}
                                            />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name='global.year'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-bold text-slate-500 uppercase'>Año</FormLabel>
                                            <Input type='number' {...field} className='focus:ring-orange-500' />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {showRelatedCfdi && (
                            <div className='space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 pt-4 border-t border-slate-100 dark:border-zinc-800'>
                                <div className='flex items-center justify-between mb-2'>
                                    <h4 className='text-xs font-bold uppercase text-slate-500'>Documentos Relacionados</h4>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        className='h-7 text-[10px] font-bold border-orange-200 text-orange-600'
                                        onClick={() => appendRelated({ relationship: '01', documents: [''] } as any)}
                                    >
                                        <Plus size={14} className='mr-1' /> Agregar Relación
                                    </Button>
                                </div>

                                {relatedFields.map((field, index) => (
                                    <div key={field.id} className='grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 p-4 rounded-lg bg-slate-50/50 dark:bg-zinc-900/20 border border-slate-100 dark:border-zinc-800 relative group'>
                                        <div className='lg:col-span-5'>
                                            <FormField
                                                control={form.control as any}
                                                name={`related_documents.${index}.relationship`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className='text-[10px] font-black text-slate-400 uppercase'>Tipo de Relación</FormLabel>
                                                        <ComboboxDropdown
                                                            defaultValue={field.value}
                                                            onValueChange={field.onChange}
                                                            items={[
                                                                { label: '01 - Nota de crédito de los documentos relacionados', value: '01' },
                                                                { label: '02 - Nota de débito de los documentos relacionados', value: '02' },
                                                                { label: '03 - Devolución de mercancía sobre facturas o traslados previos', value: '03' },
                                                                { label: '04 - Sustitución de los CFDI previos', value: '04' },
                                                                { label: '07 - CFDI por aplicación de anticipo', value: '07' },
                                                            ]}
                                                        />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className='lg:col-span-6'>
                                            <FormField
                                                control={form.control as any}
                                                name={`related_documents.${index}.documents.0`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className='text-[10px] font-black text-slate-400 uppercase'>UUID (Folio Fiscal)</FormLabel>
                                                        <Input {...field} placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' className='bg-white' />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className='lg:col-span-1 flex items-end justify-center lg:justify-end'>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='icon'
                                                className='h-9 w-9 text-slate-400 hover:text-destructive'
                                                onClick={() => removeRelated(index)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6'>
                            <div className='lg:col-span-3 sm:col-span-1'>
                                <FormField
                                    control={form.control as any}
                                    name='currency'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-bold text-slate-500 uppercase'>Moneda</FormLabel>
                                            <ComboboxDropdown
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                items={[
                                                    { label: 'MXN - Peso Mexicano', value: 'MXN' },
                                                    { label: 'USD - Dólar Americano', value: 'USD' }
                                                ]}
                                            />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='lg:col-span-3 sm:col-span-1'>
                                <FormField
                                    control={form.control as any}
                                    name='export'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-bold text-slate-500 uppercase'>Exportación</FormLabel>
                                            <ComboboxDropdown
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                items={exportOptions}
                                            />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='lg:col-span-3 sm:col-span-1'>
                                <FormField
                                    control={form.control as any}
                                    name='series'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-bold text-slate-500 uppercase'>Serie</FormLabel>
                                            <Input {...field} placeholder='A' className='focus:ring-orange-500 uppercase' />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='lg:col-span-3 sm:col-span-1'>
                                <FormField
                                    control={form.control as any}
                                    name='folio_number'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-bold text-slate-500 uppercase'>Folio</FormLabel>
                                            <Input type='number' {...field} placeholder='123' className='focus:ring-orange-500' />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Añadir Conceptos */}
                <div className='space-y-6'>
                    <div className='flex items-center gap-3 text-orange-600 border-b-2 border-orange-500 pb-2'>
                        <CreditCard size={22} className='stroke-[2.5]' />
                        <h3 className='text-lg font-black uppercase tracking-tight'>Conceptos</h3>
                    </div>

                    <div className='bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden'>
                        <div className='bg-orange-50/30 dark:bg-orange-900/10 px-6 py-3 border-b border-orange-100/50 dark:border-orange-800/30 flex items-center justify-between'>
                            <span className='text-xs font-black text-orange-700 dark:text-orange-400 uppercase tracking-widest'>Añadir Nuevo Concepto</span>
                        </div>
                        <div className='p-4 md:p-8 space-y-6'>
                            {/* Product selection/Search */}
                            <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
                                <div className='md:col-span-12'>
                                    <Label className='text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2 mb-2'>
                                        <Zap size={12} fill='currentColor' /> Buscar en mi catálogo
                                    </Label>
                                    <ComboboxDropdown
                                        defaultValue={currentItem.product_id || ''}
                                        className='border-orange-200 bg-orange-50/10 focus:ring-orange-500'
                                        onValueChange={(val) => {
                                            const prod = catalogProducts.find(p => p.productIdFacturaApi === val || p._id === val)
                                            if (prod) {
                                                // Ensure SAT key is in the list
                                                if (prod.product_key && !satProducts.some(sp => sp.value === prod.product_key)) {
                                                    setSatProducts(prev => [
                                                        { label: `${prod.product_key} - ${prod.product_key_nombre || 'Producto de Catálogo'}`, value: prod.product_key },
                                                        ...prev
                                                    ])
                                                }

                                                // Ensure Unit key is in the list
                                                if (prod.unit_key && !satUnits.some(su => su.value === prod.unit_key)) {
                                                    setSatUnits(prev => [
                                                        { label: `${prod.unit_key} - ${prod.unit_name || 'Unidad de Catálogo'}`, value: prod.unit_key },
                                                        ...prev
                                                    ])
                                                }

                                                setCurrentItem({
                                                    ...currentItem,
                                                    product_id: prod.productIdFacturaApi || prod._id,
                                                    description: prod.description,
                                                    price: prod.price,
                                                    product_key: prod.product_key,
                                                    product_key_nombre: prod.product_key_nombre || '',
                                                    unit_key: prod.unit_key,
                                                    unit_name: prod.unit_name,
                                                    tax_included: prod.tax_included,
                                                    sku: prod.sku || '',
                                                    objeto_imp: prod.taxability || '02',
                                                    taxes: prod.taxes || []
                                                })
                                            }
                                        }}
                                        placeholder='Escribe para buscar un producto...'
                                        items={catalogProducts.map(p => ({
                                            label: `${p.description} (${p.sku || 'Sin SKU'}) - ${p.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`,
                                            value: p.productIdFacturaApi || p._id
                                        }))}
                                    />
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
                                <div className='md:col-span-2'>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>SKU</Label>
                                    <Input
                                        value={currentItem.sku}
                                        onChange={e => setCurrentItem({ ...currentItem, sku: e.target.value })}
                                        className='bg-white focus-visible:ring-orange-500'
                                        placeholder='001'
                                        readOnly={!!currentItem.product_id}
                                    />
                                </div>
                                <div className='md:col-span-6'>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>Descripción *</Label>
                                    <Input
                                        value={currentItem.description}
                                        onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })}
                                        className='bg-white focus-visible:ring-orange-500'
                                        placeholder='Ej. Consulta Médica'
                                        readOnly={!!currentItem.product_id}
                                    />
                                </div>
                                <div className='md:col-span-4'>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>Clave Unidad *</Label>
                                    <ComboboxDropdown
                                        key={`unit-${currentItem.unit_key}-${currentItem.product_id}`}
                                        defaultValue={currentItem.unit_key}
                                        onValueChange={val => setCurrentItem({ ...currentItem, unit_key: val })}
                                        placeholder='H87, etc'
                                        items={satUnits}
                                        disabled={!!currentItem.product_id}
                                    />
                                </div>
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end'>
                                <div className='lg:col-span-4 sm:col-span-2'>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>Clave SAT *</Label>
                                    <ComboboxDropdown
                                        key={`sat-${currentItem.product_key}-${currentItem.product_id}`}
                                        defaultValue={currentItem.product_key}
                                        onValueChange={val => {
                                            const selectedSatProduct = satProducts.find(p => p.value === val);
                                            setCurrentItem({
                                                ...currentItem,
                                                product_key: val,
                                                product_key_nombre: selectedSatProduct ? selectedSatProduct.label.split(' - ')[1] : ''
                                            });
                                        }}
                                        items={satProducts}
                                        disabled={!!currentItem.product_id}
                                    />
                                </div>
                                <div className='lg:col-span-1 sm:col-span-1'>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>Cant.</Label>
                                    <Input type='number' value={currentItem.quantity} onChange={e => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })} className='bg-white text-center focus-visible:ring-orange-500' />
                                </div>
                                <div className='lg:col-span-2 sm:col-span-1'>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>Precio Unitario *</Label>
                                    <Input
                                        type='number'
                                        step='any'
                                        value={currentItem.price}
                                        onChange={e => setCurrentItem({ ...currentItem, price: Number(e.target.value) })}
                                        className='focus-visible:ring-orange-500'
                                        readOnly={!!currentItem.product_id}
                                    />
                                </div>
                                <div className='lg:col-span-2 sm:col-span-1'>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>Descuento</Label>
                                    <Input type='number' step='any' value={currentItem.discount} onChange={e => setCurrentItem({ ...currentItem, discount: Number(e.target.value) })} className='focus-visible:ring-orange-500' />
                                </div>
                                <div className='lg:col-span-3 sm:col-span-1'>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>Objeto Impuesto</Label>
                                    <ComboboxDropdown
                                        key={`obj-${currentItem.objeto_imp}-${currentItem.product_id}`}
                                        defaultValue={currentItem.objeto_imp}
                                        onValueChange={val => setCurrentItem({ ...currentItem, objeto_imp: val })}
                                        items={[
                                            { label: '01 - No objeto de impuesto', value: '01' },
                                            { label: '02 - Sí objeto de impuesto', value: '02' },
                                            { label: '03 - Sí objeto de impuesto, pero no obligado a desglose', value: '03' },
                                            { label: '04 - Sí objeto de impuesto, y no causa impuesto', value: '04' }
                                        ]}
                                    />
                                </div>
                            </div>

                            <div className='pt-4 flex flex-col md:flex-row items-start md:items-center justify-between border-t border-slate-100 dark:border-zinc-800 gap-4'>
                                <div className='flex flex-wrap gap-2'>
                                    {currentItem.taxes?.map((tax: any, i: number) => (
                                        <Badge key={i} className='bg-orange-100 text-orange-700 hover:bg-orange-200 border-none cursor-pointer' onClick={() => removeTaxFromCurrent(i)}>
                                            {tax.type} {tax.rate}% <Trash2 size={10} className='ml-1' />
                                        </Badge>
                                    ))}
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        className='text-slate-400 hover:text-orange-600 h-7 text-[10px] font-bold underline px-0'
                                        onClick={() => setCurrentItem({
                                            product_id: '',
                                            sku: '',
                                            description: '',
                                            product_key: '',
                                            unit_key: 'H87',
                                            unit_name: 'Pieza',
                                            quantity: 1,
                                            price: 0,
                                            tax_included: false,
                                            discount: 0,
                                            objeto_imp: '02',
                                            taxes: []
                                        })}
                                    >
                                        Limpiar Campos
                                    </Button>
                                    <Button type='button' variant='outline' size='sm' className='border-orange-200 text-orange-600 h-7 text-[10px] font-bold' onClick={() => openTaxModal(true)}>
                                        + Impuesto
                                    </Button>
                                </div>
                                <div className='flex items-center gap-4 w-full md:w-auto'>
                                    <div className='text-right'>
                                        <p className='text-[9px] font-black text-slate-400 uppercase'>Importe Parcial</p>
                                        <p className='text-xl font-black text-slate-900 dark:text-zinc-100'>
                                            {((currentItem.quantity * currentItem.price) - currentItem.discount).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                        </p>
                                    </div>
                                    <Button
                                        type='button'
                                        onClick={addItemToList}
                                        className={editingIndex !== null ? 'bg-blue-600 hover:bg-blue-700 text-white font-black px-6 h-12 rounded-xl flex-1 md:flex-none' : 'bg-orange-600 hover:bg-orange-700 text-white font-black px-6 h-12 rounded-xl flex-1 md:flex-none'}
                                    >
                                        {editingIndex !== null ? <Save className='mr-2 h-5 w-5' /> : <Plus className='mr-2 h-5 w-5' />}
                                        {editingIndex !== null ? 'ACTUALIZAR' : 'AGREGAR A LISTA'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table of Added Concepts */}
                    <FormField
                        control={form.control}
                        name='items'
                        render={() => (
                            <FormItem>
                                {fields.length > 0 && (
                                    <div className='rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 mt-4'>
                                        <div className='bg-slate-50/50 dark:bg-zinc-900/30 px-6 py-3 border-b border-slate-200 dark:border-zinc-800'>
                                            <span className='text-[10px] font-black text-slate-500 uppercase tracking-widest'>Conceptos Agregados ({fields.length})</span>
                                        </div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow className='bg-slate-50/30'>
                                                    <TableHead className='text-[10px] font-black uppercase text-slate-400 w-[50px]'>#</TableHead>
                                                    <TableHead className='text-[10px] font-black uppercase text-slate-400'>Descripción</TableHead>
                                                    <TableHead className='text-[10px] font-black uppercase text-slate-400 text-center'>Cant.</TableHead>
                                                    <TableHead className='text-[10px] font-black uppercase text-slate-400 text-right'>Precio</TableHead>
                                                    <TableHead className='text-[10px] font-black uppercase text-slate-400 text-right'>Desc.</TableHead>
                                                    <TableHead className='text-[10px] font-black uppercase text-slate-400 text-right'>Importe</TableHead>
                                                    <TableHead className='text-[10px] font-black uppercase text-slate-400 text-right'>Acción</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {fields.map((field, index) => {
                                                    const item = watchItems[index]
                                                    if (!item) return null
                                                    return (
                                                        <TableRow key={field.id} className='hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 group'>
                                                            <TableCell className='text-xs font-bold text-slate-400'>{index + 1}</TableCell>
                                                            <TableCell>
                                                                <p className='text-xs font-bold text-slate-900 dark:text-zinc-100'>{item.description}</p>
                                                                <div className='flex gap-1 mt-1'>
                                                                    <Badge variant='outline' className='text-[8px] h-4 py-0 border-slate-200 text-slate-400 uppercase'>{item.product_key}</Badge>
                                                                    {item.taxes?.map((t: any, i: number) => (
                                                                        <Badge key={i} variant='outline' className='text-[8px] h-4 py-0 border-orange-100 text-orange-400 bg-orange-50/10 uppercase'>{t.type} {t.rate}%</Badge>
                                                                    ))}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className='text-xs font-bold text-center'>{item.quantity}</TableCell>
                                                            <TableCell className='text-xs font-medium text-right'>{item.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
                                                            <TableCell className='text-xs font-medium text-right text-orange-600'>-{item.discount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
                                                            <TableCell className='text-sm font-black text-right'>
                                                                {((item.quantity * item.price) - item.discount).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                            </TableCell>
                                                            <TableCell className='text-right'>
                                                                <div className='flex justify-end gap-1'>
                                                                    <Button type='button' variant='ghost' size='icon' className='h-8 w-8 text-slate-300 hover:text-blue-600' onClick={() => editItem(index)}>
                                                                        <Eye size={14} />
                                                                    </Button>
                                                                    <Button type='button' variant='ghost' size='icon' className='h-8 w-8 text-slate-300 hover:text-destructive' onClick={() => remove(index)}>
                                                                        <Trash2 size={14} />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                                <FormMessage className='mt-2 font-bold text-destructive text-sm bg-destructive/10 p-2 rounded-lg border border-destructive/20 inline-block' />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Footer: Comments and Overall Summary */}
                <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
                    {/* Comments Row - Full Width span */}
                    <div className='md:col-span-12'>
                        <div className='rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden shadow-sm'>
                            <div className='p-6'>
                                <FormField
                                    control={form.control as any}
                                    name='conditions'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-black text-slate-500 uppercase tracking-wider'>Condiciones / Comentarios</FormLabel>
                                            <Textarea placeholder='Añade términos de pago, notas adicionales, etc...' className='min-h-[100px] bg-slate-50/10 focus-visible:ring-orange-500 border-slate-100 dark:border-zinc-800 text-sm' {...field} />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions and Totals Table */}
                    <div className='md:col-span-7 space-y-4'>
                        <div className='flex items-center gap-4'>
                            <Button type='button' variant='outline' className='text-slate-500 border-slate-200 hover:bg-slate-50 h-10'>
                                <Eye className='mr-2 h-4 w-4' /> Vista Previa
                            </Button>
                            <Button type='button' variant='outline' className='text-slate-500 border-slate-200 hover:bg-slate-50 h-10'
                                onClick={() => {
                                    setSubmitType('draft')
                                    form.setValue('status', 'draft')
                                    form.handleSubmit(onSubmit as any)()
                                }}
                            >
                                <Save className='mr-2 h-4 w-4' /> Guardar Borrador
                            </Button>
                        </div>
                    </div>

                    <div className='md:col-span-5'>
                        <div className='rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden shadow-sm'>
                            <Table>
                                <TableBody>
                                    <TableRow className='hover:bg-transparent border-b border-slate-50 dark:border-zinc-900'>
                                        <TableCell className='text-[10px] font-black uppercase text-slate-500 py-3'>Subtotal:</TableCell>
                                        <TableCell className='text-right font-black text-slate-900 dark:text-white py-3'>
                                            {subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className='hover:bg-transparent border-b border-slate-50 dark:border-zinc-900'>
                                        <TableCell className='text-[10px] font-black uppercase text-orange-600/80 py-3'>Descuento:</TableCell>
                                        <TableCell className='text-right font-black text-orange-600 py-3'>
                                            -{discount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className='hover:bg-transparent border-b border-slate-50 dark:border-zinc-900'>
                                        <TableCell className='text-[10px] font-black uppercase text-slate-500 py-3'>Impuestos Trasladados:</TableCell>
                                        <TableCell className='text-right font-black text-slate-900 dark:text-white py-3'>
                                            {TrasladadosTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className='hover:bg-transparent border-b border-slate-50 dark:border-zinc-900'>
                                        <TableCell className='text-[10px] font-black uppercase text-slate-500 py-3'>Impuestos Retenidos:</TableCell>
                                        <TableCell className='text-right font-black text-slate-900 dark:text-white py-3'>
                                            -{RetenidosTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className='bg-orange-600 hover:bg-orange-600'>
                                        <TableCell className='text-[11px] font-black uppercase text-white py-4'>Total</TableCell>
                                        <TableCell className='text-right text-xl font-black text-white py-4'>
                                            {total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        {Object.keys(form.formState.errors).length > 0 && (
                            <div className='mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-top-2 duration-300'>
                                <p className='text-xs font-black text-destructive uppercase mb-2 flex items-center gap-2'>
                                    <AlertCircle size={14} /> Errores detectados ({Object.keys(form.formState.errors).length}):
                                </p>
                                <ul className='space-y-1'>
                                    {Object.entries(form.formState.errors).map(([key, error]) => (
                                        <li key={key} className='text-[10px] font-bold text-destructive/80 list-disc list-inside uppercase'>
                                            {key === 'items' ? 'Debe agregar al menos un concepto a la lista' : (error as any).message}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <Button
                            type='submit'
                            className='w-full bg-orange-600 hover:bg-orange-700 text-white font-black h-12 rounded-xl text-sm shadow-lg shadow-orange-100 dark:shadow-none transition-all active:scale-[0.98]'
                            disabled={isSubmitting}
                            onClick={() => {
                                setSubmitType('pending')
                                form.setValue('status', 'pending')
                            }}
                        >
                            <Zap className='mr-2 h-4 w-4' strokeWidth={3} /> GENERAR CFDI
                        </Button>
                    </div>
                </div>

            </form >

            {isSubmitting && (
                <div className='fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300'>
                    <div className='flex flex-col items-center gap-4 p-8 rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-slate-100 dark:border-zinc-800 scale-110'>
                        <div className='relative'>
                            <Loader2 className='h-12 w-12 text-orange-600 animate-spin' strokeWidth={2.5} />
                            <div className='absolute inset-0 h-12 w-12 border-4 border-orange-100 dark:border-orange-950 rounded-full opacity-20'></div>
                        </div>
                        <div className='text-center'>
                            <p className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest'>
                                {submitType === 'draft' ? 'Guardando Borrador' : 'Generando CFDI'}
                            </p>
                            <p className='text-[10px] font-bold text-slate-500 uppercase mt-1'>
                                Por favor espera un momento...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <Dialog open={taxModalOpen} onOpenChange={setTaxModalOpen}>
                <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                        <DialogTitle>Agregar Impuesto</DialogTitle>
                        <DialogDescription>
                            Define los detalles del impuesto para este concepto.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <Label htmlFor='tax-type' className='text-right text-xs font-bold uppercase'>Tipo</Label>
                            <div className='col-span-3'>
                                <ComboboxDropdown
                                    defaultValue={taxData.type}
                                    onValueChange={(val) => setTaxData({ ...taxData, type: val as 'IVA' | 'ISR' | 'IEPS' })}
                                    items={[
                                        { label: 'IVA - Traslado', value: 'IVA' },
                                        { label: 'ISR - Retención', value: 'ISR' },
                                        { label: 'IEPS - Traslado', value: 'IEPS' },
                                    ]}
                                />
                            </div>
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <Label htmlFor='tax-rate' className='text-right text-xs font-bold uppercase'>Tasa (%)</Label>
                            <Input
                                id='tax-rate'
                                type='number'
                                className='col-span-3'
                                value={taxData.rate}
                                onChange={(e) => setTaxData({ ...taxData, rate: Number(e.target.value) })}
                            />
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <Label htmlFor='tax-base' className='text-right text-xs font-bold uppercase'>Base ($)</Label>
                            <Input
                                id='tax-base'
                                type='number'
                                className='col-span-3'
                                value={taxData.base}
                                onChange={(e) => setTaxData({ ...taxData, base: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type='button' variant='outline' onClick={() => setTaxModalOpen(false)}>Cancelar</Button>
                        <Button
                            type='button'
                            className='bg-orange-600 hover:bg-orange-700'
                            onClick={handleAddTax}
                        >
                            Agregar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Form >
    )
}
