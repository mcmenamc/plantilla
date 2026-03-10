import { api } from '@/lib/api'

export async function actualizarPerfil(data: any) {
    const response = await api.put('/user/actualizar-perfil', data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
    })
    return response.data
}

export async function actualizarBusiness(data: {
    id: string
    name: string
    legalName: string
    rfc: string
    regimenFiscal: string
    phone: string
    tipoPersona: string
    street?: string
    exterior?: string
    interior?: string
    zip?: string
    neighborhood?: string
    city?: string
    municipality?: string
    state?: string
    country?: string
}) {
    const response = await api.put('/business/actualizar-business', data)
    return response.data
}
