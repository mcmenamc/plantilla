import { z } from 'zod'

// Address schema
export const addressSchema = z.object({
    zip: z.string().optional(),
    street: z.string().optional(),
    exterior: z.string().optional(),
    interior: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    municipality: z.string().optional(),
    state: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.zip && data.zip.length !== 5) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'El código postal debe tener exactamente 5 dígitos',
            path: ['zip']
        });
    }
})

// Tax schema for items
export const invoiceTaxSchema = z.object({
    type: z.enum(['IVA', 'ISR', 'IEPS']).default('IVA'),
    rate: z.coerce.number().min(0, 'La tasa no puede ser negativa').default(0),
    base: z.coerce.number().min(0).default(100),
    factor: z.enum(['Tasa', 'Cuota', 'Exento']).default('Tasa'),
    withholding: z.boolean().default(false),
})

// Local tax schema for items
export const localTaxSchema = z.object({
    type: z.string().min(1, 'El nombre del impuesto local es obligatorio'),
    rate: z.coerce.number().min(0, 'La tasa no puede ser negativa').default(0),
    base: z.coerce.number().min(0).default(100),
    factor: z.enum(['Tasa', 'Cuota', 'Exento']).default('Tasa'),
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
    discount_type: z.enum(['amount', 'percentage']).default('amount'),
    taxability: z.enum(['01', '02', '03', '04', '05']).default('02'),
    taxes: z.array(invoiceTaxSchema).optional().default([]),
    local_taxes: z.array(localTaxSchema).optional().default([]),
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

// Related documents for payments (Complemento Pago 2.0)
export const paymentRelatedDocumentSchema = z.object({
    uuid: z.string().uuid('Folio fiscal (UUID) no válido'),
    amount: z.coerce.number().min(0.01, 'El importe pagado debe ser mayor a 0'),
    taxes: z.array(invoiceTaxSchema).default([]),
    installment: z.coerce.number().int('La parcialidad debe ser un número entero').min(1, 'Mínimo 1').default(1),
    previous_balance: z.coerce.number().min(0.01, 'El saldo anterior debe ser positivo').default(0.01),
    last_balance: z.coerce.number().min(0, 'El saldo pendiente no puede ser negativo').default(0),
    taxability: z.enum(['01', '02', '03', '04', '05', '06', '07', '08']).default('02'),
    currency: z.string().length(3, 'La moneda debe tener 3 caracteres').default('MXN'),
    exchange: z.coerce.number().min(0.00000001, 'El tipo de cambio debe ser positivo').optional().default(1),
    folio_number: z.string().optional().nullable(),
    series: z.string().optional().nullable(),
}).superRefine((val, ctx) => {
    // Reglas según Facturapi docs:
    // - taxability '01': taxes debe estar vacío (Facturapi guarda [])
    // - taxability '02': taxes vacío → Facturapi agrega IVA 16% automáticamente. Con taxes → usa los enviados.
    // - taxability '07': debe enviar al menos 1 IEPS de traslado (no puede ir vacío)

    if (val.taxability === '01' && val.taxes.length > 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Con taxability 01 (no objeto de impuesto) no debe incluir impuestos',
            path: ['taxes']
        });
    }

    if (val.taxability === '07') {
        const hasIEPS = val.taxes.some(t => t.type === 'IEPS' && !t.withholding);
        if (!hasIEPS) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Con taxability 07 (IEPS) debe incluir al menos un impuesto IEPS de traslado',
                path: ['taxes']
            });
        }
    }

    // Validar base de cada impuesto si se especifican
    val.taxes.forEach((tax, idx) => {
        if (!tax.base || tax.base <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'La base del impuesto debe ser positiva',
                path: ['taxes', idx, 'base']
            });
        }
    });
});


const rfcRegex = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/i;

// Detailed Payment Header (Pago for Complemento Pago 2.0)
export const paymentSchema = z.object({
    payment_form: z.string().min(2, 'La forma de pago es requerida'),
    amount: z.coerce.number().min(0.01, 'El monto total del pago debe ser mayor a 0'),
    currency: z.string().length(3, 'La moneda debe tener 3 caracteres').default('MXN'),
    exchange: z.coerce.number().min(0.00000001).default(1),
    date: z.string().optional().nullable().default('now'),
    numOperacion: z.string().optional().nullable().default(''),
    rfcEmisorCtaOrd: z.string().optional().nullable().default(''),
    nomBancoOrdExt: z.string().optional().nullable().default(''),
    ctaOrdenante: z.string().optional().nullable().default(''),
    rfcEmisorCtaBen: z.string().optional().nullable().default(''),
    ctaBeneficiario: z.string().optional().nullable().default(''),
    tipoCadPago: z.string().optional().nullable().default(''),
    certPago: z.string().optional().nullable().default(''),
    cadPago: z.string().optional().nullable().default(''),
    selloPago: z.string().optional().nullable().default(''),
    related_documents: z.array(paymentRelatedDocumentSchema).min(1, 'Debe agregar al menos un documento relacionado (factura original)'),
}).superRefine((val, ctx) => {
    // 1. Validar RFCs (Opcionales pero deben tener formato correcto si se llenan)
    if (val.rfcEmisorCtaOrd && val.rfcEmisorCtaOrd.trim().length > 0) {
        if (!rfcRegex.test(val.rfcEmisorCtaOrd)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RFC de banco ordenante no válido', path: ['rfcEmisorCtaOrd'] });
        }
    }
    if (val.rfcEmisorCtaBen && val.rfcEmisorCtaBen.trim().length > 0) {
        if (!rfcRegex.test(val.rfcEmisorCtaBen)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RFC de banco beneficiario no válido', path: ['rfcEmisorCtaBen'] });
        }
    }

    // 2. Validar Cuentas (Longitud SAT: 10 a 50 caracteres)
    if (val.ctaOrdenante && val.ctaOrdenante.trim().length > 0) {
        if (val.ctaOrdenante.trim().length < 10 || val.ctaOrdenante.trim().length > 50) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cuenta ordenante debe tener entre 10 y 50 caracteres', path: ['ctaOrdenante'] });
        }
    }
    if (val.ctaBeneficiario && val.ctaBeneficiario.trim().length > 0) {
        if (val.ctaBeneficiario.trim().length < 10 || val.ctaBeneficiario.trim().length > 50) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cuenta beneficiaria debe tener entre 10 y 50 caracteres', path: ['ctaBeneficiario'] });
        }
    }

    // 3. Reglas SPEI / Cadena de Pago
    if (val.tipoCadPago && val.tipoCadPago.trim().length > 0) {
        // Si tipoCadPago existe, certPago, cadPago y selloPago son obligatorios
        if (!val.certPago || val.certPago.trim().length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El certificado de pago es requerido cuando existe tipo de cadena', path: ['certPago'] });
        }
        if (!val.cadPago || val.cadPago.trim().length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La cadena de pago es requerida cuando existe tipo de cadena', path: ['cadPago'] });
        }
        if (!val.selloPago || val.selloPago.trim().length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El sello de pago es requerido cuando existe tipo de cadena', path: ['selloPago'] });
        }
    }

    // 4. Validar Tipo de Cambio entre Moneda de Pago y Moneda del Documento Relacionado
    val.related_documents.forEach((doc, idx) => {
        if (doc.currency !== val.currency) {
            if (!doc.exchange || doc.exchange === 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `El tipo de cambio es obligatorio porque la moneda del documento (${doc.currency}) es distinta a la del pago (${val.currency})`,
                    path: ['related_documents', idx, 'exchange']
                });
            }
        }
    });

    // 5. Validar que la suma de importes pagados sea coherente (Opcional, pero ayuda al usuario)
    const sumPaid = val.related_documents.reduce((acc, doc) => acc + Number(doc.amount), 0);
    // Permitimos un margen de error por flotantes de 0.01
    if (Math.abs(sumPaid - val.amount) > 0.01) {
        // Nota: El SAT permite que el total del pago sea mayor a la suma (si hay remanente), 
        // pero Facturapi suele pedir coincidencia o validación estricta en el complemento.
        // Lo dejamos como warning o info si fuera posible, pero en Zod es error.
        // Mejor no bloquearlo si el usuario quiere dejar saldo a favor, pero el estándar dice
        // que la suma de ImpPagado debe cuadrar con el Monto del pago si se liquidan esas facturas.
    }
});

// Payment Complement Wrapper
export const paymentComplementSchema = z.object({
    type: z.literal('pago'),
    data: z.array(paymentSchema).min(1, 'Debe incluir al menos un pago en el complemento'),
})

// Main Invoice Schema (Base)
export const createInvoiceIngresoBaseSchema = z.object({
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
    complements: z.array(z.any()).optional(), // Use any for now or paymentComplementSchema if we want strictly pago
    address: addressSchema.optional(),
    external_id: z.string().optional(),
    idempotency_key: z.string().optional(),
    pdf_custom_section: z.string().optional(),
    addenda: z.string().optional(),
    namespaces: z.array(z.object({
        prefix: z.string().min(1, 'El prefijo es requerido'),
        uri: z.string().url('URI no válida'),
        schema_location: z.string().url('Schema Location no válida')
    })).optional(),
    pdf_options: z.object({
        codes: z.boolean().default(true),
        product_key: z.boolean().default(true),
        round_unit_price: z.boolean().default(false),
        tax_breakdown: z.boolean().default(true),
        ieps_breakdown: z.boolean().default(true),
        render_carta_porte: z.boolean().default(false),
    }).optional(),
    third_party: z.object({
        legal_name: z.string().optional(),
        tax_id: z.string().optional(),
        tax_system: z.string().optional(),
        zip: z.string().optional()
    }).optional(),
    items: z.array(invoiceItemSchema).min(1, 'Debe agregar al menos un concepto'),
    payments: z.array(paymentSchema).optional(),
    relationship: z.string().optional(),
    related_uuids: z.array(z.string()).optional(),
    comments: z.string().optional().default(''),
    status: z.enum(['draft', 'pending']).default('pending'),
    facturaIdParaEditar: z.string().optional(),
})

// Refined Schema for validation
export const createInvoiceIngresoSchema = createInvoiceIngresoBaseSchema.superRefine((data, ctx) => {
    // Only enforce strict validation if status is 'pending'
    // If status is 'draft', all fields are optional as per documentation
    if (data.status === 'pending') {
        if (!data.customer_id || data.customer_id.length < 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'El cliente es requerido para timbrar la factura',
                path: ['customer_id']
            });
        }

        // Only require payments for Pago (Complemento de Pago)
        if (data.tipo === 'P' && (!data.payments || data.payments.length === 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Debe agregar al menos un pago para timbrar el complemento de pago',
                path: ['payments']
            });
        }

        // Conditional validation for third_party
        const tp = data.third_party;
        if (tp && (
            (tp.legal_name?.trim()?.length ?? 0) > 0 ||
            (tp.tax_id?.trim()?.length ?? 0) > 0 ||
            (tp.tax_system?.trim()?.length ?? 0) > 0 ||
            (tp.zip?.trim()?.length ?? 0) > 0
        )) {
            if (!tp.legal_name || tp.legal_name.trim().length < 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'El nombre legal es requerido',
                    path: ['third_party', 'legal_name']
                })
            }
            if (!tp.tax_id || tp.tax_id.trim().length < 12 || tp.tax_id.trim().length > 13) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'RFC no válido (12-13 caracteres)',
                    path: ['third_party', 'tax_id']
                })
            }
            if (!tp.tax_system || tp.tax_system.trim().length !== 3) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Régimen fiscal inválido (3 dígitos)',
                    path: ['third_party', 'tax_system']
                })
            }
            if (!tp.zip || tp.zip.trim().length !== 5) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Código postal inválido (5 dígitos)',
                    path: ['third_party', 'zip']
                })
            }
        }
    }
})

export type CreateInvoiceIngresoPayload = z.infer<typeof createInvoiceIngresoBaseSchema>

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
    emisor: z.object({
        rfc: z.string(),
        razon_social: z.string(),
        regimen_fiscal: z.string().optional(),
        domicilio_fiscal_cp: z.string().optional(),
    }).optional(),
    receptor: z.object({
        rfc: z.string(),
        razon_social: z.string(),
        regimen_fiscal: z.string().optional(),
        domicilio_fiscal_cp: z.string().optional(),
        uso_cfdi: z.string().optional(),
    }).optional(),
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
    moneda: z.string().optional().nullable(),
    tipo_cambio: z.number().optional().nullable(),
    complements: z.array(z.object({
        type: z.string(),
        data: z.any(),
    })).optional().nullable(),
    createdAt: z.string().optional(),
})

export type Invoice = z.infer<typeof invoiceSchema>
