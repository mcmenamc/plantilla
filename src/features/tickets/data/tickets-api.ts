import { api } from '@/lib/api'
import { CreateTicketPayload, Ticket } from './schema'

export const getTickets = async (): Promise<Ticket[]> => {
  const response = await api.get('/tickets')
  return response.data
}

export const getTicket = async (id: string): Promise<Ticket> => {
  const response = await api.get(`/tickets/${id}`)
  return response.data
}

export const createTicket = async (data: CreateTicketPayload): Promise<Ticket> => {
  const response = await api.post('/tickets', data)
  return response.data
}

export const updateTicket = async (id: string, data: Partial<CreateTicketPayload>): Promise<Ticket> => {
  const response = await api.put(`/tickets/${id}`, data)
  return response.data
}

export const deleteTicket = async (id: string): Promise<void> => {
  await api.delete(`/tickets/${id}`)
}

export const getModules = async (): Promise<any[]> => {
  const response = await api.get('/tickets/modules')
  return response.data
}

export const updateTicketStatus = async (id: string, status: string, comment?: string, images?: string[]): Promise<Ticket> => {
  const response = await api.put(`/tickets/${id}/status`, { status, comment, images })
  return response.data
}

export const addTracking = async (id: string, comment: string, images?: string[]): Promise<Ticket> => {
  const response = await api.post(`/tickets/${id}/tracking`, { comment, images })
  return response.data
}

export const getSignedUrl = async (path: string): Promise<{ signedUrl: string }> => {
    const response = await api.post('/generales/signed-url', { path })
    return response.data
}

export const getPutSignedUrl = async (path: string, contentType: string): Promise<{ signedUrl: string }> => {
  const response = await api.post('/generales/put-signed-url', { path, contentType })
  return response.data
}

/**
 * Upload a file through the backend to S3.
 * Returns both the S3 path (for saving to DB) and a signed URL (for preview).
 */
export const uploadFileToS3 = async (file: File, folder = 'tickets'): Promise<{ path: string; signedUrl: string }> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  const response = await api.post('/generales/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data // { path, signedUrl }
}
