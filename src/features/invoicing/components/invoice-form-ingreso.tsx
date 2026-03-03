import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
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
import { RemoteCombobox } from '@/components/remote-combobox'
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
import { Checkbox } from '@/components/ui/checkbox'
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
    createInvoice,
    TAXABILITY_CATALOG
} from '../data/invoicing-api'
import { searchSatProducts, searchSatUnits } from '@/features/products/data/products-api'
import { getSeriesConfig } from '@/features/series/data/series-api'
import { ClientCreateModal } from '@/features/clients/components/client-create-modal'
import { ProductCreateModal } from '@/features/products/components/product-create-modal'

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
    const [clientModalOpen, setClientModalOpen] = useState(false)
    const [productModalOpen, setProductModalOpen] = useState(false)

    // Data fetching
    const { data: clients = [], refetch: refetchClients } = useQuery({
        queryKey: ['clients', selectedWorkCenterId],
        queryFn: () => getClientsByWorkCenter(selectedWorkCenterId || ''),
        enabled: !!selectedWorkCenterId,
    })

    const [extraClients, setExtraClients] = useState<any[]>([])
    const [extraProducts, setExtraProducts] = useState<any[]>([])

    // Normalization helpers to handle inconsistent API property names
    const normalizeClient = (c: any) => {
        if (!c) return null
        const id = c._id || c.id || (c.data && (c.data._id || c.data.id))
        if (!id) return null
        return {
            ...c,
            _id: id,
            razonSocial: c.razonSocial || c.razon_social || (c.data && (c.data.razonSocial || c.data.razon_social)) || '',
            rfc: c.rfc || (c.data && c.data.rfc) || '',
            default_invoice_use: c.default_invoice_use || (c.data && c.data.default_invoice_use)
        }
    }

    const normalizeProduct = (p: any) => {
        if (!p) return null
        const id = p._id || p.id || p.productIdFacturaApi || (p.data && (p.data._id || p.data.id || p.data.productIdFacturaApi))
        if (!id) return null
        return {
            ...p,
            _id: id,
            productIdFacturaApi: p.productIdFacturaApi || id,
            description: p.description || p.descripcion || (p.data && (p.data.description || p.data.descripcion)) || '',
            price: p.price || p.precio || (p.data && (p.data.price || p.data.precio)) || 0,
            product_key: p.product_key || p.productKey || (p.data && (p.data.product_key || p.data.productKey)) || '',
            product_key_nombre: p.product_key_nombre || p.productKeyNombre || (p.data && (p.data.product_key_nombre || p.data.productKeyNombre)) || '',
            unit_key: p.unit_key || p.unitKey || (p.data && (p.data.unit_key || p.data.unitKey)) || 'H87',
            unit_name: p.unit_name || p.unitName || (p.data && (p.data.unit_name || p.data.unitName)) || 'Pieza',
            tax_included: p.tax_included ?? p.taxIncluded ?? (p.data && (p.data.tax_included ?? p.data.taxIncluded)) ?? false,
            sku: p.sku || (p.data && p.data.sku) || '',
            objeto_imp: p.taxability || p.objeto_imp || (p.data && (p.data.taxability || p.data.objeto_imp)) || '02',
            taxes: (p.taxes || (p.data && p.data.taxes) || []).map((t: any) => ({ ...t, base: 100 })),
            local_taxes: (p.local_taxes || (p.data && p.data.local_taxes) || []).map((t: any) => ({ ...t, base: 100 }))
        }
    }

    const combinedClients = useMemo(() => {
        const list = [...clients]
        extraClients.forEach(c => {
            if (!list.some(l => l._id === c._id)) {
                list.unshift(c)
            }
        })
        return list
    }, [clients, extraClients])

    const { data: catalogProducts = [], refetch: refetchProducts } = useQuery({
        queryKey: ['products', selectedWorkCenterId],
        queryFn: () => getProductosByWorkCenter(selectedWorkCenterId || ''),
        enabled: !!selectedWorkCenterId,
    })

    const combinedProducts = useMemo(() => {
        const list = [...catalogProducts]
        extraProducts.forEach(p => {
            if (!list.some(l => (l.productIdFacturaApi || l._id) === (p.productIdFacturaApi || p._id))) {
                list.unshift(p)
            }
        })
        return list
    }, [catalogProducts, extraProducts])

    const [paymentForms, setPaymentForms] = useState<{ label: string, value: string }[]>([])
    const [exportOptions, setExportOptions] = useState<{ label: string, value: string }[]>([])

    useEffect(() => {
        const loadCatalogs = async () => {
            const [pf, eo] = await Promise.all([
                getPaymentForms(),
                getExportationOptions()
            ])
            setPaymentForms(pf)
            setExportOptions(eo)
        }
        loadCatalogs()
    }, [])

    // Remote catalog searches are now handled by RemoteCombobox component

    const { data: seriesResp } = useQuery({
        queryKey: ['series-config', selectedWorkCenterId],
        queryFn: () => getSeriesConfig(selectedWorkCenterId!),
        enabled: !!selectedWorkCenterId,
    })

    const seriesConfig = seriesResp?.data

    const form = useForm<CreateInvoiceIngresoPayload>({
        resolver: zodResolver(createInvoiceIngresoSchema) as any,
        defaultValues: {
            workCenterId: selectedWorkCenterId || '',
            customer_id: '',
            tipo: 'I',
            currency: 'MXN',
            exchange: 1,
            payment_method: 'PUE',
            payment_form: '01',
            use: 'G03',
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

    // Auto-fill series and folio based on configuration
    const watchTipo = form.watch('tipo')
    useEffect(() => {
        if (seriesConfig && seriesConfig.enabled) {
            let prefix = ''
            let folio = 1

            if (seriesConfig.isPerType) {
                const config = (seriesConfig.typeConfigs as any)[watchTipo]
                if (config) {
                    prefix = config.prefix
                    folio = config.next_folio
                } else {
                    prefix = seriesConfig.globalConfig.prefix
                    folio = seriesConfig.globalConfig.next_folio
                }
            } else {
                prefix = seriesConfig.globalConfig.prefix
                folio = seriesConfig.globalConfig.next_folio
            }

            form.setValue('series', prefix)
            form.setValue('folio_number', folio)
        }
    }, [seriesConfig, watchTipo, form])

    const customerId = useWatch({
        control: form.control,
        name: 'customer_id'
    })

    const selectedCustomer = clients.find(c => c._id === customerId)
    const customerRegime = selectedCustomer?.regimenFiscal

    const { data: cfdiUses = [] } = useQuery({
        queryKey: ['cfdi-uses', customerRegime],
        queryFn: () => getCfdiUses(customerRegime),
    })

    const currentUse = useWatch({
        control: form.control,
        name: 'use'
    })

    useEffect(() => {
        if (customerRegime && cfdiUses.length > 0 && currentUse) {
            const isValid = cfdiUses.some(u => u.value === currentUse)
            if (!isValid) {
                form.setValue('use', '')
            }
        }
    }, [cfdiUses, currentUse, form, customerRegime])


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
        taxes: [],
        local_taxes: [],
        use_local_taxes: true
    })

    const [currentItemErrors, setCurrentItemErrors] = useState<Record<string, string>>({})

    const selectProductFromCatalog = (prod: any) => {
        const p = normalizeProduct(prod)
        if (!p) return

        // SAT key and name setup is handled by RemoteCombobox or normalized product metadata

        // Initial unit name setup is not needed as RemoteCombobox handles it or we use initialLabel

        setCurrentItem({
            ...currentItem,
            product_id: p.productIdFacturaApi || p._id,
            description: p.description,
            price: p.price,
            product_key: p.product_key,
            product_key_nombre: p.product_key_nombre || '',
            unit_key: p.unit_key,
            unit_name: p.unit_name,
            tax_included: p.tax_included,
            sku: p.sku || '',
            objeto_imp: p.objeto_imp || '02',
            taxes: (p.taxes || []).map((t: any) => ({
                type: t.type,
                rate: t.rate,
                withholding: !!t.withholding,
                base: t.base || (p.price * currentItem.quantity),
                factor: t.factor || 'Tasa'
            })),
            local_taxes: (p.local_taxes || []).map((t: any) => ({
                type: t.type,
                rate: t.rate,
                withholding: !!t.withholding,
                base: t.base || (p.price * currentItem.quantity)
            })),
            use_local_taxes: (p.local_taxes || []).length > 0
        })

        // Add to extraProducts if not already there to ensure combinedProducts has it
        setExtraProducts(prev => {
            const id = p.productIdFacturaApi || p._id
            if (prev.some(item => (item.productIdFacturaApi || item._id) === id)) return prev
            return [p, ...prev]
        })
    }

    const selectClient = (client: any) => {
        const c = normalizeClient(client)
        if (!c) return
        setExtraClients(prev => {
            if (prev.some(item => item._id === c._id)) return prev
            return [c, ...prev]
        })
        form.setValue('customer_id', c._id, { shouldDirty: true, shouldValidate: true })
        if (c.default_invoice_use) {
            form.setValue('use', c.default_invoice_use, { shouldDirty: true, shouldValidate: true })
        }
    }

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items'
    })

    const { fields: relatedFields, append: appendRelated, remove: removeRelated } = useFieldArray({
        control: form.control,
        name: 'related_documents' as any
    })

    const watchItems = form.watch('items') as any[]

    // Single-pass aggregation that respects tax_included per item
    const invoiceTotals = useMemo(() => {
        let subtotal = 0
        let disc = 0
        let trasladados = 0
        let retenidos = 0
        let localTrasladados = 0
        let localRetenidos = 0

        watchItems.forEach((item: any) => {
            const gross = (item.quantity || 0) * (item.price || 0)
            const itemDisc = item.discount_type === 'percentage'
                ? gross * ((item.discount || 0) / 100)
                : Number(item.discount || 0)
            const grossAfterDisc = gross - itemDisc

            // Compute real subtotal (price excluding taxes)
            let itemSubtotal = grossAfterDisc
            if (item.tax_included) {
                // backtrack: total = subtotal * (1 + netRate) → subtotal = total / (1 + netRate)
                const federalFactor = (item.taxes || []).reduce((a: number, t: any) => {
                    const r = t.rate > 1 ? t.rate / 100 : t.rate
                    return a + (t.withholding ? -r : r)
                }, 0)
                const localFactor = (item.local_taxes || []).reduce((a: number, t: any) => {
                    const r = t.rate > 1 ? t.rate / 100 : t.rate
                    return a + (t.withholding ? -r : r)
                }, 0)
                const divisor = 1 + federalFactor + localFactor
                itemSubtotal = divisor !== 0 ? grossAfterDisc / divisor : grossAfterDisc
            }

            subtotal += itemSubtotal
            disc += itemDisc

                // Federal taxes on the real subtotal
                ; (item.taxes || []).forEach((tax: any) => {
                    const r = tax.rate > 1 ? tax.rate / 100 : tax.rate
                    const amt = itemSubtotal * r
                    if (tax.withholding) retenidos += amt
                    else trasladados += amt
                })

                // Local taxes on the real subtotal
                ; (item.local_taxes || []).forEach((tax: any) => {
                    const r = tax.rate > 1 ? tax.rate / 100 : tax.rate
                    const amt = itemSubtotal * r
                    if (tax.withholding) localRetenidos += amt
                    else localTrasladados += amt
                })
        })

        const total = subtotal + trasladados - retenidos + localTrasladados - localRetenidos
        return { subtotal, disc, trasladados, retenidos, localTrasladados, localRetenidos, total }
    }, [watchItems])

    const { subtotal, disc: discount, trasladados: TrasladadosTotal, retenidos: RetenidosTotal, localTrasladados: LocalTrasladadosTotal, localRetenidos: LocalRetenidosTotal, total } = invoiceTotals

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
                    const taxes = (item.taxes || []).map((tax: any) => {
                        let rate = tax.rate > 1 ? tax.rate / 100 : tax.rate
                        rate = Math.round(rate * 10000) / 10000
                        if (tax.type === 'IVA' && rate > 0.16) rate = 0.16
                        return {
                            type: tax.type,
                            rate: rate,
                            base: Number((tax.base || (item.quantity * (item.price || 0))).toFixed(2)),
                            withholding: tax.withholding,
                            factor: tax.factor || 'Tasa'
                        }
                    })

                    const local_taxes = (item.local_taxes || []).map((tax: any) => {
                        let rate = tax.rate > 1 ? tax.rate / 100 : tax.rate
                        rate = Math.round(rate * 10000) / 10000
                        return {
                            type: tax.type,
                            rate: rate,
                            base: Number((tax.base || (item.quantity * (item.price || 0))).toFixed(2)),
                            withholding: tax.withholding
                        }
                    })

                    const discountAmount = item.discount_type === 'percentage'
                        ? (item.quantity * (item.price || 0)) * (item.discount / 100)
                        : (item.discount || 0)

                    return {
                        quantity: item.quantity || 1,
                        discount: Number(discountAmount.toFixed(2)),
                        product: {
                            // id: item.product_id || undefined,
                            description: item.description,
                            product_key: item.product_key,
                            price: item.price || 0,
                            tax_included: item.tax_included || false,
                            taxability: item.objeto_imp || '02',
                            taxes,
                            local_taxes,
                            unit_key: item.unit_key || 'H87',
                            unit_name: item.unit_name || 'Pieza',
                            sku: item.sku || ''
                        }
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
        const errors: Record<string, string> = {}
        if (!currentItem.description) errors.description = 'La descripción es requerida'
        if (!currentItem.product_key) errors.product_key = 'La clave SAT es requerida'
        if (!currentItem.unit_key) errors.unit_key = 'La clave de unidad es requerida'
        if (!currentItem.objeto_imp) errors.objeto_imp = 'El objeto de impuesto es requerido'
        if (!currentItem.quantity || currentItem.quantity <= 0) errors.quantity = 'Cantidad debe ser mayor a 0'
        if (currentItem.price === undefined || currentItem.price === null || currentItem.price < 0) errors.price = 'Precio inválido'

        if (Object.keys(errors).length > 0) {
            setCurrentItemErrors(errors)
            return
        }

        setCurrentItemErrors({})
        if (editingIndex !== null) {
            // Update existing item
            const itemToSave = { ...currentItem }
            if (!itemToSave.use_local_taxes) {
                itemToSave.local_taxes = []
            }
            form.setValue(`items.${editingIndex}`, itemToSave)
            setEditingIndex(null)
        } else {
            // Add new item
            const itemToSave = { ...currentItem }
            if (!itemToSave.use_local_taxes) {
                itemToSave.local_taxes = []
            }
            append(itemToSave)
        }

        // Reset form
        setCurrentItem({
            product_id: '',
            sku: '',
            description: '',
            product_key: '',
            product_key_nombre: '',
            unit_key: 'H87',
            unit_name: 'Pieza',
            quantity: 1,
            price: 0,
            tax_included: false,
            discount: 0,
            objeto_imp: '02',
            taxes: [],
            local_taxes: [],
            use_local_taxes: true
        })
    }

    const editItem = (index: number) => {
        const item = watchItems[index]
        setCurrentItem({ ...item })
        setEditingIndex(index)
    }

    const [taxData, setTaxData] = useState<{ type: 'IVA' | 'ISR' | 'IEPS', rate: number, base: number }>({ type: 'IVA', rate: 16, base: 100 })

    const openTaxModal = (isNewItem: boolean, index?: number) => {
        if (isNewItem) {
            setActiveItemIndex(null)
            setTaxData({ type: 'IVA', rate: 16, base: 100 })
        } else if (index !== undefined) {
            setActiveItemIndex(index)
            // Even when editing, the base should be 100 according to new requirements
            setTaxData({ type: 'IVA', rate: 16, base: 100 })
        }
        setTaxModalOpen(true)
    }

    const handleAddTax = () => {
        // base is always 100 per requirements
        const newTax = {
            ...taxData,
            base: 100,
            withholding: taxData.type === 'ISR'
        }

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
                                                    onValueChange={(val) => {
                                                        if (val === '__ADD_NEW_CLIENT__') {
                                                            setClientModalOpen(true)
                                                            return
                                                        }
                                                        field.onChange(val)
                                                        const client = combinedClients.find(c => c._id === val)
                                                        if (client) selectClient(client)
                                                    }}
                                                    placeholder='Buscar por nombre o RFC...'
                                                    items={[
                                                        { label: '+ Agregar Nuevo Cliente', value: '__ADD_NEW_CLIENT__' },
                                                        ...combinedClients.map(c => ({
                                                            label: `${c.razonSocial || ''} (${c.rfc || ''})`,
                                                            value: c._id
                                                        }))
                                                    ]}
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
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>

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
                            <div className='flex items-center gap-2 text-slate-800 dark:text-zinc-200 mb-4'>
                                <h4 className='text-xs font-bold text-slate-500 uppercase'>Información de Fecha</h4>
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
                                <div className='space-y-1'>
                                    <Label className='text-xs text-slate-400'>Fecha correspondiente</Label>
                                    <div className='relative'>
                                        <Input
                                            readOnly
                                            className='bg-slate-50/50 border-slate-200 text-xs font-medium text-slate-600'
                                            value={(() => {
                                                const dateVal = form.watch('date')
                                                const now = new Date()
                                                let targetDate = new Date()
                                                if (dateVal === 'yesterday') targetDate.setDate(now.getDate() - 1)
                                                else if (dateVal === '2days') targetDate.setDate(now.getDate() - 2)
                                                else if (dateVal === '3days') targetDate.setDate(now.getDate() - 3)

                                                return `${format(targetDate, "EEEE d 'de' MMMM", { locale: es })}`
                                            })()}
                                        />
                                    </div>
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
                            <h3 className='text-sm font-bold uppercase tracking-wide'>Configuración Fiscal</h3>
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
                                                    { label: 'Seleccionar', value: '' },
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
                                                    { label: 'Seleccionar', value: '' },
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
                                    <div key={field.id} className='grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 md:gap-4 p-4 rounded-lg bg-slate-50/50 dark:bg-zinc-900/20 border border-slate-100 dark:border-zinc-800'>
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
                                                            { label: '01 - Nota de crédito', value: '01' },
                                                            { label: '02 - Nota de débito', value: '02' },
                                                            { label: '03 - Devolución de mercancía', value: '03' },
                                                            { label: '04 - Sustitución de CFDI previos', value: '04' },
                                                            { label: '07 - CFDI por anticipo', value: '07' },
                                                        ]}
                                                    />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name={`related_documents.${index}.documents.0`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-[10px] font-black text-slate-400 uppercase'>UUID (Folio Fiscal)</FormLabel>
                                                    <Input {...field} placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' className='bg-white font-mono text-xs' />
                                                </FormItem>
                                            )}
                                        />
                                        <div className='flex items-end justify-end md:justify-center'>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='icon'
                                                className='h-9 w-9 text-destructive hover:bg-destructive/10'
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
                            <div className='lg:col-span-4 sm:col-span-1'>
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
                            <div className='lg:col-span-4 sm:col-span-1'>
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
                            {seriesConfig?.enabled ? (
                                <div className='lg:col-span-4 sm:col-span-2 space-y-1.5'>
                                    <p className='text-xs font-bold text-slate-500 uppercase'>Folio</p>
                                    <div className='flex h-9 items-center rounded-md border border-slate-200 bg-slate-50 px-3 dark:border-zinc-700 dark:bg-zinc-900'>
                                        <span className='text-sm font-semibold tracking-wider text-slate-700 uppercase dark:text-zinc-300'>
                                            {form.watch('series')}{form.watch('series') ? '-' : ''}{form.watch('folio_number') ?? '—'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className='lg:col-span-4 sm:col-span-2'>
                                    <p className='text-xs font-bold text-slate-500 uppercase mb-1.5'>Folio</p>
                                    <div className='flex h-9 overflow-hidden rounded-md border border-input ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'>
                                        <FormField
                                            control={form.control as any}
                                            name='series'
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    placeholder='A'
                                                    className='w-16 border-0 border-r border-input bg-muted/50 px-2 text-center text-sm font-semibold uppercase outline-none'
                                                />
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name='folio_number'
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type='number'
                                                    placeholder='123'
                                                    className='flex-1 border-0 bg-transparent px-3 text-sm outline-none'
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 3: Añadir Conceptos */}
                <div className='space-y-6'>
                    <div className='flex items-center gap-3 text-orange-600 border-b-2 border-orange-500 pb-2'>
                        <CreditCard size={20} className='stroke-[2.5]' />
                        <h3 className='text-base font-bold uppercase tracking-tight'>Conceptos</h3>
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
                                            if (val === '__ADD_NEW_PRODUCT__') {
                                                setProductModalOpen(true)
                                                return
                                            }
                                            const prod = combinedProducts.find(p => p.productIdFacturaApi === val || p._id === val)
                                            if (prod) {
                                                selectProductFromCatalog(prod)
                                            } else {
                                                setCurrentItem({ ...currentItem, product_id: val })
                                            }
                                        }}
                                        placeholder='Escribe para buscar un producto...'
                                        items={[
                                            { label: '+ Agregar Nuevo Producto', value: '__ADD_NEW_PRODUCT__' },
                                            ...combinedProducts.map(p => ({
                                                label: `${p.description || ''}${p.sku ? ` - ${p.sku}` : ''} - ${(p.price || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`,
                                                value: p.productIdFacturaApi || p._id
                                            }))
                                        ]}
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
                                        readOnly={false}
                                    />
                                </div>
                                <div className='md:col-span-10'>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>Descripción *</Label>
                                    <Input
                                        value={currentItem.description}
                                        onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })}
                                        className='bg-white focus-visible:ring-orange-500'
                                        placeholder='Ej. Consulta Médica'
                                        readOnly={false}
                                    />
                                    {currentItemErrors.description && <p className='text-[10px] text-destructive font-bold mt-1 uppercase'>{currentItemErrors.description}</p>}
                                </div>
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end'>
                                <div className='lg:col-span-4 sm:col-span-2'>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>Clave Unidad *</Label>
                                    <RemoteCombobox
                                        key={`unit-${currentItem.unit_key}-${currentItem.product_id}`}
                                        value={currentItem.unit_key}
                                        onValueChange={(val, label) => setCurrentItem({ ...currentItem, unit_key: val, unit_name: label })}
                                        placeholder='H87, etc'
                                        fetchFn={searchSatUnits}
                                        disabled={false}
                                        initialLabel={currentItem.unit_name}
                                    />
                                    {currentItemErrors.unit_key && <p className='text-[10px] text-destructive font-bold mt-1 uppercase'>{currentItemErrors.unit_key}</p>}
                                </div>
                                <div className='lg:col-span-4 sm:col-span-2'>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>Clave SAT *</Label>
                                    <RemoteCombobox
                                        key={`sat-${currentItem.product_key}-${currentItem.product_id}`}
                                        value={currentItem.product_key}
                                        onValueChange={(val, label) => {
                                            setCurrentItem({
                                                ...currentItem,
                                                product_key: val,
                                                product_key_nombre: label
                                            });
                                        }}
                                        fetchFn={searchSatProducts}
                                        disabled={false}
                                        initialLabel={currentItem.product_key_nombre}
                                    />
                                    {currentItemErrors.product_key && <p className='text-[10px] text-destructive font-bold mt-1 uppercase'>{currentItemErrors.product_key}</p>}
                                </div>
                                <div className='lg:col-span-4 sm:col-span-2'>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>Objeto Impuesto *</Label>
                                    <ComboboxDropdown
                                        key={`obj-${currentItem.objeto_imp}-${currentItem.product_id}`}
                                        defaultValue={currentItem.objeto_imp}
                                        onValueChange={val => setCurrentItem({ ...currentItem, objeto_imp: val })}
                                        items={TAXABILITY_CATALOG}
                                    />
                                    {currentItemErrors.objeto_imp && <p className='text-[10px] text-destructive font-bold mt-1 uppercase'>{currentItemErrors.objeto_imp}</p>}
                                </div>


                                <div className='lg:col-span-2 sm:col-span-1'>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>Cantidad *</Label>
                                    <Input type='number' value={currentItem.quantity} onChange={e => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })} className='bg-white text-center focus-visible:ring-orange-500' />
                                    {currentItemErrors.quantity && <p className='text-[10px] text-destructive font-bold mt-1 uppercase'>{currentItemErrors.quantity}</p>}
                                </div>
                                <div className='lg:col-span-2 sm:col-span-1'>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>Precio Unitario *</Label>
                                    <Input
                                        type='number'
                                        step='any'
                                        value={currentItem.price}
                                        onChange={e => setCurrentItem({ ...currentItem, price: Number(e.target.value) })}
                                        className='bg-white focus-visible:ring-orange-500'
                                    />
                                    {currentItemErrors.price && <p className='text-[10px] text-destructive font-bold mt-1 uppercase'>{currentItemErrors.price}</p>}
                                </div>
                                <div className='lg:col-span-2 sm:col-span-1'>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>Tipo Descuento</Label>
                                    <ComboboxDropdown
                                        defaultValue={currentItem.discount_type || 'amount'}
                                        onValueChange={val => setCurrentItem({ ...currentItem, discount_type: val as 'amount' | 'percentage' })}
                                        items={[
                                            { label: '$ (Monto)', value: 'amount' },
                                            { label: '% (Porcentaje)', value: 'percentage' }
                                        ]}
                                    />
                                </div>
                                <div className='lg:col-span-2 sm:col-span-1'>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase tracking-wider'>Descuento</Label>
                                    <Input type='number' step='any' value={currentItem.discount} onChange={e => setCurrentItem({ ...currentItem, discount: Number(e.target.value) })} className='focus-visible:ring-orange-500' />
                                </div>
                                <div className='lg:col-span-4 sm:col-span-2 flex items-center justify-center'>
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox
                                            id='tax_included'
                                            checked={currentItem.tax_included}
                                            onCheckedChange={val => setCurrentItem({ ...currentItem, tax_included: !!val })}
                                        />
                                        <Label htmlFor='tax_included' className='text-xs font-black text-slate-500 uppercase cursor-pointer'>Impuestos incluidos en el precio</Label>
                                    </div>
                                </div>

                            </div>


                            <div className='border rounded-xl overflow-hidden bg-white dark:bg-black/20 mt-2 border-zinc-200 dark:border-zinc-800 shadow-sm'>
                                <div className='bg-zinc-50/50 dark:bg-zinc-900/30 px-4 py-2 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800'>
                                    <span className='text-[10px] font-black text-slate-500 uppercase tracking-wider'>Impuestos del Concepto</span>
                                    {currentItem.local_taxes && currentItem.local_taxes.length > 0 && (
                                        <div className='flex items-center space-x-2'>
                                            <Switch
                                                checked={currentItem.use_local_taxes}
                                                onCheckedChange={val => setCurrentItem({ ...currentItem, use_local_taxes: val })}
                                                className='data-[state=checked]:bg-orange-600'
                                            />
                                            <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Usar Imp. Locales</Label>
                                        </div>
                                    )}
                                </div>
                                <Table className='text-[10px]'>
                                    <TableHeader className='bg-zinc-50/80 dark:bg-zinc-900/30 h-7'>
                                        <TableRow className='hover:bg-transparent border-none'>
                                            <TableHead className='h-7 py-0 px-4 font-black uppercase text-slate-400'>Tipo</TableHead>
                                            <TableHead className='h-7 py-0 px-4 font-black uppercase text-slate-400'>Impuesto</TableHead>
                                            <TableHead className='h-7 py-0 px-4 font-black uppercase text-slate-400 text-center'>Tasa</TableHead>
                                            <TableHead className='h-7 py-0 px-4 font-black uppercase text-slate-400'>Categoría</TableHead>
                                            <TableHead className='h-7 py-0 px-4 w-10'></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(() => {
                                            const combinedTaxes = [
                                                ...(currentItem.taxes || []).map((t: any) => ({ ...t, isLocal: false })),
                                                ...(currentItem.local_taxes || []).map((t: any) => ({ ...t, isLocal: true }))
                                            ];

                                            if (combinedTaxes.length === 0) {
                                                return (
                                                    <TableRow className='hover:bg-transparent border-slate-100 dark:border-zinc-800'>
                                                        <TableCell colSpan={6} className='py-4 px-4 text-center text-slate-400 italic'>Sin impuestos aplicados</TableCell>
                                                    </TableRow>
                                                );
                                            }

                                            return combinedTaxes.map((tax, i) => {
                                                const isLoc = (tax as any).isLocal;
                                                const isDisabled = isLoc && !currentItem.use_local_taxes;

                                                return (
                                                    <TableRow key={`taxrow-${i}`} className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-900/80 group border-zinc-100 dark:border-zinc-800/50 transition-colors ${isDisabled ? 'opacity-40 grayscale' : ''}`}>
                                                        <TableCell className='py-2 px-4'>
                                                            {isLoc ? (
                                                                <Badge className='bg-blue-50 text-blue-600 border-blue-100 text-[8px] px-1 h-4 font-black uppercase'>Local</Badge>
                                                            ) : (
                                                                <Badge className='bg-orange-50 text-orange-600 border-orange-100 text-[8px] px-1 h-4 font-black uppercase'>Federal</Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className='py-2 px-4 font-bold text-slate-700 dark:text-zinc-200'>{tax.type}</TableCell>
                                                        <TableCell className='py-2 px-4 text-center font-bold text-slate-600 dark:text-zinc-400'>{tax.rate > 1 ? tax.rate : (tax.rate * 100).toFixed(2)}%</TableCell>
                                                        <TableCell className='py-2 px-4 text-[9px] uppercase font-black'>
                                                            {tax.withholding ? (
                                                                <span className='text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded'>Retención</span>
                                                            ) : (
                                                                <span className='text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded'>Traslado</span>
                                                            )}
                                                            {tax.factor === 'Exento' && <span className='ml-1 text-slate-400 font-bold'>(Exento)</span>}
                                                        </TableCell>
                                                        <TableCell className='py-2 px-4 text-right'>
                                                            <button
                                                                type='button'
                                                                disabled={isDisabled}
                                                                className='text-red-400 hover:text-red-600 transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-20'
                                                                onClick={() => {
                                                                    if (!isLoc) {
                                                                        removeTaxFromCurrent(i)
                                                                    } else {
                                                                        const localIndex = i - (currentItem.taxes?.length || 0)
                                                                        const newLocals = [...(currentItem.local_taxes || [])]
                                                                        newLocals.splice(localIndex, 1)
                                                                        setCurrentItem({ ...currentItem, local_taxes: newLocals })
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 size={13} className='text-rose-500' />
                                                            </button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            });
                                        })()}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className='pt-4 flex flex-col md:flex-row items-start md:items-center justify-between border-t border-slate-100 dark:border-zinc-800 gap-4'>
                                <div className='flex flex-wrap gap-2 items-center'>
                                    <Button type='button' variant='outline' size='sm' className='border-orange-200 text-orange-600 h-8 text-[11px] font-black uppercase' onClick={() => openTaxModal(true)}>
                                        + Agregar Impuesto
                                    </Button>
                                </div>
                                <div className='flex items-center gap-4 w-full md:w-auto'>
                                    <div className='text-right'>
                                        <p className='text-[9px] font-black text-slate-400 uppercase'>Importe Parcial</p>
                                        <p className='text-xl font-black text-slate-900 dark:text-zinc-100'>
                                            {(() => {
                                                const gross = (currentItem.quantity || 0) * (currentItem.price || 0)
                                                const disc = currentItem.discount_type === 'percentage'
                                                    ? gross * ((currentItem.discount || 0) / 100)
                                                    : (currentItem.discount || 0)
                                                const grossAfterDisc = gross - disc

                                                // Backtrack subtotal if tax is included
                                                let sub = grossAfterDisc
                                                if (currentItem.tax_included) {
                                                    const federalFactor = (currentItem.taxes || []).reduce((a: number, t: any) => {
                                                        const r = t.rate > 1 ? t.rate / 100 : t.rate
                                                        return a + (t.withholding ? -r : r)
                                                    }, 0)
                                                    const localFactor = currentItem.use_local_taxes
                                                        ? (currentItem.local_taxes || []).reduce((a: number, t: any) => {
                                                            const r = t.rate > 1 ? t.rate / 100 : t.rate
                                                            return a + (t.withholding ? -r : r)
                                                        }, 0) : 0
                                                    const divisor = 1 + federalFactor + localFactor
                                                    sub = divisor !== 0 ? grossAfterDisc / divisor : grossAfterDisc
                                                }

                                                const taxesTotal = (currentItem.taxes || []).reduce((acc: number, tax: any) => {
                                                    const rate = tax.rate > 1 ? tax.rate / 100 : tax.rate
                                                    const amount = sub * rate
                                                    return tax.withholding ? acc - amount : acc + amount
                                                }, 0)
                                                const localTaxesTotal = currentItem.use_local_taxes ? (currentItem.local_taxes || []).reduce((acc: number, tax: any) => {
                                                    const rate = tax.rate > 1 ? tax.rate / 100 : tax.rate
                                                    const amount = sub * rate
                                                    return tax.withholding ? acc - amount : acc + amount
                                                }, 0) : 0
                                                return (sub + taxesTotal + localTaxesTotal).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
                                            })()}
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
                                    <div className='rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 mt-4 shadow-sm'>
                                        <div className='bg-zinc-50/50 dark:bg-zinc-900/30 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800'>
                                            <span className='text-[10px] font-black text-slate-500 uppercase tracking-widest'>Conceptos Agregados ({fields.length})</span>
                                        </div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow className='bg-zinc-50/50 dark:bg-zinc-900/50'>
                                                    <TableHead className='text-[10px] font-black uppercase text-slate-500 py-3 px-4 w-[40px]'>#</TableHead>
                                                    <TableHead className='text-[10px] font-black uppercase text-slate-500 py-3 px-4'>Descripción</TableHead>
                                                    <TableHead className='text-[10px] font-black uppercase text-slate-500 py-3 px-4'>Clave SAT</TableHead>
                                                    <TableHead className='text-[10px] font-black uppercase text-slate-500 py-3 px-4 text-center'>Cant.</TableHead>
                                                    <TableHead className='text-[10px] font-black uppercase text-slate-500 py-3 px-4 text-right'>Precio</TableHead>
                                                    <TableHead className='text-[10px] font-black uppercase text-slate-500 py-3 px-4'>Unidad</TableHead>
                                                    <TableHead className='text-[10px] font-black uppercase text-slate-500 py-3 px-4 text-right'>Impuestos</TableHead>
                                                    <TableHead className='text-[10px] font-black uppercase text-slate-500 py-3 px-4'>SKU</TableHead>
                                                    <TableHead className='text-[10px] font-black uppercase text-slate-500 py-3 px-4 text-right'>Importe</TableHead>
                                                    <TableHead className='text-[10px] font-black uppercase text-slate-500 py-3 px-4 text-right w-[80px]'></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {fields.map((field, index) => {
                                                    const item = watchItems[index]
                                                    if (!item) return null

                                                    const objetoImpDesc = TAXABILITY_CATALOG.find((t: { value: string, label: string }) => t.value === item.objeto_imp)?.label || item.objeto_imp

                                                    return (
                                                        <TableRow key={field.id} className='hover:bg-zinc-50/80 dark:hover:bg-zinc-900/80 group border-zinc-100 dark:border-zinc-800/50 transition-colors'>
                                                            <TableCell className='py-3 px-4 text-[10px] font-black text-slate-400'>
                                                                {index + 1}
                                                            </TableCell>
                                                            <TableCell className='py-3 px-4 text-xs font-bold text-slate-900 dark:text-zinc-100'>
                                                                <div>{item.description}</div>
                                                                <div className='text-[9px] text-slate-400 font-medium mt-0.5'>{objetoImpDesc}</div>
                                                            </TableCell>
                                                            <TableCell className='py-3 px-4'>
                                                                <p className='text-xs font-bold text-slate-900 dark:text-zinc-100'>{item.product_key}</p>
                                                                <p className='text-[9px] text-slate-400 font-medium truncate max-w-[120px]'>{item.product_key_nombre}</p>
                                                            </TableCell>
                                                            <TableCell className='py-3 px-4 text-xs font-bold text-center text-slate-600 dark:text-zinc-400'>
                                                                {item.quantity}
                                                            </TableCell>
                                                            <TableCell className='py-3 px-4 text-xs font-bold text-right text-slate-900 dark:text-zinc-100'>
                                                                {item.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                            </TableCell>
                                                            <TableCell className='py-3 px-4'>
                                                                <p className='text-xs font-bold text-slate-900 dark:text-zinc-100'>{item.unit_name}</p>
                                                                <p className='text-[9px] text-slate-400 font-medium'>{item.unit_key}</p>
                                                            </TableCell>
                                                            <TableCell className='py-3 px-4 text-xs font-bold text-right'>
                                                                {(() => {
                                                                    const gross = (item.quantity || 0) * (item.price || 0)
                                                                    const itemDisc = item.discount_type === 'percentage'
                                                                        ? gross * ((item.discount || 0) / 100)
                                                                        : (item.discount || 0)
                                                                    const grossAfterDisc = gross - itemDisc
                                                                    let sub = grossAfterDisc
                                                                    if (item.tax_included) {
                                                                        const factor = [...(item.taxes || []), ...(item.local_taxes || [])].reduce((a: number, t: any) => {
                                                                            const r = t.rate > 1 ? t.rate / 100 : t.rate
                                                                            return a + (t.withholding ? -r : r)
                                                                        }, 0)
                                                                        sub = (1 + factor) !== 0 ? grossAfterDisc / (1 + factor) : grossAfterDisc
                                                                    }
                                                                    const taxAmt = [...(item.taxes || []), ...(item.local_taxes || [])].reduce((acc: number, t: any) => {
                                                                        const r = t.rate > 1 ? t.rate / 100 : t.rate
                                                                        return acc + (sub * r * (t.withholding ? -1 : 1))
                                                                    }, 0)
                                                                    return (
                                                                        <div className='flex flex-col items-end gap-1'>
                                                                            <span className='text-emerald-600 font-black'>{taxAmt.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                                                                            <span className={`text-[8px] font-black uppercase px-1 py-0.5 rounded ${item.tax_included ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                                                                {item.tax_included ? 'Incluido' : 'No incluido'}
                                                                            </span>
                                                                        </div>
                                                                    )
                                                                })()}
                                                            </TableCell>
                                                            <TableCell className='py-3 px-4 text-xs font-bold text-slate-600 dark:text-zinc-400'>
                                                                {item.sku || '-'}
                                                            </TableCell>
                                                            <TableCell className='py-3 px-4 text-sm font-black text-right text-slate-900 dark:text-zinc-100'>
                                                                {(() => {
                                                                    const gross = (item.quantity || 0) * (item.price || 0)
                                                                    const itemDisc = item.discount_type === 'percentage'
                                                                        ? gross * ((item.discount || 0) / 100)
                                                                        : (item.discount || 0)
                                                                    const grossAfterDisc = gross - itemDisc

                                                                    let itemSubtotal = grossAfterDisc
                                                                    if (item.tax_included) {
                                                                        const federalFactor = (item.taxes || []).reduce((a: number, t: any) => {
                                                                            const r = t.rate > 1 ? t.rate / 100 : t.rate
                                                                            return a + (t.withholding ? -r : r)
                                                                        }, 0)
                                                                        const localFactor = (item.local_taxes || []).reduce((a: number, t: any) => {
                                                                            const r = t.rate > 1 ? t.rate / 100 : t.rate
                                                                            return a + (t.withholding ? -r : r)
                                                                        }, 0)
                                                                        const divisor = 1 + federalFactor + localFactor
                                                                        itemSubtotal = divisor !== 0 ? grossAfterDisc / divisor : grossAfterDisc
                                                                    }

                                                                    const taxesTotal = (item.taxes || []).reduce((acc: number, tax: any) => {
                                                                        const rate = tax.rate > 1 ? tax.rate / 100 : tax.rate
                                                                        const amount = itemSubtotal * rate
                                                                        return tax.withholding ? acc - amount : acc + amount
                                                                    }, 0)
                                                                    const localTaxesTotal = (item.local_taxes || []).reduce((acc: number, tax: any) => {
                                                                        const rate = tax.rate > 1 ? tax.rate / 100 : tax.rate
                                                                        const amount = itemSubtotal * rate
                                                                        return tax.withholding ? acc - amount : acc + amount
                                                                    }, 0)
                                                                    return (itemSubtotal + taxesTotal + localTaxesTotal).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
                                                                })()}
                                                                {item.discount > 0 && (
                                                                    <p className='text-[9px] text-orange-600 font-bold'>
                                                                        Desc: {item.discount_type === 'percentage' ? `${item.discount}%` : `$${item.discount}`}
                                                                    </p>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className='py-3 px-4 text-right'>
                                                                <div className='flex justify-end gap-1'>
                                                                    <Button type='button' variant='ghost' size='icon' className='h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors' onClick={() => editItem(index)}>
                                                                        <Eye size={14} />
                                                                    </Button>
                                                                    <Button type='button' variant='ghost' size='icon' className='h-8 w-8 text-rose-500 hover:text-red-700 hover:bg-red-50 transition-colors' onClick={() => remove(index)}>
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
                                    {(LocalTrasladadosTotal > 0 || LocalRetenidosTotal > 0) && (
                                        <>
                                            {LocalTrasladadosTotal > 0 && (
                                                <TableRow className='hover:bg-transparent border-b border-slate-50 dark:border-zinc-900'>
                                                    <TableCell className='text-[10px] font-black uppercase text-slate-500 py-3'>Impuestos Locales Trasladados:</TableCell>
                                                    <TableCell className='text-right font-black text-slate-900 dark:text-white py-3'>
                                                        {LocalTrasladadosTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {LocalRetenidosTotal > 0 && (
                                                <TableRow className='hover:bg-transparent border-b border-slate-50 dark:border-zinc-900'>
                                                    <TableCell className='text-[10px] font-black uppercase text-slate-500 py-3'>Impuestos Locales Retenidos:</TableCell>
                                                    <TableCell className='text-right font-black text-slate-900 dark:text-white py-3'>
                                                        -{LocalRetenidosTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    )}
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
            <ClientCreateModal
                open={clientModalOpen}
                onOpenChange={setClientModalOpen}
                onSuccess={async (newClient) => {
                    setClientModalOpen(false)
                    const normalized = normalizeClient(newClient)
                    if (normalized) {
                        selectClient(normalized)
                    }
                    await refetchClients()
                }}
            />
            <ProductCreateModal
                open={productModalOpen}
                onOpenChange={setProductModalOpen}
                onSuccess={async (newProduct) => {
                    setProductModalOpen(false)
                    const normalized = normalizeProduct(newProduct)
                    if (normalized) {
                        selectProductFromCatalog(normalized)
                    }
                    await refetchProducts()
                }}
            />
        </Form >
    )
}
