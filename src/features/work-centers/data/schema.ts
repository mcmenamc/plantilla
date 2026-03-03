import { z } from 'zod'

// Schema for reading Work Centers (matches GET response structure)
export const workCenterSchema = z.object({
    _id: z.string(),
    workcenterName: z.string(),
    phone: z.string(),
    regimenFiscal: z.string(),
    rfc: z.string(),
    tipo_persona: z.string(),
    businessId: z.string(),
    estatus: z.string(),
    hasStamps: z.boolean().optional(),
    fechaVencimiento: z.string().nullable().optional(),
    cerFile: z.string().optional(),
    keyFile: z.string().optional(),
    imagen: z.string().optional(),
    workcenterIdFacturaApi: z.string().optional().nullable(),
    opinionCumplimiento: z.object({
        url: z.string(),
        valida: z.boolean()
    }).optional().nullable(),
    direccion: z.object({
        calle: z.string(),
        exterior: z.string(),
        interior: z.string().optional().nullable(),
        localidad_ciudad: z.string(),
        municipio: z.string(),
        estado: z.string(),
        cp: z.string(),
    }),
    createdAt: z.string(),
    updatedAt: z.string(),
    __v: z.number().optional(),
})

// Schema for creating Work Centers (matches POST req.body flat structure)
export const createWorkCenterSchema = z.object({
    rfc: z.string()
        .regex(/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/, 'El RFC no tiene un formato válido'),
    nombre: z.string().min(1, 'El nombre del workcenter es obligatorio'),
    phone: z.string().length(10, 'El teléfono debe tener 10 dígitos'),
    regimenFiscal: z.string().min(1, 'El régimen fiscal es obligatorio'),
    tipo_persona: z.enum(['Persona Física', 'Persona Moral']),
    legal_name: z.string().min(1, 'La razón social es obligatoria'),
    calle: z.string().min(1, 'La calle es obligatoria'),
    num_exterior: z.string().min(1, 'El número exterior es obligatorio'),
    cp: z.string().regex(/^[0-9]{5}$/, 'El código postal debe tener 5 dígitos'),
    num_interior: z.string().optional(),
    colonia: z.string().optional().or(z.literal('')),
    ciudad: z.string().optional().or(z.literal('')),
    municipio: z.string().optional().or(z.literal('')),
    estado: z.string().optional().or(z.literal('')),
    email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
})

export type WorkCenter = z.infer<typeof workCenterSchema>
export type CreateWorkCenterPayload = z.infer<typeof createWorkCenterSchema>
