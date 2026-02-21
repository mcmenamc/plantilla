import { api } from '@/lib/api'
import { Product, CreateProductPayload } from './schema'

export const getProductosByWorkCenter = async (workCenterId: string): Promise<Product[]> => {
    const response = await api.get(`/productos/by-workcenter/${workCenterId}`)
    return response.data
}

export const createProducto = async (data: CreateProductPayload): Promise<void> => {
    await api.post('/productos', data)
}

export const updateProducto = async (id: string, data: Partial<CreateProductPayload>): Promise<void> => {
    await api.put(`/productos/${id}`, data)
}

export const getProductoById = async (id: string): Promise<Product> => {
    const response = await api.get(`/productos/${id}`)
    return response.data
}

export const eliminarProducto = async (id: string): Promise<void> => {
    await api.delete(`/productos/${id}`)
}

export interface SatCatalogItem {
    id: string
    name: string
}

export interface SatCatalogResponse {
    data: SatCatalogItem[]
    page: number
    total_pages: number
}

export const searchSatProducts = async (search: string, page = 1): Promise<SatCatalogResponse> => {
    const response = await api.get('/generales/productos-servicios', {
        params: { search, page, limit: 10 }
    })
    return {
        ...response.data,
        data: response.data.data.map((item: any) => ({
            id: item.key,
            name: item.description
        }))
    }
}

export const searchSatUnits = async (search: string, page = 1): Promise<SatCatalogResponse> => {
    const response = await api.get('/generales/unidades-medida', {
        params: { search, page, limit: 10 }
    })
    return {
        ...response.data,
        data: response.data.data.map((item: any) => ({
            id: item.key,
            name: item.description
        }))
    }
}
