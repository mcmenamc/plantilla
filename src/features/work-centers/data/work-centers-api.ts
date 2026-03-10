import { api } from '@/lib/api'
import { WorkCenter } from './schema'

export const getWorkCenters = async (): Promise<WorkCenter[]> => {
    const response = await api.get('/workcenter/by-business')
    return response.data.json || response.data
}

export const createWorkCenter = async (data: any): Promise<WorkCenter> => {
    const response = await api.post('/workcenter/create', data)
    return response.data
}

export const getWorkCenterById = async (id: string): Promise<WorkCenter> => {
    const response = await api.get(`/workcenter/${id}`)
    return response.data
}

export const updateWorkCenter = async ({ id, data }: { id: string, data: any }): Promise<WorkCenter> => {
    const response = await api.put(`/workcenter/${id}`, data)
    return response.data
}

export const deleteWorkCenter = async (id: string): Promise<void> => {
    await api.delete(`/workcenter/${id}`)
}

export const uploadCertificates = async (data: FormData): Promise<any> => {
    const response = await api.post('/workcenter/agregar-documentos', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return response.data
}

export const uploadFiel = async (data: FormData): Promise<any> => {
    const response = await api.post('/workcenter/agregar-fiel', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return response.data
}

export const uploadOpinionCumplimiento = async (workcenterId: string, data: FormData): Promise<any> => {
    const response = await api.post(`/workcenter/${workcenterId}/opinion-sat`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return response.data
}

export const updateCustomization = async (data: any): Promise<any> => {
    const response = await api.put('/workcenter/editar-Custom', data)
    return response.data
}

export const getTaxRegimes = async (type: 'Persona Física' | 'Persona Moral'): Promise<{ label: string, value: string }[]> => {
    const slug = type === 'Persona Física' ? 'persona-fisica' : 'persona-moral'
    // Using the full URL as provided by the user, or assuming it's under the same base if possible.
    // However, the user provided specific URLs. Let's use them directly or construct via api if they share base.
    // The base in .env is https://.../api, so /tax-regime/persona-fisica should work.
    const response = await api.get(`/tax-regime/${slug}`)
    return response.data
}

export const validateRfc = async (taxId: string): Promise<{ efos: { is_valid: boolean, data: any } }> => {
    const response = await api.get(`/generales/validate-rfc`, {
        params: { tax_id: taxId }
    })
    return response.data
}
