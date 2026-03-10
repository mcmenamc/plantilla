import React, { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, Save, Zap, CreditCard, Loader2, MapPin, Users, ChevronDown, ChevronRight, Edit2, Info, Percent, ArrowUpRight, ArrowDownLeft, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ComboboxDropdown } from '@/components/combobox-dropdown'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import { useWorkCenterStore } from '@/stores/work-center-store'
import { getClientsByWorkCenter } from '@/features/clients/data/clients-api'
import { createInvoiceIngresoSchema, type CreateInvoiceIngresoPayload } from '../data/schema'
import {
    getCfdiUses,
    createInvoice,
    TAXABILITY_CATALOG,
    getPaymentForms
} from '../data/invoicing-api'
import { getSeriesConfig } from '@/features/series/data/series-api'
import { ClientCreateModal } from '@/features/clients/components/client-create-modal'
import { getTaxRegimes } from '@/features/work-centers/data/work-centers-api'

interface InvoiceFormPagoProps {
    onSubmitSuccess: () => void
    onCancel: () => void
}

export function InvoiceFormPago({ onSubmitSuccess, onCancel }: InvoiceFormPagoProps) {
    const queryClient = useQueryClient()
    const { selectedWorkCenterId } = useWorkCenterStore()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitType, setSubmitType] = useState<'draft' | 'pending'>('pending')
    const [clientModalOpen, setClientModalOpen] = useState(false)


    // State for In-Form Related Documents management
    const [expandedPaymentIndex, setExpandedPaymentIndex] = useState<number | null>(null)
    const [editingDocIndex, setEditingDocIndex] = useState<number | null>(null)
    const [modalErrors, setModalErrors] = useState<Record<string, string>>({})
    const [currentDoc, setCurrentDoc] = useState<any>({
        uuid: '',
        amount: 0,
        installment: 1,
        last_balance: 0,
        currency: 'MXN',
        exchange: 1,
        taxability: '01',
        taxes: []
    })
    // Data fetching
    const { data: clients = [], refetch: refetchClients } = useQuery({
        queryKey: ['clients', selectedWorkCenterId],
        queryFn: () => getClientsByWorkCenter(selectedWorkCenterId || ''),
        enabled: !!selectedWorkCenterId,
    })

    const [extraClients, setExtraClients] = useState<any[]>([])

    // Normalization helpers
    const normalizeClient = (c: any) => {
        if (!c) return null
        const id = c._id || c.id || (c.data && (c.data._id || c.data.id))
        if (!id) return null
        return {
            ...c,
            _id: id,
            razonSocial: c.razonSocial || c.razon_social || (c.data && (c.data.razonSocial || c.data.razon_social)) || '',
            rfc: c.rfc || (c.data && c.data.rfc) || '',
            default_invoice_use: c.default_invoice_use || (c.data && (c.data.default_invoice_use))
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

    const [paymentForms, setPaymentForms] = useState<{ label: string, value: string }[]>([])

    useEffect(() => {
        const loadCatalogs = async () => {
            const [pf] = await Promise.all([
                getPaymentForms(),
            ])
            setPaymentForms(pf)
        }
        loadCatalogs()
    }, [])

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
            status: 'pending',
            tipo: 'P',
            currency: 'MXN',
            exchange: 1,
            payment_method: 'PPD',
            payment_form: '99',
            use: 'CP01',
            export: '01',
            num_decimales: 2,
            date: 'now',
            customer_id: '',
            items: [
                {
                    quantity: 1,
                    description: 'Pago',
                    product_key: '84111506',
                    unit_key: 'ACT',
                    unit_name: 'Actividad',
                    price: 0,
                    taxability: '01'
                }
            ],
            payments: [
                {
                    payment_form: '03',
                    amount: 0,
                    currency: 'MXN',
                    exchange: 1,
                    date: new Date().toISOString().slice(0, 16),
                    numOperacion: '',
                    rfcEmisorCtaOrd: '',
                    nomBancoOrdExt: '',
                    ctaOrdenante: '',
                    rfcEmisorCtaBen: '',
                    ctaBeneficiario: '',
                    tipoCadPago: '',
                    certPago: '',
                    cadPago: '',
                    selloPago: '',
                    related_documents: []
                }
            ],
            relationship: '04',
            related_uuids: [],
            global: {
                periodicity: '01',
                months: format(new Date(), 'MM'),
                year: new Date().getFullYear()
            },
            comments: '',
            address: undefined,
            third_party: { legal_name: '', tax_id: '', tax_system: '', zip: '' },
            idempotency_key: '',
            external_id: '',
            pdf_options: {
                codes: true,
                product_key: true,
                round_unit_price: false,
                tax_breakdown: true,
                ieps_breakdown: true,
                render_carta_porte: false,
            }
        }
    })

    useEffect(() => {
        if (selectedWorkCenterId) {
            form.setValue('workCenterId', selectedWorkCenterId)
        }
    }, [selectedWorkCenterId, form])

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

    const { data: taxRegimes = [] } = useQuery({
        queryKey: ['tax-regimes-third-party'],
        queryFn: () => getTaxRegimes('Persona Moral'), // Default or dynamic if needed
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

    const { fields: paymentSessions, append: appendPayment, remove: removePayment } = useFieldArray({
        control: form.control,
        name: 'payments'
    })



    // Related Documents expansion/management Logic
    const toggleExpandPayment = (pIndex: number) => {
        if (expandedPaymentIndex === pIndex) {
            setExpandedPaymentIndex(null)
        } else {
            setExpandedPaymentIndex(pIndex)
            setEditingDocIndex(null)
            setModalErrors({})
            setCurrentDoc({
                uuid: '',
                amount: 0,
                installment: 1,
                last_balance: 0,
                currency: 'MXN',
                exchange: 1,
                taxability: '01',
                taxes: []
            })
        }
    }

    const startEditDoc = (pIndex: number, dIndex: number) => {
        const payment = form.getValues(`payments.${pIndex}`)
        if (!payment || !payment.related_documents[dIndex]) return

        setExpandedPaymentIndex(pIndex)
        setEditingDocIndex(dIndex)
        setCurrentDoc({ ...payment.related_documents[dIndex] })
    }

    const saveDoc = () => {
        if (expandedPaymentIndex === null) return

        // Inline Validation
        const errors: Record<string, string> = {}
        if (!currentDoc.uuid || currentDoc.uuid.length < 3) {
            errors.uuid = 'El UUID es obligatorio'
        } else if (currentDoc.uuid.length < 36) {
            errors.uuid = 'UUID no vÃ¡lido'
        }

        if (Number(currentDoc.amount) <= 0) {
            errors.amount = 'Debe ser mayor a 0'
        }
        if (Number(currentDoc.last_balance) <= 0) {
            errors.last_balance = 'El saldo anterior debe ser mayor a 0'
        }
        if (Number(currentDoc.amount) > Number(currentDoc.last_balance)) {
            errors.amount = 'El importe no puede ser mayor al saldo anterior'
        }

        if (currentDoc.taxability === '02' && (!currentDoc.taxes || currentDoc.taxes.length === 0)) {
            errors.taxes = 'Debe agregar al menos un impuesto si es objeto de impuesto'
        }

        if (currentDoc.taxability === '07') {
            const hasIepsTr = currentDoc.taxes?.some((t: any) => t.type === 'IEPS' && !t.withholding);
            const hasIva = currentDoc.taxes?.some((t: any) => t.type === 'IVA');
            if (!hasIepsTr) {
                errors.taxes = 'Para el objeto de impuesto "07", debes incluir al menos un IEPS de traslado.'
            } else if (hasIva) {
                errors.taxes = 'Para el objeto de impuesto "07", no se permite incluir IVA.'
            }
        }

        if (Object.keys(errors).length > 0) {
            setModalErrors(errors)
            return
        }

        const currentRelated = [...(form.getValues(`payments.${expandedPaymentIndex}.related_documents`) || [])]
        if (editingDocIndex !== null) {
            currentRelated[editingDocIndex] = { ...currentDoc }
        } else {
            currentRelated.push({ ...currentDoc })
        }
        form.setValue(`payments.${expandedPaymentIndex}.related_documents`, currentRelated)
        setEditingDocIndex(null)
    }

    const deleteDoc = (pIndex: number, dIndex: number) => {
        const payments = form.getValues('payments') || []
        if (!payments[pIndex]) return
        const currentRelated = [...(payments[pIndex].related_documents || [])]
        currentRelated.splice(dIndex, 1)
        form.setValue(`payments.${pIndex}.related_documents`, currentRelated)
    }



    const removeTaxFromDoc = (tIndex: number) => {
        const newTaxes = [...(currentDoc.taxes || [])]
        newTaxes.splice(tIndex, 1)
        setCurrentDoc({ ...currentDoc, taxes: newTaxes })
    }

    const onSubmit = async (values: CreateInvoiceIngresoPayload) => {
        const isDraft = values.status === 'draft' || submitType === 'draft'

        if (!isDraft) {
            let hasError = false
            if (!values.payments || values.payments.length === 0) {
                form.setError('payments', { message: 'Debe agregar al menos una sesiÃ³n de pago' })
                hasError = true
            } else {
                values.payments.forEach((_, idx) => {
                    const payments = form.getValues('payments')
                    const p = payments?.[idx]
                    if (!p?.related_documents || p.related_documents.length === 0) {
                        form.setError(`payments.${idx}.related_documents`, { message: 'Cada pago debe relacionar al menos una factura' })
                        hasError = true
                    }
                })
            }

            if (hasError) return
        }

        setIsSubmitting(true)
        try {
            const apiPayload: any = {
                workCenterId: values.workCenterId,
                customer_id: values.customer_id,
                tipo: 'P',
                folio_number: values.folio_number,
                series: values.series,
                date: values.date || 'now',
                use: values.use || 'CP01',
                payment_form: '99',
                payment_method: 'PPD',
                currency: 'XXX',
                num_decimales: 2,
                exchange: 1,
                export: values.export || '01',
                status: isDraft ? 'draft' : 'pending',
                external_id: values.external_id || undefined,
                idempotency_key: values.idempotency_key || undefined,
                address: values.address?.zip ? values.address : undefined,
                third_party: values.third_party?.tax_id ? values.third_party : undefined,
                pdf_options: values.pdf_options,
                items: [
                    {
                        quantity: 1,
                        description: 'PAGO',
                        product_key: '84111506',
                        price: 0,
                        tax_included: false,
                        taxability: '01',
                        unit_key: 'ACT',
                        unit_name: 'Actividad',
                        discount: 0,
                        discount_type: 'amount',
                        taxes: [],
                        local_taxes: []
                    }
                ],
                complements: (values.payments || []).map((p) => {
                    const mappedRelated = (p.related_documents || []).map((doc: any) => {
                        const previousBalance = Number(doc.last_balance)
                        const amountPaid = Number(doc.amount)

                        const docTaxes = (doc.taxes || []).map((t: any) => ({
                            type: t.type || 'IVA',
                            rate: t.rate > 1 ? t.rate / 100 : t.rate,
                            base: Number(t.base),
                            factor: t.factor || 'Tasa',
                            withholding: !!t.withholding
                        }))

                        const taxability = doc.taxability || (docTaxes.length > 0 ? '02' : '01')

                        const relatedDoc: any = {
                            uuid: doc.uuid,
                            amount: amountPaid,
                            installment: Number(doc.installment),
                            last_balance: previousBalance,
                            taxability: taxability,
                            currency: doc.currency || 'MXN',
                            exchange: Number(doc.exchange) || 1,
                            // Siempre incluir taxes (aunque sea []) para que el backend no falle con .map()
                            // taxability '01' = sin impuestos → taxes: []
                            // taxability '02' = con impuestos → taxes: [...]
                            taxes: taxability === '02' ? docTaxes : []
                        }

                        // Solo incluir folio_number y series si tienen valor
                        if (doc.folio_number) relatedDoc.folio_number = doc.folio_number
                        if (doc.series) relatedDoc.series = doc.series

                        return relatedDoc
                    })

                    const complement: any = {
                        payment_form: p.payment_form,
                        amount: Number(p.amount),
                        currency: p.currency || 'MXN',
                        exchange: Number(p.exchange) || 1,
                        date: p.date || undefined,
                        related_documents: mappedRelated
                    }

                    // Solo incluir campos opcionales de la sesión de pago si tienen valor
                    if (p.numOperacion) complement.numOperacion = p.numOperacion
                    if (p.rfcEmisorCtaOrd) complement.rfcEmisorCtaOrd = p.rfcEmisorCtaOrd
                    if (p.nomBancoOrdExt) complement.nomBancoOrdExt = p.nomBancoOrdExt
                    if (p.ctaOrdenante) complement.ctaOrdenante = p.ctaOrdenante
                    if (p.rfcEmisorCtaBen) complement.rfcEmisorCtaBen = p.rfcEmisorCtaBen
                    if (p.ctaBeneficiario) complement.ctaBeneficiario = p.ctaBeneficiario
                    if (p.tipoCadPago) complement.tipoCadPago = p.tipoCadPago
                    if (p.certPago) complement.certPago = p.certPago
                    if (p.cadPago) complement.cadPago = p.cadPago
                    if (p.selloPago) complement.selloPago = p.selloPago

                    return complement
                })
            }

            await createInvoice(apiPayload)
            toast.success(isDraft ? 'Borrador guardado' : 'Complemento de Pago generado exitosamente')
            queryClient.invalidateQueries({ queryKey: ['invoices', selectedWorkCenterId] })
            onSubmitSuccess()
        } catch (error: any) {
            console.error('Submit error:', error)
            const msg = error.response?.data?.message || error.message || 'Error al procesar el pago'
            toast.error(msg, {
                duration: 5000,
                className: 'font-bold uppercase text-xs'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const onInvalid = (errors: any) => {
        console.error('Validation errors:', errors)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className='space-y-8'>

                <div className='bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden'>
                    <div className='pb-4 px-4 md:px-6 pt-6 border-b border-slate-100 dark:border-zinc-900'>
                        <div className='flex items-center gap-2 text-slate-700 dark:text-zinc-300'>
                            <h3 className='text-sm font-medium uppercase tracking-wide'>Detalles del Pago (Complemento)</h3>
                        </div>
                    </div>
                    <div className='space-y-6 px-4 md:px-6 py-6'>
                        <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
                            {/* Cliente + Folio en la misma fila */}
                            <div className='md:col-span-9'>
                                <FormField
                                    control={form.control}
                                    name='customer_id'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-medium text-slate-500 uppercase'>Cliente *</FormLabel>
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

                            <div className='md:col-span-3'>
                                <p className='text-xs font-medium text-slate-500 uppercase mb-1.5'>Folio</p>
                                {seriesConfig?.enabled ? (
                                    <div className='flex h-9 items-center rounded-md border border-slate-200 bg-slate-50 px-3 dark:border-zinc-700 dark:bg-zinc-900'>
                                        <span className='text-sm font-semibold tracking-wider text-slate-700 uppercase dark:text-zinc-300'>
                                            {form.watch('series')}{form.watch('series') ? '-' : ''}{form.watch('folio_number') ?? '—'}
                                        </span>
                                    </div>
                                ) : (
                                    <div className='flex h-9 overflow-hidden rounded-md border border-input ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'>
                                        <FormField
                                            control={form.control}
                                            name='series'
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    value={field.value || ''}
                                                    placeholder='CP'
                                                    className='w-16 border-0 border-r border-input bg-muted/50 px-2 text-center text-sm font-semibold uppercase outline-none'
                                                />
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name='folio_number'
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type='number'
                                                    placeholder='123'
                                                    value={field.value ?? ''}
                                                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                                    className='flex-1 border-0 bg-transparent px-3 text-sm outline-none'
                                                />
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='pt-2'>
                            <div className='flex items-center gap-2 text-slate-800 dark:text-zinc-200 mb-4'>
                                <h4 className='text-xs font-medium text-slate-500 uppercase'>Información de Fecha</h4>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
                                <FormField
                                    control={form.control}
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
                                            <FormMessage />
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



                <Separator />

                <div className='bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6'>
                    <div className='space-y-4'>
                        <div className='flex items-center gap-2 border-b border-slate-100 dark:border-zinc-900 pb-2'>
                            <MapPin size={14} className='text-orange-600' />
                            <h4 className='text-[10px] font-medium uppercase text-slate-500 tracking-widest'>Domicilio de Expedición (Opcional)</h4>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <FormField control={form.control} name='address.zip' render={({ field }) => (
                                <FormItem><FormLabel className='text-[9px] font-medium uppercase text-slate-400'>CP *</FormLabel><Input {...field} value={field.value || ''} className='h-8 text-xs' /><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name='address.street' render={({ field }) => (
                                <FormItem><FormLabel className='text-[9px] font-medium uppercase text-slate-400'>Calle</FormLabel><Input {...field} value={field.value || ''} className='h-8 text-xs' /><FormMessage /></FormItem>
                            )} />
                            <div className='grid grid-cols-2 gap-2'>
                                <FormField control={form.control} name='address.exterior' render={({ field }) => (
                                    <FormItem><FormLabel className='text-[9px] font-medium uppercase text-slate-400'>Ext</FormLabel><Input {...field} value={field.value || ''} className='h-8 text-xs' /><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name='address.interior' render={({ field }) => (
                                    <FormItem><FormLabel className='text-[9px] font-medium uppercase text-slate-400'>Int</FormLabel><Input {...field} value={field.value || ''} className='h-8 text-xs' /><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name='address.neighborhood' render={({ field }) => (
                                <FormItem><FormLabel className='text-[9px] font-medium uppercase text-slate-400'>Colonia</FormLabel><Input {...field} value={field.value || ''} className='h-8 text-xs' /><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name='address.city' render={({ field }) => (
                                <FormItem><FormLabel className='text-[9px] font-medium uppercase text-slate-400'>Ciudad</FormLabel><Input {...field} value={field.value || ''} className='h-8 text-xs' /><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name='address.state' render={({ field }) => (
                                <FormItem><FormLabel className='text-[9px] font-medium uppercase text-slate-400'>Estado</FormLabel><Input {...field} value={field.value || ''} className='h-8 text-xs' /><FormMessage /></FormItem>
                            )} />
                        </div>
                    </div>
                </div>


                {/* Identifiers section */}
                <div className='bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden'>
                    <div className='bg-slate-50/50 dark:bg-zinc-900/30 px-6 py-3 flex items-center border-b border-slate-100 dark:border-zinc-900'>
                        <div className='flex items-center gap-2 text-slate-700 dark:text-zinc-300'>
                            <Info size={16} className='text-orange-600' />
                            <h3 className='text-xs font-medium uppercase tracking-wide'>Identificadores de Control</h3>
                        </div>
                    </div>
                    <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/10 dark:bg-zinc-900/10'>
                        <FormField control={form.control} name='external_id' render={({ field }) => (
                            <FormItem>
                                <FormLabel className='text-[10px] font-medium uppercase text-slate-500'>ID Externo (Relación propia)</FormLabel>
                                <Input {...field} value={field.value || ''} className='h-9 text-xs' placeholder='Ej. PED-001' />
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name='idempotency_key' render={({ field }) => (
                            <FormItem>
                                <FormLabel className='text-[10px] font-medium uppercase text-slate-500'>Clave Idempotencia (Evitar duplicados)</FormLabel>
                                <Input {...field} value={field.value || ''} className='h-9 text-xs' placeholder='Ej. unique-key-123' />
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>


                {/* Standing Third Party Section */}
                <div className='bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden'>
                    <div className='bg-slate-50/50 dark:bg-zinc-900/30 px-6 py-3 flex items-center justify-between border-b border-slate-100 dark:border-zinc-900'>
                        <div className='flex items-center gap-2 text-slate-700 dark:text-zinc-300'>
                            <Users size={16} className='text-orange-600' />
                            <h3 className='text-xs font-medium uppercase tracking-wide '>Información de Terceros (A Cuenta de Terceros)</h3>
                        </div>
                        <div className='flex items-center gap-4'>

                        </div>
                    </div>
                    <div className='p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/10 dark:bg-zinc-900/10'>
                        <div className='md:col-span-6 lg:col-span-4'>
                            <FormField control={form.control} name='third_party.legal_name' render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='text-[10px] font-medium uppercase text-slate-400'>Nombre/Razón Social *</FormLabel>
                                    <Input {...field} placeholder='Ej. Empresa' className='h-9 text-xs' value={field.value || ''} />
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className='md:col-span-6 lg:col-span-3'>
                            <FormField control={form.control} name='third_party.tax_id' render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='text-[10px] font-medium uppercase text-slate-400'>RFC *</FormLabel>
                                    <Input {...field} placeholder='ABCD010101XYZ' className='h-9 text-xs uppercase' value={field.value || ''} />
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className='md:col-span-12 lg:col-span-3'>
                            <FormField control={form.control} name='third_party.tax_system' render={({ field }) => (
                                <FormItem className='flex flex-col'>
                                    <FormLabel className='text-[10px] font-medium uppercase text-slate-400 mb-2'>Régimen Fiscal *</FormLabel>
                                    <FormControl>
                                        <ComboboxDropdown
                                            className='h-9 text-xs w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap'
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            items={taxRegimes}
                                            placeholder='601'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className='md:col-span-12 lg:col-span-2'>
                            <FormField control={form.control} name='third_party.zip' render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='text-[10px] font-medium uppercase text-slate-400'>Código Postal *</FormLabel>
                                    <Input {...field} placeholder='01234' className='h-9 text-xs' value={field.value || ''} />
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </div>
                </div>

                <div className='bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden'>
                    <div className='bg-slate-50/50 dark:bg-zinc-900/30 px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-900'>
                        <div className='flex items-center gap-2 text-slate-700 dark:text-zinc-300'>
                            <CreditCard size={16} className='text-orange-600' />
                            <h3 className='text-xs font-medium uppercase tracking-wide'>Complementos de Pago</h3>
                        </div>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            className='h-7 text-[10px] font-medium border-orange-200 text-orange-600 uppercase'
                            onClick={() => appendPayment({
                                payment_form: '03',
                                amount: 0,
                                currency: 'MXN',
                                exchange: 1,
                                date: new Date().toISOString().slice(0, 16),
                                numOperacion: '',
                                rfcEmisorCtaOrd: '',
                                nomBancoOrdExt: '',
                                ctaOrdenante: '',
                                rfcEmisorCtaBen: '',
                                ctaBeneficiario: '',
                                tipoCadPago: '',
                                certPago: '',
                                cadPago: '',
                                selloPago: '',
                                related_documents: []
                            })}
                        >
                            <Plus size={14} className='mr-1' /> Agregar Complemento
                        </Button>
                    </div>
                    <div className='p-0 overflow-x-auto'>
                        <Table className='min-w-[850px]'>
                            <TableHeader className='bg-slate-50 dark:bg-zinc-900'>
                                <TableRow>
                                    <TableHead className='text-[9px] font-medium uppercase py-2 w-48'>Forma de Pago</TableHead>
                                    <TableHead className='text-[9px] font-medium uppercase py-2 w-32 text-center'>Fecha</TableHead>
                                    <TableHead className='text-[9px] font-medium uppercase py-2 w-20 text-center'>Moneda</TableHead>
                                    <TableHead className='text-[9px] font-medium uppercase py-2 w-24 text-right'>Monto</TableHead>
                                    <TableHead className='text-[9px] font-medium uppercase py-2 text-center'>Documentos</TableHead>
                                    <TableHead className='text-[9px] font-medium uppercase py-2 w-10'></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paymentSessions.map((session, sIndex) => (
                                    <React.Fragment key={session.id}>
                                        <TableRow className='group border-orange-100 dark:border-orange-900/30'>
                                            <TableCell className='py-2'>
                                                <FormField
                                                    control={form.control as any}
                                                    name={`payments.${sIndex}.payment_form`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <ComboboxDropdown
                                                                className='h-8 text-xs'
                                                                defaultValue={field.value}
                                                                onValueChange={field.onChange}
                                                                items={paymentForms}
                                                            />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell className='py-2'>
                                                <FormField
                                                    control={form.control as any}
                                                    name={`payments.${sIndex}.date`}
                                                    render={({ field }) => (
                                                        <FormItem className='flex flex-col'>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant={"outline"}
                                                                        className={cn(
                                                                            "h-8 w-full justify-start text-left font-normal text-[10px] px-2",
                                                                            !field.value && "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        <CalendarIcon className="mr-1.5 h-3 w-3 text-orange-600" />
                                                                        {field.value ? format(new Date(field.value), "dd/MM/yy HH:mm", { locale: es }) : <span className="text-[9px]">Fecha...</span>}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30">
                                                                        <div className="flex items-center gap-2">
                                                                            <Clock className="h-3 w-3 text-orange-600" />
                                                                            <Label className="text-[10px] font-bold uppercase tracking-wider">Hora del Pago</Label>
                                                                            <Input
                                                                                type="time"
                                                                                step="1"
                                                                                className="h-8 text-xs ml-auto w-32"
                                                                                value={field.value ? field.value.split('T')[1] || '' : ''}
                                                                                onChange={(e) => {
                                                                                    const currentDate = field.value ? field.value.split('T')[0] : format(new Date(), 'yyyy-MM-dd');
                                                                                    field.onChange(`${currentDate}T${e.target.value}`);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={field.value ? new Date(field.value) : undefined}
                                                                        onSelect={(date) => {
                                                                            if (!date) return;
                                                                            const currentTime = field.value ? field.value.split('T')[1] || '00:00:00' : format(new Date(), 'HH:mm:ss');
                                                                            const formattedDate = format(date, 'yyyy-MM-dd');
                                                                            field.onChange(`${formattedDate}T${currentTime}`);
                                                                        }}
                                                                        initialFocus
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell className='py-2'>
                                                <FormField
                                                    control={form.control as any}
                                                    name={`payments.${sIndex}.currency`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <SelectTrigger className='h-8 text-xs uppercase bg-transparent border-slate-200'>
                                                                    <SelectValue placeholder='MXN' />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value='MXN'>MXN</SelectItem>
                                                                    <SelectItem value='USD'>USD</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell className='py-2'>
                                                <FormField
                                                    control={form.control as any}
                                                    name={`payments.${sIndex}.amount`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Input
                                                                type='number'
                                                                step='any'
                                                                {...field}
                                                                value={field.value || 0}
                                                                className='h-8 text-[11px] text-right bg-slate-50/50'
                                                            />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell className='py-2 text-center'>
                                                <FormField
                                                    control={form.control as any}
                                                    name={`payments.${sIndex}.related_documents`}
                                                    render={({ fieldState }) => (
                                                        <FormItem className='space-y-1'>
                                                            <Button
                                                                type='button'
                                                                variant='outline'
                                                                size='sm'
                                                                className={cn(
                                                                    'h-7 text-[10px] transition-all px-2',
                                                                    expandedPaymentIndex === sIndex
                                                                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                                                                        : fieldState.error
                                                                            ? 'border-destructive text-destructive hover:bg-destructive/10'
                                                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                                                )}
                                                                onClick={() => toggleExpandPayment(sIndex)}
                                                            >
                                                                {expandedPaymentIndex === sIndex ? <ChevronDown size={12} className='mr-1' /> : <ChevronRight size={12} className='mr-1' />}
                                                                Documentos ({(form.watch(`payments.${sIndex}.related_documents` as any) || []).length})
                                                            </Button>
                                                            {fieldState.error && (
                                                                <p className='text-[9px] text-destructive leading-tight'>{fieldState.error.message}</p>
                                                            )}
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell className='py-2 text-center'>
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-7 w-7 text-destructive hover:bg-destructive/10'
                                                    onClick={() => {
                                                        if (expandedPaymentIndex === sIndex) setExpandedPaymentIndex(null)
                                                        removePayment(sIndex)
                                                    }}
                                                    disabled={paymentSessions.length === 1}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>

                                        {/* Inline Related Documents Management */}
                                        {expandedPaymentIndex === sIndex && (
                                            <TableRow className='bg-slate-50/50 dark:bg-zinc-900/20'>
                                                <TableCell colSpan={6} className='p-0'>
                                                    <div className='p-6 space-y-6 border-b border-slate-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-300'>
                                                        <div className='flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4'>
                                                            <div>
                                                                <h3 className='text-xs font-medium text-slate-600 uppercase tracking-widest'>Detalles del Pago y Documentos</h3>
                                                                <p className='text-[10px] text-slate-400 mt-1 uppercase'>Gestione información bancaria y facturas que liquida este pago</p>
                                                            </div>
                                                            <Badge variant='outline' className='text-[10px] border-orange-200 text-orange-700 bg-orange-50 font-medium px-3 h-6'>
                                                                Pago #{sIndex + 1}
                                                            </Badge>
                                                        </div>

                                                        {/* New: Banking and Additional Payment Info */}
                                                        <div className='bg-white dark:bg-black p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4'>
                                                            <div className='flex items-center gap-2 border-b border-slate-100 dark:border-zinc-900 pb-2 mb-2'>
                                                                <CreditCard size={12} className='text-orange-600' />
                                                                <h4 className='text-[10px] font-medium text-slate-600 uppercase tracking-tighter'>Información Bancaria y Adicional</h4>
                                                            </div>

                                                            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                                                                <div className='space-y-1.5'>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`payments.${sIndex}.currency`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className='text-[10px] text-slate-400 uppercase'>Moneda</FormLabel>
                                                                                <FormControl>
                                                                                    <Input {...field} placeholder='MXN' className='h-9 text-xs uppercase' />
                                                                                </FormControl>
                                                                                <p className='text-[9px] text-slate-400 mt-1'>Moneda en que se recibió el pago (ISO 4217)</p>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className='space-y-1.5'>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`payments.${sIndex}.exchange`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className='text-[10px] text-slate-400 uppercase'>T.C.</FormLabel>
                                                                                <FormControl>
                                                                                    <Input type='number' step='any' {...field} className='h-9 text-xs' />
                                                                                </FormControl>
                                                                                <p className='text-[9px] text-slate-400 mt-1'>Tipo de cambio respecto al MXN</p>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className='md:col-span-2 space-y-1.5'>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`payments.${sIndex}.numOperacion`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className='text-[10px] text-slate-400 uppercase'>Num. Operación / Referencia</FormLabel>
                                                                                <FormControl>
                                                                                    <Input {...field} value={field.value || ''} placeholder='Ej. clave rastreo SPEI, folio cheque...' className='h-9 text-xs' />
                                                                                </FormControl>
                                                                                <p className='text-[9px] text-slate-400 mt-1'>Número de cheque, autorización, referencia SPEI u otro identificador</p>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                                                <div className='space-y-1.5'>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`payments.${sIndex}.rfcEmisorCtaOrd`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className='text-[10px] text-slate-400 uppercase'>RFC Banco Ordenante</FormLabel>
                                                                                <FormControl>
                                                                                    <Input {...field} value={field.value || ''} placeholder='Ej. BCMRMXMM' className='h-9 text-xs uppercase' />
                                                                                </FormControl>
                                                                                <p className='text-[9px] text-slate-400 mt-1'>RFC del banco o institución que emite la cuenta de origen</p>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className='space-y-1.5'>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`payments.${sIndex}.nomBancoOrdExt`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className='text-[10px] text-slate-400 uppercase'>Nombre Banco Ordenante</FormLabel>
                                                                                <FormControl>
                                                                                    <Input {...field} value={field.value || ''} placeholder='Ej. Bank of America' className='h-9 text-xs' />
                                                                                </FormControl>
                                                                                <p className='text-[9px] text-slate-400 mt-1'>Solo para bancos extranjeros sin RFC</p>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className='space-y-1.5'>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`payments.${sIndex}.ctaOrdenante`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className='text-[10px] text-slate-400 uppercase'>Cta. Ordenante</FormLabel>
                                                                                <FormControl>
                                                                                    <Input {...field} value={field.value || ''} placeholder='Ej. 012180012345678901' className='h-9 text-xs' />
                                                                                </FormControl>
                                                                                <p className='text-[9px] text-slate-400 mt-1'>Número de cuenta con la que se realizó el pago</p>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className='space-y-1.5'>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`payments.${sIndex}.rfcEmisorCtaBen`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className='text-[10px] text-slate-400 uppercase'>RFC Banco Beneficiario</FormLabel>
                                                                                <FormControl>
                                                                                    <Input {...field} value={field.value || ''} placeholder='Ej. BSMXMXMM' className='h-9 text-xs uppercase' />
                                                                                </FormControl>
                                                                                <p className='text-[9px] text-slate-400 mt-1'>RFC del banco o institución que recibe el pago</p>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className='md:col-span-2 space-y-1.5'>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`payments.${sIndex}.ctaBeneficiario`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className='text-[10px] text-slate-400 uppercase'>Cta. Beneficiario</FormLabel>
                                                                                <FormControl>
                                                                                    <Input {...field} value={field.value || ''} placeholder='Ej. 012180087654321001' className='h-9 text-xs' />
                                                                                </FormControl>
                                                                                <p className='text-[9px] text-slate-400 mt-1'>Número de cuenta donde se recibió el pago</p>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                                                                <div className='space-y-1.5'>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`payments.${sIndex}.tipoCadPago`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className='text-[10px] text-slate-400 uppercase'>Tipo Cadena Pago</FormLabel>
                                                                                <FormControl>
                                                                                    <ComboboxDropdown
                                                                                        className='h-9 text-xs'
                                                                                        defaultValue={field.value || ''}
                                                                                        onValueChange={field.onChange}
                                                                                        placeholder='No aplica'
                                                                                        items={[
                                                                                            { label: 'No aplica', value: '' },
                                                                                            { label: '01 - SPEI', value: '01' }
                                                                                        ]}
                                                                                    />
                                                                                </FormControl>
                                                                                <p className='text-[9px] text-slate-400 mt-1'>Solo requerido para pagos vía SPEI con cadena bancaria</p>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className='md:col-span-3 space-y-1.5'>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`payments.${sIndex}.cadPago`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className='text-[10px] text-slate-400 uppercase'>Cadena de Pago</FormLabel>
                                                                                <FormControl>
                                                                                    <Input {...field} value={field.value || ''} placeholder='Cadena original generada por el banco receptor...' className='h-9 text-xs' />
                                                                                </FormControl>
                                                                                <p className='text-[9px] text-slate-400 mt-1'>Cadena original del comprobante de pago emitida por la institución bancaria receptora</p>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className='md:col-span-2 space-y-1.5'>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`payments.${sIndex}.certPago`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className='text-[10px] text-slate-400 uppercase'>Certificado Pago (base64)</FormLabel>
                                                                                <FormControl>
                                                                                    <Textarea {...field} value={field.value || ''} placeholder='Certificado en formato base64...' className='min-h-[60px] text-[10px] font-mono' />
                                                                                </FormControl>
                                                                                <p className='text-[9px] text-slate-400 mt-1'>Certificado correspondiente al pago en base64</p>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className='md:col-span-2 space-y-1.5'>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`payments.${sIndex}.selloPago`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className='text-[10px] text-slate-400 uppercase'>Sello Pago (base64)</FormLabel>
                                                                                <FormControl>
                                                                                    <Textarea {...field} value={field.value || ''} placeholder='Sello digital en formato base64...' className='min-h-[60px] text-[10px] font-mono' />
                                                                                </FormControl>
                                                                                <p className='text-[9px] text-slate-400 mt-1'>Sello digital asociado al pago, emitido por el banco receptor</p>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className='flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2'>
                                                            <div className='p-1 rounded-full bg-orange-100 dark:bg-orange-900/30'>
                                                                <Zap size={10} className='text-orange-600' />
                                                            </div>
                                                            <h3 className='text-xs font-medium text-slate-600 uppercase tracking-widest'>Documentos Relacionados</h3>
                                                        </div>

                                                        {/* Error de validación: mínimo 1 documento */}
                                                        <FormField
                                                            control={form.control as any}
                                                            name={`payments.${sIndex}.related_documents`}
                                                            render={() => (
                                                                <FormItem>
                                                                    <FormMessage className='text-xs' />
                                                                </FormItem>
                                                            )}
                                                        />


                                                        <div className='grid grid-cols-1 md:grid-cols-7 gap-4 bg-white dark:bg-black p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm'>
                                                            <div className='md:col-span-2 space-y-1.5'>
                                                                <Label className='text-[10px] text-slate-400 uppercase'>Folio Fiscal (UUID) *</Label>
                                                                <Input
                                                                    placeholder='00000000-0000-0000-0000-000000000000'
                                                                    value={currentDoc.uuid}
                                                                    onChange={(e) => {
                                                                        setCurrentDoc({ ...currentDoc, uuid: e.target.value.trim() })
                                                                        setModalErrors(prev => ({ ...prev, uuid: '' }))
                                                                    }}
                                                                    className={cn('h-9 text-[11px] font-mono tracking-tighter', modalErrors.uuid && 'border-destructive')}
                                                                />
                                                                {modalErrors.uuid && <p className='text-[10px] text-destructive'>{modalErrors.uuid}</p>}
                                                            </div>
                                                            <div className='space-y-1.5'>
                                                                <Label className='text-[10px] text-slate-400 uppercase'>Parc.</Label>
                                                                <Input
                                                                    type='number'
                                                                    value={currentDoc.installment}
                                                                    onChange={(e) => setCurrentDoc({ ...currentDoc, installment: Number(e.target.value) })}
                                                                    className='h-9 text-xs text-center'
                                                                />
                                                            </div>
                                                            <div className='space-y-1.5'>
                                                                <Label className='text-[10px] text-slate-400 uppercase'>Saldo Ant.</Label>
                                                                <Input
                                                                    type='number'
                                                                    step='any'
                                                                    value={currentDoc.last_balance}
                                                                    onChange={(e) => setCurrentDoc({ ...currentDoc, last_balance: Number(e.target.value) })}
                                                                    className='h-9 text-xs text-right'
                                                                />
                                                            </div>
                                                            <div className='space-y-1.5'>
                                                                <Label className='text-[10px] text-slate-400 uppercase'>Pagado *</Label>
                                                                <Input
                                                                    type='number'
                                                                    step='any'
                                                                    value={currentDoc.amount}
                                                                    onChange={(e) => {
                                                                        setCurrentDoc({ ...currentDoc, amount: Number(e.target.value) })
                                                                        setModalErrors(prev => ({ ...prev, amount: '' }))
                                                                    }}
                                                                    className={cn('h-9 text-xs text-right bg-orange-50/30 border-orange-100', modalErrors.amount && 'border-destructive')}
                                                                />
                                                            </div>
                                                            <div className='space-y-1.5'>
                                                                <Label className='text-[10px] text-slate-400 uppercase'>Objeto Imp.</Label>
                                                                <ComboboxDropdown
                                                                    className='h-9 text-xs'
                                                                    defaultValue={currentDoc.taxability}
                                                                    onValueChange={(val) => setCurrentDoc({ ...currentDoc, taxability: val })}
                                                                    items={TAXABILITY_CATALOG}
                                                                />
                                                            </div>
                                                            <div className='flex items-end'>
                                                                <Button
                                                                    className='w-full h-9 text-xs uppercase bg-orange-600 hover:bg-orange-700 text-white shadow-sm'
                                                                    type='button' onClick={saveDoc}
                                                                >
                                                                    {editingDocIndex !== null ? 'Guardar' : 'Agregar'}
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Taxes Selection */}
                                                        <div className='p-4 rounded-xl border border-orange-100 bg-orange-50/10 space-y-4'>
                                                            <div className='flex items-center justify-between'>
                                                                <div className='flex items-center gap-2'>
                                                                    <Percent size={12} className='text-orange-600' />
                                                                    <h4 className='text-[10px] font-medium text-slate-600 uppercase tracking-tighter'>Impuestos rápidos</h4>
                                                                </div>
                                                                {currentDoc.taxability === '02' && <p className='text-[9px] text-orange-600 uppercase font-medium'>Objeto de impuesto activo</p>}
                                                            </div>

                                                            <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                                                                <Button
                                                                    type='button'
                                                                    variant='outline'
                                                                    onClick={() => {
                                                                        const newTax = { type: 'IVA', rate: 0.16, base: Number(currentDoc.last_balance) || 0, factor: 'Tasa', withholding: false };
                                                                        setCurrentDoc({ ...currentDoc, taxability: '02', taxes: [newTax] });
                                                                    }}
                                                                    className={cn(
                                                                        'h-10 text-[10px] uppercase border-dashed hover:border-solid hover:bg-orange-600 hover:text-white transition-all',
                                                                        currentDoc.taxes?.some((t: any) => t.type === 'IVA' && t.rate === 0.16 && !t.withholding) && 'border-orange-600 bg-orange-50 text-orange-700 border-solid'
                                                                    )}
                                                                >
                                                                    IVA 16%
                                                                </Button>
                                                                <Button
                                                                    type='button'
                                                                    variant='outline'
                                                                    onClick={() => {
                                                                        const newTax = { type: 'IVA', rate: 0.106667, base: Number(currentDoc.last_balance) || 0, factor: 'Tasa', withholding: true };
                                                                        setCurrentDoc({ ...currentDoc, taxability: '02', taxes: [...(currentDoc.taxes || []), newTax] });
                                                                    }}
                                                                    className='h-10 text-[10px] uppercase border-dashed hover:border-solid hover:bg-orange-600 hover:text-white'
                                                                >
                                                                    IVA RET (10.6%)
                                                                </Button>
                                                                <Button
                                                                    type='button'
                                                                    variant='outline'
                                                                    onClick={() => {
                                                                        const newTax = { type: 'ISR', rate: 0.10, base: Number(currentDoc.last_balance) || 0, factor: 'Tasa', withholding: true };
                                                                        setCurrentDoc({ ...currentDoc, taxability: '02', taxes: [...(currentDoc.taxes || []), newTax] });
                                                                    }}
                                                                    className='h-10 text-[10px] uppercase border-dashed hover:border-solid hover:bg-orange-600 hover:text-white'
                                                                >
                                                                    ISR RET (10%)
                                                                </Button>
                                                                <Button
                                                                    type='button'
                                                                    variant='outline'
                                                                    onClick={() => setCurrentDoc({ ...currentDoc, taxability: '01', taxes: [] })}
                                                                    className='h-10 text-[10px] uppercase border-dashed hover:border-solid hover:bg-slate-600 hover:text-white'
                                                                >
                                                                    Limpiar / No Objeto
                                                                </Button>
                                                            </div>

                                                            {currentDoc.taxes && currentDoc.taxes.length > 0 && (
                                                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2'>
                                                                    {currentDoc.taxes.map((t: any, idx: number) => (
                                                                        <div key={idx} className='flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-white dark:bg-zinc-900/50 shadow-sm'>
                                                                            <div className='flex items-center gap-2'>
                                                                                <div className={cn(
                                                                                    'p-1.5 rounded-md',
                                                                                    t.withholding ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-600'
                                                                                )}>
                                                                                    {t.withholding ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                                                                                </div>
                                                                                <div>
                                                                                    <p className='text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase leading-none'>{t.type} {(t.rate * 100).toFixed(0)}%</p>
                                                                                    <p className='text-[9px] text-slate-400 uppercase leading-none mt-1'>{t.withholding ? 'Retención' : 'Traslado'}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className='flex items-center gap-3'>
                                                                                <p className='text-[10px] font-medium text-slate-600 dark:text-slate-400'>
                                                                                    {(Number(t.base) * Number(t.rate)).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                                                                </p>
                                                                                <Trash2
                                                                                    size={12}
                                                                                    className='text-destructive cursor-pointer hover:text-red-600 transition-colors'
                                                                                    onClick={() => removeTaxFromDoc(idx)}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {modalErrors.taxes && <p className='text-[10px] text-destructive'>{modalErrors.taxes}</p>}
                                                        </div>

                                                        {/* Related Documents Table */}
                                                        <div className='rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-black'>
                                                            <Table>
                                                                <TableHeader className='bg-slate-50 dark:bg-zinc-900'>
                                                                    <TableRow>
                                                                        <TableHead className='text-[9px] uppercase py-2'>UUID</TableHead>
                                                                        <TableHead className='text-[9px] uppercase py-2 w-20 text-center'>Parc.</TableHead>
                                                                        <TableHead className='text-[9px] uppercase py-2 w-28 text-right'>Saldo Ant.</TableHead>
                                                                        <TableHead className='text-[9px] uppercase py-2 w-28 text-right'>Pagado</TableHead>
                                                                        <TableHead className='text-[9px] uppercase py-2 w-28 text-right'>Nuevo Saldo</TableHead>
                                                                        <TableHead className='w-20'></TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {(form.watch(`payments.${sIndex}.related_documents` as any) || []).map((doc: any, dIndex: number) => {
                                                                        const nextBalance = Number(doc.last_balance) - Number(doc.amount)
                                                                        return (
                                                                            <TableRow key={dIndex} className='hover:bg-slate-50/50 transition-colors'>
                                                                                <TableCell className='py-2 truncate max-w-[150px] text-[10px] font-mono text-slate-500 uppercase'>{doc.uuid}</TableCell>
                                                                                <TableCell className='py-2 text-center text-xs'>{doc.installment}</TableCell>
                                                                                <TableCell className='py-2 text-right text-xs'>{doc.last_balance?.toLocaleString('es-MX', { style: 'currency', currency: doc.currency })}</TableCell>
                                                                                <TableCell className='py-2 text-right text-xs text-orange-600 font-medium'>{doc.amount?.toLocaleString('es-MX', { style: 'currency', currency: doc.currency })}</TableCell>
                                                                                <TableCell className='py-2 text-right text-xs text-slate-400'>{nextBalance.toLocaleString('es-MX', { style: 'currency', currency: doc.currency })}</TableCell>
                                                                                <TableCell className='py-2'>
                                                                                    <div className='flex gap-1 justify-end'>
                                                                                        <Button variant='ghost' size='icon' className='h-6 w-6 text-slate-400 hover:text-orange-600' type='button' onClick={() => startEditDoc(sIndex, dIndex)}>
                                                                                            <Edit2 size={12} />
                                                                                        </Button>
                                                                                        <Button variant='ghost' size='icon' className='h-6 w-6 text-slate-400 hover:text-destructive' type='button' onClick={() => deleteDoc(sIndex, dIndex)}>
                                                                                            <Trash2 size={12} />
                                                                                        </Button>
                                                                                    </div>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        )
                                                                    })}
                                                                    {(form.watch(`payments.${sIndex}.related_documents` as any) || []).length === 0 && (
                                                                        <TableRow>
                                                                            <TableCell colSpan={6} className='py-8 text-center text-slate-400 text-[10px] uppercase italic'>No hay documentos relacionados</TableCell>
                                                                        </TableRow>
                                                                    )}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))}
                                {paymentSessions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className='text-center py-12 text-slate-400 uppercase text-xs font-medium italic'>
                                            No se han agregado complementos de pago
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
                    <div className='md:col-span-12'>
                        <div className='rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden shadow-sm'>
                            <div className='p-6'>
                                <FormField
                                    control={form.control as any}
                                    name='comments'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-xs font-medium text-slate-500 uppercase tracking-wider'>Notas del Pago</FormLabel>
                                            <Textarea placeholder='Información adicional sobre la transferencia, cheque, etc...' className='min-h-[100px]' {...field} value={field.value || ''} />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='md:col-span-12 lg:col-span-7 space-y-4'>
                        <div className='flex items-center gap-4'>
                            <Button type='button' variant='outline' className='text-slate-500'
                                onClick={() => {
                                    setSubmitType('draft')
                                    form.setValue('status', 'draft')
                                    form.handleSubmit(onSubmit as any)()
                                }}
                            >
                                <Save className='mr-2 h-4 w-4' /> Guardar Borrador
                            </Button>
                            <Button type='button' variant='ghost' className='text-slate-400 hover:text-slate-600'
                                onClick={onCancel}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>

                    <div className='md:col-span-12 lg:col-span-5'>
                        <div className='rounded-xl border border-slate-200 bg-white dark:bg-black overflow-hidden shadow-sm'>
                            <Table>
                                <TableBody>
                                    <TableRow className='bg-orange-600 hover:bg-orange-600'>
                                        <TableCell className='text-[11px] font-medium uppercase text-white py-4'>Total Pagado (Acumulado)</TableCell>
                                        <TableCell className='text-right text-xl font-medium text-white py-4'>
                                            {paymentSessions.reduce((acc, _, idx) => acc + (Number(form.watch(`payments.${idx}.amount` as any)) || 0), 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                        <Button
                            type='submit'
                            className='w-full bg-orange-600 hover:bg-orange-700 text-white font-medium h-12 rounded-xl mt-4 shadow-xl'
                            disabled={isSubmitting}
                            onClick={() => {
                                setSubmitType('pending')
                                form.setValue('status', 'pending')
                            }}
                        >
                            <Zap className='mr-2 h-4 w-4' strokeWidth={2} /> GENERAR PAGO CFDI
                        </Button>
                    </div>
                </div>
            </form>

            {
                isSubmitting && (
                    <div className='fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm'>
                        <Loader2 className='h-12 w-12 text-orange-600 animate-spin' strokeWidth={2.5} />
                        <p className='mt-4 text-sm font-medium text-slate-900 dark:text-white uppercase tracking-widest'>
                            {submitType === 'draft' ? 'Guardando Borrador' : 'Generando Comprobante'}
                        </p>
                    </div>
                )
            }

            <ClientCreateModal
                open={clientModalOpen}
                onOpenChange={setClientModalOpen}
                onSuccess={async (newClient) => {
                    setClientModalOpen(false)
                    const normalized = normalizeClient(newClient)
                    if (normalized) selectClient(normalized)
                    await refetchClients()
                }}
            />
        </Form >
    )
}
