import { z } from 'zod'

export const seriesConfigSchema = z.object({
    prefix: z.string().default(''),
    next_folio: z.number().int().min(1).default(1),
})

export type SeriesConfig = z.infer<typeof seriesConfigSchema>

export const invoiceSeriesSchema = z.object({
    _id: z.string().optional(),
    workCenter: z.string(),
    workCenterName: z.string().optional(),
    enabled: z.boolean().default(true),
    isPerType: z.boolean().default(false),
    globalConfig: seriesConfigSchema.default({ prefix: 'F', next_folio: 1 }),
    typeConfigs: z.object({
        I: seriesConfigSchema.default({ prefix: 'F', next_folio: 1 }),
        E: seriesConfigSchema.default({ prefix: 'NC', next_folio: 1 }),
        P: seriesConfigSchema.default({ prefix: 'CP', next_folio: 1 }),
        N: seriesConfigSchema.default({ prefix: 'NOM', next_folio: 1 }),
        T: seriesConfigSchema.default({ prefix: 'T', next_folio: 1 }),
    }).default({
        I: { prefix: 'F', next_folio: 1 },
        E: { prefix: 'NC', next_folio: 1 },
        P: { prefix: 'CP', next_folio: 1 },
        N: { prefix: 'NOM', next_folio: 1 },
        T: { prefix: 'T', next_folio: 1 },
    }),
    status: z.enum(['active', 'deleted']).default('active'),
})

export type InvoiceSeries = z.infer<typeof invoiceSeriesSchema>
