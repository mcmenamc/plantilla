import { api } from '@/lib/api'
import { CreateInvoiceIngresoPayload, Invoice } from './schema'

export const createInvoice = async (data: CreateInvoiceIngresoPayload): Promise<{ data_facturaApi: any, data_hazFactura: Invoice }> => {
    const response = await api.post('/factura', data)
    return response.data
}

export const getInvoicesByWorkCenter = async (workCenterId: string): Promise<Invoice[]> => {
    const response = await api.get(`/factura/${workCenterId}`)
    return response.data
}

export const getInvoiceById = async (id: string): Promise<{ facturaHaz: Invoice, facturaApi: any }> => {
    const response = await api.get(`/factura/factura-by-id/${id}`)
    return response.data
}

export const getSignedUrl = async (path: string): Promise<{ signedUrl: string }> => {
    const response = await api.post('/generales/signed-url', { path })
    return response.data
}

// SAT Catalogs (assuming endpoints exist based on the frontend structure seen in catalogs feature)
export const getPaymentForms = async () => {
    // In a real scenario, these would come from an API or a local constant
    return [
        { label: '01 - Efectivo', value: '01' },
        { label: '02 - Cheque nominativo', value: '02' },
        { label: '03 - Transferencia electrónica de fondos', value: '03' },
        { label: '04 - Tarjeta de crédito', value: '04' },
        { label: '28 - Tarjeta de débito', value: '28' },
        { label: '99 - Por definir', value: '99' },
    ]
}

export const getCfdiUses = async () => {
    return [
        { label: 'G01 - Adquisición de mercancías', value: 'G01' },
        { label: 'G03 - Gastos en general', value: 'G03' },
        { label: 'I01 - Construcciones', value: 'I01' },
        { label: 'S01 - Sin efectos fiscales', value: 'S01' },
        { label: 'CP01 - Pagos', value: 'CP01' },
        { label: 'CN01 - Nómina', value: 'CN01' },
    ]
}

export const getExportationOptions = async () => {
    return [
        { label: '01 - No aplica', value: '01' },
        { label: '02 - Definitiva con clave A1', value: '02' },
        { label: '03 - Temporal', value: '03' },
        { label: '04 - Definitiva con clave distinta a A1', value: '04' },
    ]
}
