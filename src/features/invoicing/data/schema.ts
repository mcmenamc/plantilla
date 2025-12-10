import { z } from 'zod'

export const invoiceSchema = z.object({
    id: z.string(),
    folio: z.string(),
    client: z.string(),
    total: z.number(),
    status: z.string(),
    date: z.date(),
    type: z.string(), // factura, nota_credito, complemento, carta_porte
})

export type Invoice = z.infer<typeof invoiceSchema>
