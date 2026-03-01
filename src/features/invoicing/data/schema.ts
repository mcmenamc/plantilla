import { z } from 'zod'

// Address schema
export const addressSchema = z.object({
    zip: z.string().min(5, 'El código postal debe tener al menos 5 dígitos'),
    street: z.string().optional(),
    exterior: z.string().optional(),
    interior: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    municipality: z.string().optional(),
    state: z.string().optional(),
})

// Tax schema for items
export const invoiceTaxSchema = z.object({
    type: z.enum(['IVA', 'ISR', 'IEPS']).default('IVA'),
    rate: z.coerce.number().min(0, 'La tasa no puede ser negativa').default(0),
    base: z.coerce.number().min(0).optional(),
    withholding: z.boolean().default(false),
})

// Item schema
export const invoiceItemSchema = z.object({
    product_id: z.string().optional(),
    sku: z.string().optional(),
    description: z.string().optional(), // Optional for drafts
    product_key: z.string().optional(), // Optional for drafts
    product_key_nombre: z.string().optional(),
    unit_key: z.string().optional().default('H87'), // Optional for drafts
    unit_name: z.string().optional(),
    quantity: z.coerce.number().min(0.000001, 'La cantidad debe ser mayor a 0'),
    price: z.coerce.number().min(0, 'El precio no puede ser negativo').optional(), // Optional for drafts
    tax_included: z.boolean().default(false),
    discount: z.coerce.number().min(0, 'El descuento no puede ser negativo').optional().default(0),
    objeto_imp: z.enum(['01', '02', '03', '04', '05']).default('02'),
    taxes: z.array(invoiceTaxSchema).optional().default([]),
})

export type InvoiceItem = z.infer<typeof invoiceItemSchema>

// Global info schema
export const globalInfoSchema = z.object({
    periodicity: z.enum(['01', '02', '03', '04', '05']).default('01'),
    months: z.string().min(2).max(2).default('01'),
    year: z.coerce.number().min(2021).default(new Date().getFullYear()),
})

// Related documents schema
export const relatedDocumentSchema = z.object({
    relationship: z.string().min(2, 'El tipo de relación es requerido'),
    documents: z.array(z.string().uuid('El UUID no es válido')).min(1, 'Debe agregar al menos un UUID'),
})

// Main Invoice Schema
export const createInvoiceIngresoSchema = z.object({
    workCenterId: z.string().min(1, 'El centro de trabajo es requerido'),
    customer_id: z.string().min(1, 'El cliente es requerido'),
    tipo: z.enum(['I', 'E', 'P', 'N', 'T']).default('I'),
    folio_number: z.coerce.number().optional(),
    series: z.string().max(25).optional().default(''),
    date: z.string().optional().default('now'),
    use: z.string().min(3, 'El uso de CFDI es requerido').default('G03'),
    regimen_fiscal: z.string().optional(),
    payment_form: z.string().optional().default('01'), // Optional for drafts
    payment_method: z.enum(['PUE', 'PPD']).default('PUE'),
    currency: z.string().default('MXN'),
    num_decimales: z.coerce.number().default(2),
    exchange: z.coerce.number().min(1).default(1),
    conditions: z.string().max(1000).optional().default(''),
    export: z.enum(['01', '02', '03', '04']).default('01'),
    global: globalInfoSchema.optional(),
    related_documents: z.array(relatedDocumentSchema).optional(),
    address: addressSchema.optional(),
    external_id: z.string().optional(),
    idempotency_key: z.string().optional(),
    items: z.array(invoiceItemSchema).min(1, 'Debe agregar al menos un concepto'),
    comments: z.string().optional().default(''),
    status: z.enum(['draft', 'pending']).default('pending'),
})

export type CreateInvoiceIngresoPayload = z.infer<typeof createInvoiceIngresoSchema>

// Existing schema for listing
export const invoiceSchema = z.object({
    _id: z.string(),
    facturapi_id: z.string(),
    uuid: z.string().optional().nullable(),
    serie: z.string().optional().nullable(),
    folio_number: z.number().optional().nullable(),
    tipo_cfdi: z.string(),
    total: z.number(),
    status: z.string(), // e.g., 'valid', 'cancelled', 'draft'
    fecha_emision: z.string().optional(),
    customer: z.object({
        _id: z.string().optional(),
        razonSocial: z.string(),
        rfc: z.string().optional(),
        email: z.string().optional(),
    }).optional(),
    verification_url: z.string().optional().nullable(),
    pdfPath: z.string().optional().nullable(),
    xmlPath: z.string().optional().nullable(),
    metodo_pago: z.string().optional().nullable(),
    forma_pago: z.string().optional().nullable(),
})

export type Invoice = z.infer<typeof invoiceSchema>
