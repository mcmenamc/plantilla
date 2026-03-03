import { api } from '@/lib/api'
import { InvoiceSeries } from './schema'

export const getAllSeries = async (): Promise<{ data: InvoiceSeries[], status: string }> => {
    const response = await api.get('/invoice-series')
    return response.data
}

export const getSeriesById = async (id: string): Promise<{ data: InvoiceSeries, status: string }> => {
    const response = await api.get(`/invoice-series/by-id/${id}`)
    return response.data
}

export const getSeriesConfig = async (workCenterId: string): Promise<{ data: InvoiceSeries | null, status: string }> => {
    const response = await api.get(`/invoice-series/${workCenterId}`)
    return response.data
}

export const saveSeriesConfig = async (workCenterId: string, data: Partial<InvoiceSeries>): Promise<{ data: InvoiceSeries, status: string }> => {
    const response = await api.post(`/invoice-series/${workCenterId}`, data)
    return response.data
}

export const createSeries = async (data: Partial<InvoiceSeries>): Promise<{ data: InvoiceSeries, status: string }> => {
    const response = await api.post('/invoice-series', data)
    return response.data
}

export const updateSeries = async (id: string, data: Partial<InvoiceSeries>): Promise<{ data: InvoiceSeries, status: string }> => {
    const response = await api.put(`/invoice-series/by-id/${id}`, data)
    return response.data
}

export const deleteSeries = async (id: string): Promise<{ message: string, status: string }> => {
    const response = await api.delete(`/invoice-series/by-id/${id}`)
    return response.data
}

export const deleteSeriesConfig = async (workCenterId: string): Promise<{ message: string, status: string }> => {
    const response = await api.delete(`/invoice-series/${workCenterId}`)
    return response.data
}
