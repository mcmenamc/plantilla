import { api } from '@/lib/api'
import { Administrator, Module } from './schema'

export const getModules = async (): Promise<Module[]> => {
    const response = await api.get('/administrators/modules')
    return response.data
}

export const getAdministratorsByWorkCenter = async (workCenterId: string): Promise<Administrator[]> => {
    const response = await api.get(`/administrators/workcenter/${workCenterId}`)
    return response.data
}

export const getAdministratorById = async (id: string): Promise<Administrator> => {
    const response = await api.get(`/administrators/${id}`)
    return response.data
}

export const createAdministrator = async (data: any): Promise<{ message: string, administrator: Administrator }> => {
    const response = await api.post('/administrators', data)
    return response.data
}

export const updatePermissions = async ({ id, data }: { id: string, data: any }): Promise<{ message: string, administrator: Administrator }> => {
    const response = await api.put(`/administrators/${id}`, data)
    return response.data
}

export const deleteAdministrator = async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/administrators/${id}`)
    return response.data
}
