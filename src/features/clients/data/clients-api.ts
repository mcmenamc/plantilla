import { api } from '@/lib/api'
import { Client, CreateClientPayload } from './schema'

export const getClientsByWorkCenter = async (workCenterId: string): Promise<Client[]> => {
    const response = await api.get(`/customer/by-workcenter/${workCenterId}`)
    return response.data
}

export const createClient = async (data: CreateClientPayload): Promise<Client> => {
    const response = await api.post('/customer', data)
    return response.data
}

export const getClientById = async (id: string): Promise<Client> => {
    const response = await api.get(`/customer/${id}`)
    return response.data
}

export const updateClient = async (id: string, data: Partial<CreateClientPayload>): Promise<Client> => {
    const response = await api.put(`/customer/${id}`, data)
    return response.data
}

export const deleteClient = async (id: string): Promise<void> => {
    await api.delete(`/customer/${id}`)
}

export const getUsoCfdi = async (): Promise<{ label: string, value: string }[]> => {
    const response = await api.get('/uso-cfdi')
    return response.data
}
