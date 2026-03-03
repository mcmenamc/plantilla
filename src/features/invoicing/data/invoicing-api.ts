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
    // Catálogo completo de Formas de Pago (SAT)
    return [
        { label: '01 - Efectivo', value: '01' },
        { label: '02 - Cheque nominativo', value: '02' },
        { label: '03 - Transferencia electrónica de fondos', value: '03' },
        { label: '04 - Tarjeta de crédito', value: '04' },
        { label: '05 - Monedero electrónico', value: '05' },
        { label: '06 - Dinero electrónico', value: '06' },
        { label: '08 - Vales de despensa', value: '08' },
        { label: '12 - Dación en pago', value: '12' },
        { label: '13 - Pago por subrogación', value: '13' },
        { label: '14 - Pago por consignación', value: '14' },
        { label: '15 - Condonación', value: '15' },
        { label: '17 - Compensación', value: '17' },
        { label: '23 - Novación', value: '23' },
        { label: '24 - Confusión', value: '24' },
        { label: '25 - Remisión de deuda', value: '25' },
        { label: '26 - Prescripción o caducidad', value: '26' },
        { label: '27 - A satisfacción del acreedor', value: '27' },
        { label: '28 - Tarjeta de débito', value: '28' },
        { label: '29 - Tarjeta de servicios', value: '29' },
        { label: '30 - Aplicación de anticipos', value: '30' },
        { label: '31 - Intermediario pagos', value: '31' },
        { label: '99 - Por definir', value: '99' },
    ]
}

export const CFDI_USES_CATALOG = [
    { value: "G01", label: "G01 - Adquisición de mercancías.", validRegimes: ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"] },
    { value: "G02", label: "G02 - Devoluciones, descuentos o bonificaciones.", validRegimes: ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"] },
    { value: "G03", label: "G03 - Gastos en general.", validRegimes: ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"] },
    { value: "I01", label: "I01 - Construcciones.", validRegimes: ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"] },
    { value: "I02", label: "I02 - Mobiliario y equipo de oficina por inversiones.", validRegimes: ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"] },
    { value: "I03", label: "I03 - Equipo de transporte.", validRegimes: ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"] },
    { value: "I04", label: "I04 - Equipo de computo y accesorios.", validRegimes: ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"] },
    { value: "I05", label: "I05 - Dados, troqueles, moldes, matrices y herramental.", validRegimes: ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"] },
    { value: "I06", label: "I06 - Comunicaciones telefónicas.", validRegimes: ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"] },
    { value: "I07", label: "I07 - Comunicaciones satelitales.", validRegimes: ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"] },
    { value: "I08", label: "I08 - Otra maquinaria y equipo.", validRegimes: ["601", "603", "606", "612", "620", "621", "622", "623", "624", "625", "626"] },
    { value: "D01", label: "D01 - Honorarios médicos, dentales y gastos hospitalarios.", validRegimes: ["605", "606", "608", "611", "612", "614", "607", "615", "625"] },
    { value: "D02", label: "D02 - Gastos médicos por incapacidad o discapacidad.", validRegimes: ["605", "606", "608", "611", "612", "614", "607", "615", "625"] },
    { value: "D03", label: "D03 - Gastos funerales.", validRegimes: ["605", "606", "608", "611", "612", "614", "607", "615", "625"] },
    { value: "D04", label: "D04 - Donativos.", validRegimes: ["605", "606", "608", "611", "612", "614", "607", "615", "625"] },
    { value: "D05", label: "D05 - Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación).", validRegimes: ["605", "606", "608", "611", "612", "614", "607", "615", "625"] },
    { value: "D06", label: "D06 - Aportaciones voluntarias al SAR.", validRegimes: ["605", "606", "608", "611", "612", "614", "607", "615", "625"] },
    { value: "D07", label: "D07 - Primas por seguros de gastos médicos.", validRegimes: ["605", "606", "608", "611", "612", "614", "607", "615", "625"] },
    { value: "D08", label: "D08 - Gastos de transportación escolar obligatoria.", validRegimes: ["605", "606", "608", "611", "612", "614", "607", "615", "625"] },
    { value: "D09", label: "D09 - Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones.", validRegimes: ["605", "606", "608", "611", "612", "614", "607", "615", "625"] },
    { value: "D10", label: "D10 - Pagos por servicios educativos (colegiaturas).", validRegimes: ["605", "606", "608", "611", "612", "614", "607", "615", "625"] },
    { value: "S01", label: "S01 - Sin efectos fiscales.", validRegimes: ["601", "603", "605", "606", "608", "610", "611", "612", "614", "616", "620", "621", "622", "623", "624", "607", "615", "625", "626"] },
    { value: "CP01", label: "CP01 - Pagos", validRegimes: ["601", "603", "605", "606", "608", "610", "611", "612", "614", "616", "620", "621", "622", "623", "624", "607", "615", "625", "626"] },
    { value: "CN01", label: "CN01 - Nómina", validRegimes: ["605"] },
]

export const getCfdiUses = async (taxRegimeId?: string) => {
    if (!taxRegimeId) {
        return CFDI_USES_CATALOG.map(c => ({ label: c.label, value: c.value }))
    }
    return CFDI_USES_CATALOG
        .filter(c => c.validRegimes.includes(taxRegimeId))
        .map(c => ({ label: c.label, value: c.value }))
}

export const getExportationOptions = async () => {
    return [
        { label: '01 - No aplica', value: '01' },
        { label: '02 - Definitiva con clave A1', value: '02' },
        { label: '03 - Temporal', value: '03' },
        { label: '04 - Definitiva con clave distinta a A1', value: '04' },
    ]
}

export const TAXABILITY_CATALOG = [
    { label: '01 - No objeto de impuesto.', value: '01' },
    { label: '02 - Sí objeto de impuesto.', value: '02' },
    { label: '03 - Sí objeto de impuesto, pero no obligado a desglose.', value: '03' },
    { label: '04 - Sí objeto de impuesto, y no causa impuesto.', value: '04' },
    { label: '05 - Sí objeto de impuesto, IVA crédito PODEBI.', value: '05' },
    { label: '06 - Sí objeto de impuesto, no IVA trasladado.', value: '06' },
    { label: '07 - No traslado de IVA, pero desglose de IEPS.', value: '07' },
    { label: '08 - No traslado de IVA sin desglose de IEPS.', value: '08' },
]

export const getTaxabilityOptions = async () => {
    return TAXABILITY_CATALOG
}
