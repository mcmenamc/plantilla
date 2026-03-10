import { api } from '@/lib/api'

export interface MassiveDownload {
    _id: string;
    rfc: string;
    requestId?: string;
    status: 'pending' | 'completed' | 'error';
    fechaInicio: string;
    fechaFin: string;
    tipo: 'issued' | 'received' | 'all';
    serviceType?: 'cfdi' | 'retenciones';
    requestType?: 'xml' | 'metadata';
    documentType?: string;
    documentStatus?: string;
    complement?: string;
    rfcMatch?: string;
    rfcOnBehalf?: string;
    uuid?: string;
    totalXmls: number;
    errorDescription?: string;
    excelS3Key?: string;
    zipS3Key?: string;
    createdAt: string;
    updatedAt: string;
    xmlFiles: Array<{ nombre: string; s3Key: string; tamanoBytes: number }>;
    logs: Array<{ fecha: string; evento: string; mensaje: string }>;
}

export const solicitarDescarga = async (data: {
    fechaInicio: string;
    fechaFin: string;
    tipo: 'issued' | 'received';
    workCenterId: string;
    requestType?: 'xml' | 'metadata';
    documentType?: string;
    documentStatus?: 'active' | 'cancelled' | 'undefined';
    serviceType?: 'cfdi' | 'retenciones';
    complement?: string;
    rfcMatch?: string;
    rfcOnBehalf?: string;
    uuid?: string;
}): Promise<any> => {
    const response = await api.post('/massive-downloads', data)
    return response.data
}

export const getDescargasByWorkCenter = async (workCenterId: string): Promise<MassiveDownload[]> => {
    const response = await api.get(`/massive-downloads/${workCenterId}`)
    return response.data
}

export const dispararVerificacionDescargas = async (): Promise<any> => {
    const response = await api.get('/massive-downloads/verificar')
    return response.data
}
export const verificarEstatusIndividual = async (id: string): Promise<MassiveDownload> => {
    const response = await api.get(`/massive-downloads/${id}/verificar-estatus`)
    return response.data
}

