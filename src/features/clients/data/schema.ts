import { z } from 'zod'

export const clientSchema = z.object({
    _id: z.string(),
    razonSocial: z.string(),
    email: z.string(),
    rfc: z.string(),
    regimenFiscal: z.string(),
    tipo_persona: z.string(),
    estatus: z.string(),
    workcenterId: z.string(),
    customerIdFacturaApi: z.string().optional().nullable(),
    default_invoice_use: z.string().optional().nullable(),
    cp: z.string(),
    street: z.string().optional().nullable(),
    exterior: z.string().optional().nullable(),
    interior: z.string().optional().nullable(),
    neighborhood: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    municipality: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    country: z.string().optional().default('MEX'),
    phone: z.string().optional().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    __v: z.number().optional(),
})

export const createClientSchema = z.object({
    rfc: z.string()
        .regex(/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/, 'El RFC no tiene un formato válido'),
    razonSocial: z.string().min(1, 'La razón social es obligatoria'),
    email: z.string().email('Correo electrónico inválido').min(1, 'El email es obligatorio'),
    tipo_persona: z.enum(['Persona Física', 'Persona Moral']),
    regimenFiscal: z.string().min(1, 'El régimen fiscal es obligatorio'),
    cp: z.string().regex(/^[0-9]{5}$/, 'El código postal debe tener 5 dígitos'),
    workcenterId: z.string().min(1, 'El centro de trabajo es obligatorio'),
    default_invoice_use: z.string().optional().nullable(),
    street: z.string().optional(),
    exterior: z.string().optional(),
    interior: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    municipality: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional().refine((val) => !val || /^[0-9]{10}$/.test(val), {
        message: 'El teléfono debe tener exactamente 10 dígitos numéricos',
    }),
})

export type Client = z.infer<typeof clientSchema>
export type CreateClientPayload = z.infer<typeof createClientSchema>
