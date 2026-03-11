import { api } from '@/lib/api'

export interface CreatePaymentResponse {
  clientSecret: string
  paymentIntentId: string
  paymentId: string
}

export interface PaymentHistorico {
  _id: string
  cantidadTimbres: number
  monto: number
  estatus: 'pending' | 'completed' | 'succeeded' | 'failed' | 'requires_action'
  createdAt: string
}

export const crearIntentoPago = async (timbres: number): Promise<CreatePaymentResponse> => {
  const response = await api.post('/pagos/pago', { timbres })
  return response.data
}

export const getHistorialPagos = async (): Promise<PaymentHistorico[]> => {
  const response = await api.get('/pagos/historial')
  return response.data
}
