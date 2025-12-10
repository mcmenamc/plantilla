import { z } from 'zod'

export const productSchema = z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
    price: z.number(),
    stock: z.number(),
    status: z.string(),
    createdAt: z.date(),
})

export type Product = z.infer<typeof productSchema>
