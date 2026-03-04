import { z } from 'zod'

export const productSchema = z.object({
    _id: z.string(),
    description: z.string(),
    product_key: z.string(),
    product_key_nombre: z.string(),
    price: z.number(),
    tax_included: z.boolean(),
    taxability: z.string(),
    taxes: z.array(z.object({
        type: z.enum(['IVA', 'ISR', 'IEPS']),
        rate: z.number(),
        base: z.number().default(100),
        factor: z.enum(['Tasa', 'Cuota', 'Exento']).optional(),
        withholding: z.boolean().optional(),
    })),
    local_taxes: z.array(z.object({
        type: z.string(),
        rate: z.number(),
        base: z.number().default(100),
        withholding: z.boolean().optional(),
    })),
    unit_key: z.string(),
    unit_name: z.string(),
    sku: z.string().optional(),
    workCenter: z.string(),
    productIdFacturaApi: z.string().optional().nullable(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
})

export const createProductSchema = z.object({
    descripcion: z.string().min(1, 'La descripción es obligatoria'),
    product_key: z.string().min(1, 'La clave de producto es obligatoria'),
    product_key_nombre: z.string().min(1, 'El nombre de la clave es obligatorio'),
    precio: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
    tax_included: z.boolean(),
    taxability: z.string(),
    taxes: z.array(z.object({
        type: z.enum(['IVA', 'ISR', 'IEPS']),
        rate: z.number(),
        withholding: z.boolean(),
        base: z.number().default(100),
        factor: z.enum(['Tasa', 'Cuota', 'Exento']).default('Tasa'),
    })),
    local_taxes: z.array(z.object({
        type: z.string().min(1, 'El nombre del impuesto local es obligatorio'),
        rate: z.number(),
        withholding: z.boolean().default(false),
        base: z.number().default(100),
    })).default([]),
    unit_key: z.string().min(1, 'La clave de unidad es obligatoria'),
    unit_name: z.string().min(1, 'El nombre de unidad es obligatorio'),
    sku: z.string().optional(),
    workCenterId: z.string().min(1, 'El centro de trabajo es obligatorio'),
})

export type Product = z.infer<typeof productSchema>
export type CreateProductPayload = z.infer<typeof createProductSchema>
