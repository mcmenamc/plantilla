import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, Save, Zap, Truck, Loader2, CalendarIcon, FileStack, Globe } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ComboboxDropdown } from '@/components/combobox-dropdown'
import { RemoteCombobox } from '@/components/remote-combobox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useWorkCenterStore } from '@/stores/work-center-store'
import { getClientsByWorkCenter } from '@/features/clients/data/clients-api'
import { getSeriesConfig } from '@/features/series/data/series-api'
import { createInvoice, getExportationOptions, getCfdiUses, getRelationTypes, CLAVE_UNIDAD_PESO_CATALOG } from '../data/invoicing-api'
import { searchSatProducts, searchSatUnits, getProductosByWorkCenter } from '@/features/products/data/products-api'
import { ClientCreateModal } from '@/features/clients/components/client-create-modal'
import { ProductCreateModal } from '@/features/products/components/product-create-modal'
import { Switch } from '@/components/ui/switch'

// ─── Schema ────────────────────────────────────────────────────────────────────
const trasladoItemSchema = z.object({
    product_key: z.string().min(1, 'Clave SAT requerida'),
    product_key_label: z.string().optional(),
    description: z.string().min(1, 'Descripción requerida'),
    unit_key: z.string().min(1, 'Clave unidad requerida'),
    unit_name: z.string().optional(),
    quantity: z.coerce.number().min(0.001, 'Cantidad debe ser mayor a 0').default(1),
    weight: z.coerce.number().min(0.001, 'Peso requerido (kg)').default(1),
    sku: z.string().optional(),
    customs_keys: z.string().optional(),
    // Comercio exterior info
    valor_dolares: z.coerce.number().optional(),
    fraccion_arancelaria: z.string().optional(),
    cantidad_aduana: z.coerce.number().optional(),
    unidad_aduana: z.string().optional(),
    valor_unitario_aduana: z.coerce.number().optional(),
    marca: z.string().optional(),
    modelo: z.string().optional(),
    submodelo: z.string().optional(),
    numero_serie: z.string().optional(),
})

const relatedDocumentSchema = z.object({
    relationship: z.string().min(1, 'Relación requerida'),
    uuid: z.string().min(1, 'Folio fiscal requerido')
})

const locationSchema = z.object({
    TipoUbicacion: z.string().min(1, 'Origen o Destino requerido'),
    RFCRemitenteDestinatario: z.string().min(1, 'RFC requerido'),
    FechaHoraSalidaLlegada: z.string().min(1, 'Fecha/Hora requerida'),
    DistanciaRecorrida: z.coerce.number().optional(),
    Domicilio: z.object({
        Estado: z.string().min(1, 'Estado requerido'),
        Pais: z.string().default('MEX'),
        CodigoPostal: z.string().min(5, 'CP requerido'),
        Calle: z.string().min(1, 'Calle requerida'),
        Municipio: z.string().optional(),
    }).optional()
})

const cartaPorteSchema = z.object({
    enabled: z.boolean().default(false),
    TranspInternac: z.enum(['Sí', 'No']).default('No'),
    UnidadPeso: z.string().default('KGM'),
    IdCCP: z.string().optional(),
    Ubicaciones: z.array(locationSchema).default([]),
})

const comercioExteriorSchema = z.object({
    enabled: z.boolean().default(false),
    ClaveDePedimento: z.string().default('A1'),
    CertificadoOrigen: z.enum(['0', '1']).default('0'),
    NumCertificadoOrigen: z.string().optional(),
    NumeroExportadorConfiable: z.string().optional(),
    Incoterm: z.string().optional(),
    Observaciones: z.string().optional(),
    TipoCambioUSD: z.coerce.number().optional(),
    TotalUSD: z.coerce.number().optional(),
    MotivoTraslado: z.string().default('01'),
    propietario_id: z.string().optional(),
    receptor_id: z.string().optional(),
    destinatario_id: z.string().optional(),
})

const createInvoiceTrasladoSchema = z.object({
    workCenterId: z.string(),
    customer_id: z.string().min(1, 'Selecciona un cliente'),
    date: z.string().optional(),
    use: z.string().default('G01'),
    currency: z.string().default('MXN'),
    export: z.string().default('01'),
    items: z.array(trasladoItemSchema).min(1, 'Agrega al menos un concepto'),
    related_documents: z.array(relatedDocumentSchema).optional(),
    carta_porte: cartaPorteSchema.optional(),
    comercio_exterior: comercioExteriorSchema.optional(),
})

type CreateInvoiceTrasladoPayload = z.infer<typeof createInvoiceTrasladoSchema>

interface ItemDraft {
    product_id?: string
    product_key: string
    product_key_label: string
    description: string
    unit_key: string
    unit_name: string
    quantity: number
    weight: number
    sku: string
    customs_keys: string
    // Comercio Exterior
    valor_dolares?: number
    fraccion_arancelaria?: string
    cantidad_aduana?: number
    unidad_aduana?: string
    valor_unitario_aduana?: number
    marca?: string
    modelo?: string
    submodelo?: string
    numero_serie?: string
}

const emptyDraft: ItemDraft = {
    product_id: '',
    product_key: '',
    product_key_label: '',
    description: '',
    unit_key: '',
    unit_name: '',
    quantity: 1,
    weight: 1,
    sku: '',
    customs_keys: '',
    valor_dolares: 0,
    fraccion_arancelaria: '',
    cantidad_aduana: 0,
    unidad_aduana: '',
    valor_unitario_aduana: 0,
    marca: '',
}

// ─── Component ─────────────────────────────────────────────────────────────────
interface Props {
    onSubmitSuccess: () => void
    onCancel: () => void
}

export function InvoiceFormTraslado({ onSubmitSuccess, onCancel }: Props) {
    const queryClient = useQueryClient()
    const { selectedWorkCenterId } = useWorkCenterStore()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitType, setSubmitType] = useState<'draft' | 'pending'>('pending')
    const [clientModalOpen, setClientModalOpen] = useState(false)
    const [productModalOpen, setProductModalOpen] = useState(false)
    const [extraClients, setExtraClients] = useState<any[]>([])
    const [extraProducts, setExtraProducts] = useState<any[]>([])
    const [draft, setDraft] = useState<ItemDraft>(emptyDraft)
    const [draftErrors, setDraftErrors] = useState<Partial<Record<keyof ItemDraft, string>>>({})
    const [showRelatedDocs, setShowRelatedDocs] = useState(false)

    // ─── Queries ───────────────────────────────────────────────────────────────
    const { data: clients = [], refetch: refetchClients } = useQuery({
        queryKey: ['clients', selectedWorkCenterId],
        queryFn: () => getClientsByWorkCenter(selectedWorkCenterId || ''),
        enabled: !!selectedWorkCenterId,
    })

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

    const { data: seriesData } = useQuery({
        queryKey: ['series-config', selectedWorkCenterId],
        queryFn: () => getSeriesConfig(selectedWorkCenterId || ''),
        enabled: !!selectedWorkCenterId,
    })

    const { data: exportOptions = [] } = useQuery({
        queryKey: ['export-options'],
        queryFn: getExportationOptions,
    })

    const { data: cfdiUses = [] } = useQuery({
        queryKey: ['cfdi-uses'],
        queryFn: () => getCfdiUses(),
    })

    const { data: relationTypes = [] } = useQuery({
        queryKey: ['relation-types'],
        queryFn: getRelationTypes,
    })

    // Serie/folio para tipo T
    const serieConfig = seriesData?.data
    const serieT = serieConfig?.isPerType ? serieConfig?.typeConfigs?.T : serieConfig?.globalConfig
    const seriePrefix = serieT?.prefix || 'T'
    const serieFolio = serieT?.next_folio || 1

    const normalizeClient = (c: any) => {
        if (!c) return null
        const id = c._id || c.id || (c.data && (c.data._id || c.data.id))
        if (!id) return null
        return {
            ...c,
            _id: id,
            razonSocial: c.razonSocial || c.razon_social || '',
            rfc: c.rfc || '',
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
            sku: p.sku || (p.data && p.data.sku) || '',
        }
    }

    const selectProductFromCatalog = (prod: any) => {
        const p = normalizeProduct(prod)
        if (!p) return

        setDraft({
            ...draft,
            product_id: p.productIdFacturaApi || p._id,
            description: p.description,
            product_key: p.product_key,
            product_key_label: p.product_key_nombre || '',
            unit_key: p.unit_key,
            unit_name: p.unit_name,
            sku: p.sku || '',
        })

        // Cleanup errors
        setDraftErrors(prev => ({
            ...prev,
            description: undefined,
            product_key: undefined,
            unit_key: undefined
        }))

        // Ensure we add it to the extra products
        setExtraProducts(prev => {
            const id = p.productIdFacturaApi || p._id
            if (prev.some(item => (item.productIdFacturaApi || item._id) === id)) return prev
            return [p, ...prev]
        })
    }

    const allClients = [...clients, ...extraClients]
        .map(normalizeClient)
        .filter(Boolean)
        .filter((c, i, arr) => arr.findIndex(x => x!._id === c!._id) === i)

    // ─── Form ──────────────────────────────────────────────────────────────────
    const form = useForm<CreateInvoiceTrasladoPayload>({
        resolver: zodResolver(createInvoiceTrasladoSchema) as any,
        defaultValues: {
            workCenterId: selectedWorkCenterId || '',
            customer_id: '',
            date: '',
            use: 'G01',
            currency: 'MXN',
            export: '01',
            items: [],
            related_documents: [],
            carta_porte: {
                enabled: false,
                TranspInternac: 'No',
                UnidadPeso: 'KGM',
                IdCCP: '',
                Ubicaciones: [],
            },
            comercio_exterior: {
                enabled: false,
                ClaveDePedimento: 'A1',
                CertificadoOrigen: '0',
                MotivoTraslado: '01',
            }
        },
    })

    const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
        control: form.control,
        name: 'items',
    })

    const { fields: relatedDocFields, append: appendRelatedDoc, remove: removeRelatedDoc } = useFieldArray({
        control: form.control,
        name: 'related_documents',
    })

    const { fields: ubicacionFields, append: appendUbicacion, remove: removeUbicacion } = useFieldArray({
        control: form.control,
        name: 'carta_porte.Ubicaciones',
    })

    // ─── Draft validation & add ────────────────────────────────────────────────
    const validateDraft = (): boolean => {
        const errors: Partial<Record<keyof ItemDraft, string>> = {}
        if (!draft.product_key) errors.product_key = 'Selecciona clave SAT'
        if (!draft.description.trim()) errors.description = 'Requerido'
        if (!draft.unit_key) errors.unit_key = 'Selecciona unidad'
        if (draft.quantity <= 0) errors.quantity = '> 0'
        if (draft.weight <= 0) errors.weight = '> 0'
        setDraftErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleAddItem = () => {
        if (!validateDraft()) return
        appendItem({ ...draft })
        setDraft(emptyDraft)
        setDraftErrors({})
    }

    // ─── Submit ────────────────────────────────────────────────────────────────
    const onSubmit = async (values: CreateInvoiceTrasladoPayload) => {
        setIsSubmitting(true)
        try {
            const isDraft = submitType === 'draft'
            const apiPayload: any = {
                workCenterId: values.workCenterId || selectedWorkCenterId,
                customer_id: values.customer_id,
                tipo: 'T',
                date: values.date || 'now',
                use: values.use || 'G01',
                currency: values.currency || 'MXN',
                exportation: values.export || '01',
                status: isDraft ? 'draft' : 'pending',
                items: values.items.map(item => {
                    const mappedItem: any = {
                        product: {
                            description: item.description,
                            product_key: item.product_key,
                            unit_key: item.unit_key,
                            unit_name: item.unit_name || item.unit_key,
                            ...(item.sku ? { sku: item.sku } : {}),
                            taxes: [],
                            price: 0,
                            tax_included: false,
                            taxability: '01',
                        },
                        quantity: item.quantity,
                        weight: item.weight, // Used later for carta_porte manually in local logic if needed
                        parts: [],
                        complement: 'null'
                    }
                    if (item.customs_keys && item.customs_keys.trim()) {
                        mappedItem.customs_keys = item.customs_keys.split(',').map(k => k.trim()).filter(Boolean)
                    }
                    return mappedItem
                }),
            }

            if (serieConfig?.enabled) {
                apiPayload.series = seriePrefix
                apiPayload.folio_number = serieFolio
            }

            if (showRelatedDocs && values.related_documents && values.related_documents.length > 0) {
                // Group related documents by relationship
                const relationships = Array.from(new Set(values.related_documents.map(d => d.relationship)))
                apiPayload.related_documents = relationships.map(rel => ({
                    relationship: rel,
                    documents: values.related_documents?.filter(d => d.relationship === rel).map(d => d.uuid) || []
                }))
            }

            if (values.carta_porte?.enabled) {
                const totalWeight = values.items.reduce((acc, current) => acc + (current.weight || 0), 0);
                const cp = values.carta_porte;
                if (!apiPayload.complements) apiPayload.complements = [];
                apiPayload.complements.push({
                    type: "carta_porte",
                    data: {
                        IdCCP: cp.IdCCP || crypto.randomUUID(),
                        TranspInternac: cp.TranspInternac,
                        Ubicaciones: cp.Ubicaciones || [],
                        Mercancias: {
                            PesoBrutoTotal: totalWeight,
                            UnidadPeso: cp.UnidadPeso,
                            NumTotalMercancias: values.items.length,
                            Mercancia: values.items.map(i => ({
                                BienesTransp: i.product_key,
                                Descripcion: i.description,
                                Cantidad: i.quantity,
                                ClaveUnidad: i.unit_key,
                                PesoEnKg: i.weight
                            }))
                        }
                    }
                });
            }

            if (values.comercio_exterior?.enabled) {
                const ce = values.comercio_exterior;
                if (!apiPayload.complements) apiPayload.complements = [];

                const sumUSD = values.items.reduce((acc, curr) => acc + (curr.valor_dolares || (curr.quantity * (curr.valor_unitario_aduana || 0))), 0);

                apiPayload.complements.push({
                    type: 'comercio_exterior',
                    data: {
                        ClaveDePedimento: ce.ClaveDePedimento || 'A1',
                        CertificadoOrigen: Number(ce.CertificadoOrigen || 0),
                        TipoCambioUSD: Math.round(Number(ce.TipoCambioUSD || 1) * 10000) / 10000,
                        TotalUSD: Math.round(Number(ce.TotalUSD || sumUSD) * 100) / 100,
                        MotivoTraslado: ce.MotivoTraslado || '01',
                        NumCertificadoOrigen: ce.NumCertificadoOrigen || undefined,
                        NumeroExportadorConfiable: ce.NumeroExportadorConfiable || undefined,
                        Incoterm: ce.Incoterm || undefined,
                        Observaciones: ce.Observaciones || undefined,
                        Emisor: true, // Use org
                        Propietario: ce.propietario_id ? [{ id: ce.propietario_id }] : undefined,
                        Receptor: ce.receptor_id ? { id: ce.receptor_id } : undefined,
                        Destinatario: ce.destinatario_id ? [{ id: ce.destinatario_id }] : undefined,
                        Mercancias: {
                            Mercancia: values.items.map(i => ({
                                NoIdentificacion: i.sku || i.product_key,
                                ValorDolares: i.valor_dolares || (i.quantity * (i.valor_unitario_aduana || 0)),
                                FraccionArancelaria: i.fraccion_arancelaria || undefined,
                                CantidadAduana: i.cantidad_aduana || i.quantity,
                                UnidadAduana: i.unidad_aduana || undefined,
                                ValorUnitarioAduana: i.valor_unitario_aduana || undefined,
                                DescripcionesEspecificas: [
                                    {
                                        Marca: i.marca || 'GENERICO',
                                        Modelo: i.modelo || undefined,
                                        SubModelo: i.submodelo || undefined,
                                        NumeroSerie: i.numero_serie || undefined,
                                    }
                                ]
                            }))
                        }
                    }
                });
            }

            await createInvoice(apiPayload)
            toast.success(isDraft ? 'Borrador guardado' : 'Factura de Traslado generada exitosamente')
            queryClient.invalidateQueries({ queryKey: ['invoices', selectedWorkCenterId] })
            onSubmitSuccess()
        } catch (error: any) {
            console.error('Submit error:', error)
            const msg = error.response?.data?.message || error.message || 'Error al procesar el traslado'
            toast.error(msg, {
                duration: 5000,
                className: 'font-bold uppercase text-xs'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDraft = () => { setSubmitType('draft'); form.handleSubmit(onSubmit)() }
    const handleGenerate = () => { setSubmitType('pending'); form.handleSubmit(onSubmit)() }

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <Form {...form}>
            <form className='space-y-6'>

                {/* ── Encabezado ── */}
                <div className='rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm overflow-hidden'>
                    <div className='flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30'>
                        <div className='p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30'>
                            <Truck size={14} className='text-orange-600' />
                        </div>
                        <div>
                            <h2 className='text-sm font-bold text-slate-800 dark:text-zinc-100'>Factura de Traslado</h2>
                            <p className='text-[10px] text-slate-400 uppercase tracking-widest'>Tipo T</p>
                        </div>
                        <div className='ml-auto'>
                            <Badge variant='outline' className='text-[10px] px-3 h-6 border-slate-200 text-slate-500'>
                                {serieConfig?.enabled ? `${seriePrefix}-${serieFolio}` : 'Sin serie'}
                            </Badge>
                        </div>
                    </div>

                    <div className='p-6 grid grid-cols-1 md:grid-cols-12 gap-4'>
                        {/* Cliente */}
                        <div className='md:col-span-12 space-y-1.5'>
                            <Label className='text-[10px] text-slate-400 uppercase'>Cliente Receptor *</Label>
                            <FormField
                                control={form.control as any}
                                name='customer_id'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className='flex transition-all'>
                                                <ComboboxDropdown
                                                    items={[
                                                        { label: '+ Agregar Nuevo Cliente', value: '__ADD_NEW_CLIENT__' },
                                                        ...allClients.map((c) => ({
                                                            value: c!._id,
                                                            label: `${c!.razonSocial} · ${c!.rfc}`,
                                                        }))
                                                    ]}
                                                    defaultValue={field.value}
                                                    onValueChange={(val) => {
                                                        if (val === '__ADD_NEW_CLIENT__') {
                                                            setClientModalOpen(true)
                                                            return
                                                        }
                                                        field.onChange(val)
                                                    }}
                                                    placeholder='Buscar por nombre o RFC...'
                                                    emptyMessage='Sin resultados'
                                                    className='flex-1 border-slate-200 focus:ring-orange-500 text-xs'
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className='text-xs' />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Fecha */}
                        <div className='md:col-span-3 space-y-1.5'>
                            <Label className='text-[10px] text-slate-400 uppercase'>Fecha</Label>
                            <FormField
                                control={form.control as any}
                                name='date'
                                render={({ field }) => (
                                    <FormItem>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant='outline' type='button'
                                                        className={cn('h-9 w-full justify-start text-left text-xs font-normal', !field.value && 'text-muted-foreground')}>
                                                        <CalendarIcon className='mr-2 h-3.5 w-3.5 text-slate-400' />
                                                        {field.value ? format(new Date(field.value), 'PPP', { locale: es }) : 'Ahora'}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <Calendar mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(d) => field.onChange(d ? d.toISOString() : '')}
                                                    initialFocus locale={es}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Uso CFDI */}
                        <div className='md:col-span-5 space-y-1.5'>
                            <Label className='text-[10px] text-slate-400 uppercase'>Uso CFDI</Label>
                            <FormField
                                control={form.control as any}
                                name='use'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <ComboboxDropdown
                                                items={(cfdiUses as any[]).map((u: any) => ({ value: u.value, label: u.label }))}
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                placeholder='Uso de CFDI'
                                                className='h-9 text-xs'
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Moneda */}
                        <div className='md:col-span-2 space-y-1.5'>
                            <Label className='text-[10px] text-slate-400 uppercase'>Moneda</Label>
                            <FormField
                                control={form.control as any}
                                name='currency'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <ComboboxDropdown
                                                items={[
                                                    { value: 'MXN', label: 'MXN' },
                                                    { value: 'USD', label: 'USD' },
                                                    { value: 'EUR', label: 'EUR' },
                                                ]}
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                placeholder='Moneda'
                                                className='h-9 text-xs'
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Exportación */}
                        <div className='md:col-span-2 space-y-1.5'>
                            <Label className='text-[10px] text-slate-400 uppercase'>Export.</Label>
                            <FormField
                                control={form.control as any}
                                name='export'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <ComboboxDropdown
                                                items={(exportOptions as any[]).map((e: any) => ({ value: e.value, label: e.label }))}
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                placeholder='Exp'
                                                className='h-9 text-xs'
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Documentos Relacionados Toggle ── */}
                <div className='flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30'>
                            <FileStack size={14} className='text-orange-600' />
                        </div>
                        <div>
                            <h3 className='text-sm font-bold text-slate-800 dark:text-zinc-100'>Documentos Relacionados</h3>
                            <p className='text-xs text-slate-500'>Vincular CFDI previos (UUID) a este traslado</p>
                        </div>
                    </div>
                    <Switch checked={showRelatedDocs} onCheckedChange={setShowRelatedDocs} />
                </div>

                {/* ── Documentos Relacionados Form ── */}
                {showRelatedDocs && (
                    <div className='rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm overflow-hidden p-6 space-y-4'>
                        {relatedDocFields.map((doc, idx) => (
                            <div key={doc.id} className='grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 md:gap-4 p-4 rounded-lg bg-slate-50/50 dark:bg-zinc-900/20 border border-slate-100 dark:border-zinc-800'>
                                <FormField
                                    control={form.control as any}
                                    name={`related_documents.${idx}.relationship`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label className='text-[10px] font-black text-slate-400 uppercase'>Tipo de Relación</Label>
                                            <FormControl>
                                                <ComboboxDropdown
                                                    items={(relationTypes as any[]).map((r: any) => ({ value: r.value, label: r.label }))}
                                                    defaultValue={field.value}
                                                    onValueChange={field.onChange}
                                                    placeholder='Tipo de Relación'
                                                    className='h-9 text-xs'
                                                />
                                            </FormControl>
                                            <FormMessage className='text-[10px]' />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name={`related_documents.${idx}.uuid`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label className='text-[10px] font-black text-slate-400 uppercase'>UUID (Folio Fiscal)</Label>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
                                                    className='bg-white font-mono text-xs'
                                                />
                                            </FormControl>
                                            <FormMessage className='text-[10px]' />
                                        </FormItem>
                                    )}
                                />
                                <div className='flex items-end justify-end md:justify-center'>
                                    <Button type='button' variant='ghost' size='icon' className='h-9 w-9 text-destructive hover:bg-destructive/10' onClick={() => removeRelatedDoc(idx)}>
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            className='w-full text-xs border-dashed border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 bg-orange-50/50'
                            onClick={() => appendRelatedDoc({ relationship: '', uuid: '' })}
                        >
                            <Plus size={14} className='mr-2' /> Añadir Documento Relacionado
                        </Button>
                    </div>
                )}


                {/* ── Documentos Relacionados Carta Porte ── */}
                <div className='flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30'>
                            <Truck size={14} className='text-orange-600' />
                        </div>
                        <div>
                            <h3 className='text-sm font-bold text-slate-800 dark:text-zinc-100'>Complemento Carta Porte 3.1</h3>
                            <p className='text-xs text-slate-500'>Habilitar complemento obligatorio para traslado de mercancías</p>
                        </div>
                    </div>
                    <FormField
                        control={form.control as any}
                        name='carta_porte.enabled'
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                {form.watch('carta_porte.enabled') && (
                    <div className='rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm overflow-hidden p-6 space-y-6'>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <FormField
                                control={form.control as any}
                                name='carta_porte.TranspInternac'
                                render={({ field }) => (
                                    <FormItem>
                                        <Label className='text-[10px] font-black text-slate-400 uppercase'>Transporte Internacional</Label>
                                        <FormControl>
                                            <ComboboxDropdown
                                                items={[{ value: 'Sí', label: 'Sí' }, { value: 'No', label: 'No' }]}
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                placeholder='Internacional'
                                                className='h-9 text-xs'
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name='carta_porte.UnidadPeso'
                                render={({ field }) => (
                                    <FormItem>
                                        <Label className='text-[10px] font-black text-slate-400 uppercase'>Unidad de Peso</Label>
                                        <FormControl>
                                            <ComboboxDropdown
                                                items={CLAVE_UNIDAD_PESO_CATALOG}
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                placeholder='Unidad de peso...'
                                                className='h-9 text-xs'
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* More detailed fields for Carta Porte can be built out using useFieldArray for Ubicaciones */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-slate-800 dark:text-zinc-100">Ubicaciones (Origen / Destino)</Label>
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    className='h-8 text-[10px] bg-white border-slate-200 text-slate-600'
                                    onClick={() => appendUbicacion({
                                        TipoUbicacion: 'Origen',
                                        RFCRemitenteDestinatario: '',
                                        FechaHoraSalidaLlegada: new Date().toISOString().slice(0, 16),
                                        Domicilio: { Estado: '', Pais: 'MEX', CodigoPostal: '', Calle: '' }
                                    })}
                                >
                                    <Plus size={12} className='mr-1' /> Agregar Ubicación
                                </Button>
                            </div>

                            {ubicacionFields.map((loc, idx) => (
                                <div key={loc.id} className='relative grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-lg bg-slate-50/50 dark:bg-zinc-900/20 border border-slate-100 dark:border-zinc-800 focus-within:ring-1 focus-within:ring-orange-500/20'>
                                    <Button type='button' variant='ghost' size='icon' className='absolute right-2 top-2 h-7 w-7 text-destructive hover:bg-destructive/10' onClick={() => removeUbicacion(idx)}>
                                        <Trash2 size={13} />
                                    </Button>

                                    {/* Tipo / RFC */}
                                    <div className='md:col-span-3 space-y-1 mt-2'>
                                        <Label className='text-[10px] text-slate-400 uppercase'>Tipo *</Label>
                                        <FormField
                                            control={form.control as any}
                                            name={`carta_porte.Ubicaciones.${idx}.TipoUbicacion`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <ComboboxDropdown items={[{ value: 'Origen', label: 'Origen' }, { value: 'Destino', label: 'Destino' }]}
                                                            defaultValue={field.value} onValueChange={field.onChange} placeholder='Tipo' className='h-9 text-xs' />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className='md:col-span-4 space-y-1 mt-2'>
                                        <Label className='text-[10px] text-slate-400 uppercase'>RFC Remitente/Destinatario *</Label>
                                        <FormField
                                            control={form.control as any}
                                            name={`carta_porte.Ubicaciones.${idx}.RFCRemitenteDestinatario`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input {...field} placeholder='XAXX010101000' className='h-9 text-xs bg-white' />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className='md:col-span-4 space-y-1 mt-2'>
                                        <Label className='text-[10px] text-slate-400 uppercase'>Fecha/Hora (Salida/Llegada) *</Label>
                                        <FormField
                                            control={form.control as any}
                                            name={`carta_porte.Ubicaciones.${idx}.FechaHoraSalidaLlegada`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type='datetime-local' {...field} className='h-9 text-xs bg-white' />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Domicilio */}
                                    <div className='md:col-span-12 mt-1'>
                                        <Label className='text-[10px] text-orange-600 font-bold uppercase'>Domicilio</Label>
                                    </div>
                                    <div className='md:col-span-4 space-y-1'>
                                        <FormField control={form.control as any} name={`carta_porte.Ubicaciones.${idx}.Domicilio.Calle`} render={({ field }) => (
                                            <FormItem><FormControl><Input {...field} placeholder='Calle' className='h-9 text-xs bg-white' /></FormControl></FormItem>
                                        )} />
                                    </div>
                                    <div className='md:col-span-2 space-y-1'>
                                        <FormField control={form.control as any} name={`carta_porte.Ubicaciones.${idx}.Domicilio.CodigoPostal`} render={({ field }) => (
                                            <FormItem><FormControl><Input {...field} placeholder='C.P.' className='h-9 text-xs bg-white' /></FormControl></FormItem>
                                        )} />
                                    </div>
                                    <div className='md:col-span-3 space-y-1'>
                                        <FormField control={form.control as any} name={`carta_porte.Ubicaciones.${idx}.Domicilio.Estado`} render={({ field }) => (
                                            <FormItem><FormControl><Input {...field} placeholder='Estado (Ej: PUE)' className='h-9 text-xs bg-white' /></FormControl></FormItem>
                                        )} />
                                    </div>
                                    <div className='md:col-span-3 space-y-1'>
                                        <FormField control={form.control as any} name={`carta_porte.Ubicaciones.${idx}.Domicilio.Pais`} render={({ field }) => (
                                            <FormItem><FormControl><Input {...field} placeholder='País (Ej: MEX)' className='h-9 text-xs bg-white' /></FormControl></FormItem>
                                        )} />
                                    </div>
                                </div>
                            ))}

                            {ubicacionFields.length === 0 && (
                                <div className='py-6 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-lg text-slate-400 bg-slate-50/50'>
                                    <p className='text-xs'>Añade al menos un Origen y un Destino.</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-orange-50/50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-200/50 flex items-start gap-3">
                            <Zap size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-orange-600 font-medium">
                                Nota: Las mercancías se calcularán automáticamente utilizando los bienes agregados en la sección inferior. Asegúrate de capturar el <b>Peso (KG)</b> en cada uno.
                            </p>
                        </div>

                    </div>
                )}

                {/* ── Documentos Relacionados Comercio Exterior ── */}
                <div className='flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm mt-4'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30'>
                            <Globe size={14} className='text-purple-600' />
                        </div>
                        <div>
                            <h3 className='text-sm font-bold text-slate-800 dark:text-zinc-100'>Complemento Comercio Exterior 2.0</h3>
                            <p className='text-xs text-slate-500'>Habilitar complemento obligatorio para importación / exportación</p>
                        </div>
                    </div>
                    <FormField
                        control={form.control as any}
                        name='comercio_exterior.enabled'
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                {form.watch('comercio_exterior.enabled') && (
                    <div className='rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm overflow-hidden p-6 space-y-6'>
                        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>

                            <FormField control={form.control as any} name='comercio_exterior.MotivoTraslado' render={({ field }) => (
                                <FormItem>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase'>Motivo Traslado</Label>
                                    <FormControl><Input {...field} placeholder='Ej: 01 (Envío de mrcías facturadas)' className='h-9 text-xs' /></FormControl>
                                </FormItem>
                            )} />

                            <FormField control={form.control as any} name='comercio_exterior.ClaveDePedimento' render={({ field }) => (
                                <FormItem>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase'>Clave Pedimento</Label>
                                    <FormControl><Input {...field} placeholder='A1' className='h-9 text-xs' /></FormControl>
                                </FormItem>
                            )} />

                            <FormField control={form.control as any} name='comercio_exterior.CertificadoOrigen' render={({ field }) => (
                                <FormItem>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase'>Certif. Origen</Label>
                                    <FormControl>
                                        <ComboboxDropdown
                                            items={[{ value: '0', label: '0 - No funge como cert.' }, { value: '1', label: '1 - Sí funge' }]}
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder='Certificado'
                                            className='h-9 text-xs'
                                        />
                                    </FormControl>
                                </FormItem>
                            )} />

                            <FormField control={form.control as any} name='comercio_exterior.NumCertificadoOrigen' render={({ field }) => (
                                <FormItem>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase'>Núm Certificado</Label>
                                    <FormControl><Input {...field} placeholder='Opcional...' className='h-9 text-xs bg-white' /></FormControl>
                                </FormItem>
                            )} />

                            <FormField control={form.control as any} name='comercio_exterior.TipoCambioUSD' render={({ field }) => (
                                <FormItem>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase'>Tipo de Cambio (USD a MXN)</Label>
                                    <FormControl><Input type="number" step="0.0001" {...field} placeholder='Obligatorio' className='h-9 text-xs bg-white' /></FormControl>
                                </FormItem>
                            )} />

                            <FormField control={form.control as any} name='comercio_exterior.TotalUSD' render={({ field }) => (
                                <FormItem>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase'>Total USD (Opcional, auto-calc)</Label>
                                    <FormControl><Input type="number" step="0.01" {...field} placeholder='Dejar vacío para auto' className='h-9 text-xs bg-white' /></FormControl>
                                </FormItem>
                            )} />

                            <FormField control={form.control as any} name='comercio_exterior.Incoterm' render={({ field }) => (
                                <FormItem>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase'>INCOTERM</Label>
                                    <FormControl><Input {...field} placeholder='Ej: FCA' className='h-9 text-xs bg-white uppercase' /></FormControl>
                                </FormItem>
                            )} />
                        </div>

                        <div className="bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-200/50">
                            <p className="text-xs text-purple-600 font-medium">
                                Nota: Las mercancías se construirán a partir de los Bienes.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Bienes / Conceptos ── */}
                <div className='rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm overflow-hidden'>
                    <div className='flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30'>
                        <div className='p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30'>
                            <Zap size={12} className='text-orange-600' />
                        </div>
                        <h3 className='text-[10px] font-black uppercase tracking-widest text-slate-500'>Bienes a Trasladar</h3>
                        <Badge variant='secondary' className='ml-auto text-[10px]'>{itemFields.length} concepto(s)</Badge>
                    </div>

                    <div className='p-6 space-y-4'>
                        {/* Validation error */}
                        <FormField control={form.control as any} name='items' render={() => (
                            <FormItem><FormMessage className='text-xs' /></FormItem>
                        )} />

                        {/* Add item panel */}
                        <div className='grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/20'>
                            {/* Buscar en mi catálogo */}
                            <div className='md:col-span-12'>
                                <Label className='text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2 mb-2'>
                                    <Zap size={12} fill='currentColor' /> Buscar en mi catálogo
                                </Label>
                                <ComboboxDropdown
                                    defaultValue={draft.product_id || ''}
                                    className='border-orange-200 bg-orange-50/10 focus:ring-orange-500 w-full'
                                    onValueChange={(val) => {
                                        if (val === '__ADD_NEW_PRODUCT__') {
                                            setProductModalOpen(true)
                                            return
                                        }
                                        const prod = combinedProducts.find(p => p.productIdFacturaApi === val || p._id === val)
                                        if (prod) {
                                            selectProductFromCatalog(prod)
                                        } else {
                                            setDraft(prev => ({ ...prev, product_id: val }))
                                        }
                                    }}
                                    placeholder='Escribe para buscar un producto...'
                                    items={[
                                        { label: '+ Agregar Nuevo Producto', value: '__ADD_NEW_PRODUCT__' },
                                        ...combinedProducts.map(p => ({
                                            label: `${p.description || ''}${p.sku ? ` - ${p.sku}` : ''}`,
                                            value: p.productIdFacturaApi || p._id
                                        }))
                                    ]}
                                />
                            </div>

                            {/* Clave SAT */}
                            <div className='md:col-span-3 space-y-1'>
                                <Label className='text-[10px] text-slate-400 uppercase'>Clave SAT *</Label>
                                <RemoteCombobox
                                    value={draft.product_key}
                                    initialLabel={draft.product_key_label}
                                    fetchFn={searchSatProducts}
                                    placeholder='Buscar clave SAT...'
                                    searchPlaceholder='Escribe al menos 3 caracteres...'
                                    emptyText='Sin resultados'
                                    className={cn('h-9 text-xs', draftErrors.product_key && 'border-destructive')}
                                    onValueChange={(val, label) => {
                                        setDraft(prev => ({ ...prev, product_key: val, product_key_label: label, description: prev.description || label }))
                                        setDraftErrors(prev => ({ ...prev, product_key: undefined }))
                                    }}
                                />
                                {draftErrors.product_key && <p className='text-[10px] text-destructive'>{draftErrors.product_key}</p>}
                            </div>

                            {/* Descripción */}
                            <div className='md:col-span-4 space-y-1'>
                                <Label className='text-[10px] text-slate-400 uppercase'>Descripción *</Label>
                                <Input
                                    value={draft.description}
                                    onChange={(e) => {
                                        setDraft(prev => ({ ...prev, description: e.target.value }))
                                        setDraftErrors(prev => ({ ...prev, description: undefined }))
                                    }}
                                    placeholder='Descripción del bien'
                                    className={cn('h-9 text-xs', draftErrors.description && 'border-destructive')}
                                />
                                {draftErrors.description && <p className='text-[10px] text-destructive'>{draftErrors.description}</p>}
                            </div>

                            {/* Unidad */}
                            <div className='md:col-span-2 space-y-1'>
                                <Label className='text-[10px] text-slate-400 uppercase'>Unidad *</Label>
                                <RemoteCombobox
                                    value={draft.unit_key}
                                    initialLabel={draft.unit_name}
                                    fetchFn={searchSatUnits}
                                    placeholder='Unidad...'
                                    searchPlaceholder='Buscar unidad...'
                                    emptyText='Sin resultados'
                                    className={cn('h-9 text-xs', draftErrors.unit_key && 'border-destructive')}
                                    onValueChange={(val, label) => {
                                        setDraft(prev => ({ ...prev, unit_key: val, unit_name: label }))
                                        setDraftErrors(prev => ({ ...prev, unit_key: undefined }))
                                    }}
                                />
                                {draftErrors.unit_key && <p className='text-[10px] text-destructive'>{draftErrors.unit_key}</p>}
                            </div>

                            {/* Cantidad */}
                            <div className='md:col-span-1 space-y-1'>
                                <Label className='text-[10px] text-slate-400 uppercase'>Cant.</Label>
                                <Input
                                    type='number'
                                    min={0.001}
                                    step='any'
                                    value={draft.quantity}
                                    onChange={(e) => setDraft(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                                    className={cn('h-9 text-xs text-center', draftErrors.quantity && 'border-destructive')}
                                />
                                {draftErrors.quantity && <p className='text-[10px] text-destructive'>{draftErrors.quantity}</p>}
                            </div>

                            {/* Peso */}
                            <div className='md:col-span-2 space-y-1'>
                                <Label className='text-[10px] text-slate-400 uppercase'>Peso Total (Kg) *</Label>
                                <Input
                                    type='number'
                                    min={0.001}
                                    step='any'
                                    value={draft.weight}
                                    onChange={(e) => setDraft(prev => ({ ...prev, weight: Number(e.target.value) }))}
                                    className={cn('h-9 text-xs text-center', draftErrors.weight && 'border-destructive')}
                                />
                                {draftErrors.weight && <p className='text-[10px] text-destructive'>{draftErrors.weight}</p>}
                            </div>

                            {/* SKU */}
                            <div className='md:col-span-2 space-y-1'>
                                <Label className='text-[10px] text-slate-400 uppercase'>SKU</Label>
                                <Input value={draft.sku} onChange={(e) => setDraft(prev => ({ ...prev, sku: e.target.value }))} placeholder='Opc.' className='h-9 text-xs' />
                            </div>

                            {/* Pedimentos */}
                            <div className='md:col-span-8 space-y-1'>
                                <Label className='text-[10px] text-slate-400 uppercase'>Pedimentos Aduanales (Separados por coma)</Label>
                                <Input value={draft.customs_keys} onChange={(e) => setDraft(prev => ({ ...prev, customs_keys: e.target.value }))} placeholder='Opcional. Ej: 21 47 3840 8012345, 10 47 3840 8012346' className='h-9 text-xs' />
                            </div>

                            {form.watch('comercio_exterior.enabled') && (
                                <div className='md:col-span-12 grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800/50 mt-2 mb-2'>
                                    <div className='md:col-span-5'><Label className='text-[10px] font-bold text-purple-600 uppercase flex items-center gap-1'><Globe size={12} /> Detalle de Mercancía para Comercio Exterior</Label></div>

                                    <div className='space-y-1'>
                                        <Label className='text-[10px] text-slate-400 uppercase'>Fracc. Arancelaria</Label>
                                        <Input value={draft.fraccion_arancelaria} onChange={(e) => setDraft(prev => ({ ...prev, fraccion_arancelaria: e.target.value }))} placeholder='Ej: 85369099' className='h-8 text-[11px] bg-white' />
                                    </div>
                                    <div className='space-y-1'>
                                        <Label className='text-[10px] text-slate-400 uppercase'>Unidad Aduana</Label>
                                        <Input value={draft.unidad_aduana} onChange={(e) => setDraft(prev => ({ ...prev, unidad_aduana: e.target.value }))} placeholder='Ej: 01 (Kilos)' className='h-8 text-[11px] bg-white' />
                                    </div>
                                    <div className='space-y-1'>
                                        <Label className='text-[10px] text-slate-400 uppercase'>Cant. Aduana</Label>
                                        <Input type="number" step="any" value={draft.cantidad_aduana} onChange={(e) => setDraft(prev => ({ ...prev, cantidad_aduana: Number(e.target.value) }))} placeholder="Misma que Cantidad" className='h-8 text-[11px] bg-white' />
                                    </div>
                                    <div className='space-y-1'>
                                        <Label className='text-[10px] text-slate-400 uppercase'>Valor Unitario USD</Label>
                                        <Input type="number" step="any" value={draft.valor_unitario_aduana} onChange={(e) => setDraft(prev => ({ ...prev, valor_unitario_aduana: Number(e.target.value) }))} placeholder="0.00" className='h-8 text-[11px] bg-white' />
                                    </div>
                                    <div className='space-y-1'>
                                        <Label className='text-[10px] text-slate-400 uppercase'>Marca</Label>
                                        <Input value={draft.marca} onChange={(e) => setDraft(prev => ({ ...prev, marca: e.target.value }))} placeholder="Obligatorio (Ej: Generica)" className='h-8 text-[11px] bg-white' />
                                    </div>
                                </div>
                            )}

                            {/* Botón agregar */}
                            <div className='md:col-span-2 flex items-end'>
                                <Button type='button' size='sm' onClick={handleAddItem}
                                    className='w-full h-9 bg-orange-500 hover:bg-orange-600 text-white'>
                                    <Plus size={14} className='mr-1' /> Agregar
                                </Button>
                            </div>
                        </div>

                        {/* Tabla */}
                        {itemFields.length > 0 ? (
                            <div className='rounded-xl border border-slate-200 dark:border-zinc-800 overflow-x-auto'>
                                <Table>
                                    <TableHeader className='bg-slate-50 dark:bg-zinc-900'>
                                        <TableRow>
                                            <TableHead className='text-[10px] uppercase text-slate-400 w-8'>#</TableHead>
                                            <TableHead className='text-[10px] uppercase text-slate-400'>Clave SAT</TableHead>
                                            <TableHead className='text-[10px] uppercase text-slate-400'>Descripción</TableHead>
                                            <TableHead className='text-[10px] uppercase text-slate-400 text-center'>Unidad</TableHead>
                                            <TableHead className='text-[10px] uppercase text-slate-400 text-right w-20'>Cant.</TableHead>
                                            <TableHead className='text-[10px] uppercase text-slate-400 text-right w-20'>Peso(kg)</TableHead>
                                            <TableHead className='text-[10px] uppercase text-slate-400'>Pedimentos / SKU</TableHead>
                                            <TableHead className='w-10' />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {itemFields.map((item, idx) => (
                                            <TableRow key={item.id} className='text-xs'>
                                                <TableCell className='text-slate-400 font-mono'>{idx + 1}</TableCell>
                                                <TableCell>
                                                    <Badge variant='outline' className='font-mono text-[10px] border-orange-200 text-orange-700 bg-orange-50'>
                                                        {form.watch(`items.${idx}.product_key`)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className='font-medium text-slate-700 dark:text-zinc-300 max-w-xs truncate'>
                                                    {form.watch(`items.${idx}.description`)}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    <Badge variant='secondary' className='text-[10px] font-mono'>
                                                        {form.watch(`items.${idx}.unit_key`)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className='text-right font-mono'>
                                                    {form.watch(`items.${idx}.quantity`)}
                                                </TableCell>
                                                <TableCell className='text-right font-mono text-orange-600 font-medium'>
                                                    {form.watch(`items.${idx}.weight`)}
                                                </TableCell>
                                                <TableCell className='text-[10px]'>
                                                    {form.watch(`items.${idx}.customs_keys`) && (
                                                        <div className='text-slate-500 max-w-xs truncate' title={form.watch(`items.${idx}.customs_keys`)}>
                                                            Ped: {form.watch(`items.${idx}.customs_keys`)}
                                                        </div>
                                                    )}
                                                    {form.watch(`items.${idx}.sku`) && (
                                                        <div className='text-slate-400 font-mono mt-0.5'>SKU: {form.watch(`items.${idx}.sku`)}</div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button type='button' variant='ghost' size='icon'
                                                        className='h-7 w-7 text-destructive hover:bg-destructive/10'
                                                        onClick={() => removeItem(idx)}>
                                                        <Trash2 size={13} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className='flex flex-col items-center justify-center py-12 text-slate-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl'>
                                <Truck size={28} className='mb-3 opacity-20' />
                                <p className='text-xs'>Agrega los bienes que se van a trasladar</p>
                                <p className='text-[10px] text-slate-300 mt-1'>Usa el buscador de arriba para agregar conceptos</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Acciones ── */}
                <div className='flex items-center justify-between pt-2'>
                    <Button type='button' variant='ghost' size='sm' className='text-xs text-slate-500' onClick={onCancel}>
                        Cancelar
                    </Button>
                    <div className='flex gap-2'>
                        <Button type='button' variant='outline' size='sm'
                            className='h-9 text-xs gap-2 border-slate-200' onClick={handleDraft} disabled={isSubmitting}>
                            {isSubmitting && submitType === 'draft' ? <Loader2 size={14} className='animate-spin' /> : <Save size={14} />}
                            Borrador
                        </Button>
                        <Button type='button' size='sm'
                            className='h-9 text-xs gap-2 bg-orange-500 hover:bg-orange-600 text-white' onClick={handleGenerate} disabled={isSubmitting}>
                            {isSubmitting && submitType === 'pending' ? <Loader2 size={14} className='animate-spin' /> : <Truck size={14} />}
                            Generar CFDI
                        </Button>
                    </div>
                </div>
            </form>

            <ClientCreateModal
                open={clientModalOpen}
                onOpenChange={setClientModalOpen}
                onSuccess={(newClient: any) => {
                    const norm = normalizeClient(newClient)
                    if (norm) {
                        setExtraClients(prev => [...prev, norm])
                        form.setValue('customer_id', norm._id)
                    }
                    refetchClients()
                    setClientModalOpen(false)
                }}
            />

            <ProductCreateModal
                open={productModalOpen}
                onOpenChange={setProductModalOpen}
                onSuccess={(newProduct: any) => {
                    const norm = normalizeProduct(newProduct)
                    if (norm) {
                        selectProductFromCatalog(norm)
                    }
                    refetchProducts()
                    setProductModalOpen(false)
                }}
            />
        </Form>
    )
}
