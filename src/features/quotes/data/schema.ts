import { z } from 'zod'

export const quoteSchema = z.object({
    id: z.string(),
    folio: z.string(),
    client: z.string(),
    total: z.number(),
    status: z.string(),
    date: z.date(),
    validUntil: z.date(),
})

export type Quote = z.infer<typeof quoteSchema>
