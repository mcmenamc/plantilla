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

export const RELATION_TYPES_CATALOG = [
    { label: '01 - Nota de crédito de los documentos relacionados', value: '01' },
    { label: '02 - Nota de débito de los documentos relacionados', value: '02' },
    { label: '03 - Devuolución de mercancía sobre facturas o traslados previos', value: '03' },
    { label: '04 - Sustitución de los CFDI previos', value: '04' },
    { label: '05 - Traslados de mercancias facturados previamente', value: '05' },
    { label: '06 - Factura generada por los traslados previos', value: '06' },
    { label: '07 - CFDI por aplicación de anticipo', value: '07' },
    { label: '08 - Factura generada por pagos en parcialidades', value: '08' },
    { label: '09 - Factura generada por pagos diferidos', value: '09' },
]

export const getRelationTypes = async () => {
    return RELATION_TYPES_CATALOG
}


// Archivo de Catálogos SAT exhaustivos
// Generado según especificaciones de la documentación de Facturapi / SAT

export const FORMA_PAGO_CATALOG = [
    { value: "01", label: "01 - Efectivo" },
    { value: "02", label: "02 - Cheque nominativo" },
    { value: "03", label: "03 - Transferencia electrónica de fondos" },
    { value: "04", label: "04 - Tarjeta de crédito" },
    { value: "05", label: "05 - Monedero electrónico" },
    { value: "06", label: "06 - Dinero electrónico" },
    { value: "08", label: "08 - Vales de despensa" },
    { value: "12", label: "12 - Dación en pago" },
    { value: "13", label: "13 - Pago por subrogación" },
    { value: "14", label: "14 - Pago por consignación" },
    { value: "15", label: "15 - Condonación" },
    { value: "17", label: "17 - Compensación" },
    { value: "23", label: "23 - Novación" },
    { value: "24", label: "24 - Confusión" },
    { value: "25", label: "25 - Remisión de deuda" },
    { value: "26", label: "26 - Prescripción o caducidad" },
    { value: "27", label: "27 - A satisfacción del acreedor" },
    { value: "28", label: "28 - Tarjeta de débito" },
    { value: "29", label: "29 - Tarjeta de servicios" },
    { value: "30", label: "30 - Aplicación de anticipos" },
    { value: "31", label: "31 - Intermediario pagos" },
    { value: "99", label: "99 - Por definir" }
];

export const METODO_PAGO_CATALOG = [
    { value: "PUE", label: "PUE - Pago en una sola exhibición (de contado)" },
    { value: "PPD", label: "PPD - Pago en parcialidades o diferido" }
];

export const REGIMEN_FISCAL_CATALOG = [
    { value: "601", label: "601 - General de Ley Personas Morales" },
    { value: "603", label: "603 - Personas Morales con Fines no Lucrativos" },
    { value: "605", label: "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios" },
    { value: "606", label: "606 - Arrendamiento" },
    { value: "608", label: "608 - Demás ingresos" },
    { value: "609", label: "609 - Consolidación" },
    { value: "610", label: "610 - Residentes en el Extranjero sin Establecimiento Permanente en México" },
    { value: "611", label: "611 - Ingresos por Dividendos (socios y accionistas)" },
    { value: "612", label: "612 - Personas Físicas con Actividades Empresariales y Profesionales" },
    { value: "614", label: "614 - Ingresos por intereses" },
    { value: "616", label: "616 - Sin obligaciones fiscales" },
    { value: "620", label: "620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos" },
    { value: "621", label: "621 - Incorporación Fiscal" },
    { value: "622", label: "622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
    { value: "623", label: "623 - Opcional para Grupos de Sociedades" },
    { value: "624", label: "624 - Coordinados" },
    { value: "628", label: "628 - Hidrocarburos" },
    { value: "607", label: "607 - Régimen de Enajenación o Adquisición de Bienes" },
    { value: "629", label: "629 - De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales" },
    { value: "630", label: "630 - Enajenación de acciones en bolsa de valores" },
    { value: "615", label: "615 - Régimen de los ingresos por obtención de premios" },
    { value: "625", label: "625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas" },
    { value: "626", label: "626 - Régimen Simplificado de Confianza" }
];

export const MESES_CATALOG = [
    { value: "01", label: "01 - Enero" },
    { value: "02", label: "02 - Febrero" },
    { value: "03", label: "03 - Marzo" },
    { value: "04", label: "04 - Abril" },
    { value: "05", label: "05 - Mayo" },
    { value: "06", label: "06 - Junio" },
    { value: "07", label: "07 - Julio" },
    { value: "08", label: "08 - Agosto" },
    { value: "09", label: "09 - Septiembre" },
    { value: "10", label: "10 - Octubre" },
    { value: "11", label: "11 - Noviembre" },
    { value: "12", label: "12 - Diciembre" },
    { value: "13", label: "13 - Enero-Febrero" },
    { value: "14", label: "14 - Marzo-Abril" },
    { value: "15", label: "15 - Mayo-Junio" },
    { value: "16", label: "16 - Julio-Agosto" },
    { value: "17", label: "17 - Septiembre-Octubre" },
    { value: "18", label: "18 - Noviembre-Diciembre" }
];

export const TIPO_CONTRATO_CATALOG = [
    { value: "01", label: "01 - Contrato de trabajo por tiempo indeterminado" },
    { value: "02", label: "02 - Contrato de trabajo para obra determinada" },
    { value: "03", label: "03 - Contrato de trabajo por tiempo determinado" },
    { value: "04", label: "04 - Contrato de trabajo por temporada" },
    { value: "05", label: "05 - Contrato de trabajo sujeto a prueba" },
    { value: "06", label: "06 - Contrato de trabajo con capacitación inicial" },
    { value: "07", label: "07 - Modalidad de contratación por pago de hora laborada" },
    { value: "08", label: "08 - Modalidad de trabajo por comisión laboral" },
    { value: "09", label: "09 - Modalidades de contratación donde no existe relación de trabajo" },
    { value: "10", label: "10 - Jubilación, pensión, retiro" },
    { value: "99", label: "99 - Otro contrato" }
];

export const TIPO_JORNADA_CATALOG = [
    { value: "01", label: "01 - Diurna" },
    { value: "02", label: "02 - Nocturna" },
    { value: "03", label: "03 - Mixta" },
    { value: "04", label: "04 - Por hora" },
    { value: "05", label: "05 - Reducida" },
    { value: "06", label: "06 - Continuada" },
    { value: "07", label: "07 - Partida" },
    { value: "08", label: "08 - Por turnos" },
    { value: "99", label: "99 - Otra Jornada" }
];

export const TIPO_REGIMEN_CATALOG = [
    { value: "02", label: "02 - Sueldos" },
    { value: "03", label: "03 - Jubilados" },
    { value: "04", label: "04 - Pensionados" },
    { value: "05", label: "05 - Asimilados Miembros Sociedades Cooperativas" },
    { value: "06", label: "06 - Asimilados Integrantes Sociedades Asociaciones Civiles" },
    { value: "07", label: "07 - Asimilados Miembros consejos" },
    { value: "08", label: "08 - Asimilados comisionistas" },
    { value: "09", label: "09 - Asimilados Honorarios" },
    { value: "10", label: "10 - Asimilados acciones" },
    { value: "11", label: "11 - Asimilados otros" },
    { value: "12", label: "12 - Jubilados o Pensionados" },
    { value: "13", label: "13 - Indemnización o Separación" },
    { value: "99", label: "99 - Otro Regimen" }
];

export const RIESGO_PUESTO_CATALOG = [
    { value: "1", label: "1 - Clase I" },
    { value: "2", label: "2 - Clase II" },
    { value: "3", label: "3 - Clase III" },
    { value: "4", label: "4 - Clase IV" },
    { value: "5", label: "5 - Clase V" },
    { value: "99", label: "99 - No aplica" }
];

export const PERIODICIDAD_PAGO_CATALOG = [
    { value: "01", label: "01 - Diario" },
    { value: "02", label: "02 - Semanal" },
    { value: "03", label: "03 - Catorcenal" },
    { value: "04", label: "04 - Quincenal" },
    { value: "05", label: "05 - Mensual" },
    { value: "06", label: "06 - Bimestral" },
    { value: "07", label: "07 - Unidad obra" },
    { value: "08", label: "08 - Comisión" },
    { value: "09", label: "09 - Precio alzado" },
    { value: "10", label: "10 - Decenal" },
    { value: "99", label: "99 - Otra Periodicidad" }
];

export const TIPO_HORAS_CATALOG = [
    { value: "01", label: "01 - Dobles" },
    { value: "02", label: "02 - Triples" },
    { value: "03", label: "03 - Simples" }
];

export const TIPO_INCAPACIDAD_CATALOG = [
    { value: "01", label: "01 - Riesgo de trabajo." },
    { value: "02", label: "02 - Enfermedad en general." },
    { value: "03", label: "03 - Maternidad." },
    { value: "04", label: "04 - Licencia por cuidados médicos de hijos." }
];

export const REGIMEN_ADUANERO_CATALOG = [
    { value: "IMD", label: "IMD - Importación definitiva" },
    { value: "EXD", label: "EXD - Exportación definitiva" },
    { value: "ITR", label: "ITR - Tránsito interno de mercancías" },
    { value: "ITE", label: "ITE - Tránsito interno para exportación" },
    { value: "ETR", label: "ETR - Tránsito externo de mercancías" },
    { value: "ETE", label: "ETE - Tránsito externo para exportación" },
    { value: "DFI", label: "DFI - Depósito fiscal" },
    { value: "RFE", label: "RFE - Recinto fiscalizado estratégico" },
    { value: "RFS", label: "RFS - Recinto fiscalizado" },
    { value: "TRA", label: "TRA - Tránsito aduanero" }
];

export const MEDIO_TRANSPORTE_CATALOG = [
    { value: "01", label: "01 - Autotransporte" },
    { value: "02", label: "02 - Transporte Marítimo" },
    { value: "03", label: "03 - Transporte Aéreo" },
    { value: "04", label: "04 - Transporte Ferroviario" },
    { value: "05", label: "05 - Otro" }
];

export const TIPO_ESTACION_CATALOG = [
    { value: "01", label: "01 - Origen Nacional" },
    { value: "02", label: "02 - Intermedia" },
    { value: "03", label: "03 - Destino Final Nacional" }
];

export const PERMISOS_SCT_CATALOG = [
    { value: "TPAF01", label: "TPAF01 - Autotransporte Federal de carga general" },
    { value: "TPAF02", label: "TPAF02 - Transporte privado de carga" },
    { value: "TPAF03", label: "TPAF03 - Carga Especializada de materiales y residuos peligrosos" },
    { value: "TPAF04", label: "TPAF04 - Transporte de automóviles sin rodar en góndola" },
    { value: "TPAF05", label: "TPAF05 - Transporte de gran peso y/o volumen hasta 90 ton" },
    { value: "TPAF06", label: "TPAF06 - Transporte especializado de +90 ton" },
    { value: "TPAF07", label: "TPAF07 - Transporte Privado de materiales/residuos peligrosos" },
    { value: "TPAF08", label: "TPAF08 - Autotransporte int. de carga largo recorrido" },
    { value: "TPAF09", label: "TPAF09 - Autotransporte int. especializado materiales peligrosos" },
    { value: "TPAF10", label: "TPAF10 - Autotransporte general franja fronteriza EEUU" },
    { value: "TPAF11", label: "TPAF11 - Autotransporte especializado franja fronteriza EEUU" },
    { value: "TPAF12", label: "TPAF12 - Auxiliar de arrastre en vías generales" },
    { value: "TPAF13", label: "TPAF13 - Auxiliar de arrastre y salvamento y depósito" },
    { value: "TPAF14", label: "TPAF14 - Servicio de paquetería y mensajería" },
    { value: "TPAF15", label: "TPAF15 - Transporte especial para grúas industriales" },
    { value: "TPAF16", label: "TPAF16 - Servicio federal arrendadoras" },
    { value: "TPAF17", label: "TPAF17 - Empresas trasladistas de vehículos nuevos" },
    { value: "TPAF18", label: "TPAF18 - Empresas fabricantes/distribuidoras de vehículos nuevos" },
    { value: "TPAF19", label: "TPAF19 - Circular con tractocamión doblemente articulado" },
    { value: "TPAF20", label: "TPAF20 - Autotransporte especializado en fondos y valores" },
    { value: "TPTM01", label: "TPTM01 - Permiso temporal para navegación de cabotaje" },
    { value: "TPTA01", label: "TPTA01 - Concesión/autorización servicio regular (mexicanas)" },
    { value: "TPTA02", label: "TPTA02 - Permiso aéreo regular (extranjeras)" },
    { value: "TPTA03", label: "TPTA03 - Servicio no regular de fletamento" },
    { value: "TPTA04", label: "TPTA04 - Servicio no regular de taxi aéreo" },
    { value: "TPXX00", label: "TPXX00 - Permiso no contemplado" }
];

export const SECTOR_COFEPRIS_CATALOG = [
    { value: "01", label: "01 - Medicamento" },
    { value: "02", label: "02 - Precursores y químicos de uso dual" },
    { value: "03", label: "03 - Psicotrópicos y estupefacientes" },
    { value: "04", label: "04 - Sustancias tóxicas" },
    { value: "05", label: "05 - Plaguicidas y fertilizantes" }
];

export const FORMA_FARMACEUTICA_CATALOG = [
    { value: "01", label: "01 - Tableta" },
    { value: "02", label: "02 - Cápsulas" },
    { value: "03", label: "03 - Comprimidos" },
    { value: "04", label: "04 - Grageas" },
    { value: "05", label: "05 - Suspensión" },
    { value: "06", label: "06 - Solución" },
    { value: "07", label: "07 - Emulsión" },
    { value: "08", label: "08 - Jarabe" },
    { value: "09", label: "09 - Inyectable" },
    { value: "10", label: "10 - Crema" },
    { value: "11", label: "11 - Ungüento" },
    { value: "12", label: "12 - Aerosol" },
    { value: "13", label: "13 - Gas medicinal" },
    { value: "14", label: "14 - Gel" },
    { value: "15", label: "15 - Implante" },
    { value: "16", label: "16 - Óvulo" },
    { value: "17", label: "17 - Parche" },
    { value: "18", label: "18 - Pasta" },
    { value: "19", label: "19 - Polvo" },
    { value: "20", label: "20 - Supositorio" }
];

export const CONDICIONES_ESPECIALES_CATALOG = [
    { value: "01", label: "01 - Congelados" },
    { value: "02", label: "02 - Refrigerados" },
    { value: "03", label: "03 - Temperatura controlada" },
    { value: "04", label: "04 - Temperatura ambiente" }
];

export const TIPO_MATERIA_CATALOG = [
    { value: "01", label: "01 - Materia prima" },
    { value: "02", label: "02 - Materia procesada" },
    { value: "03", label: "03 - Materia terminada" },
    { value: "04", label: "04 - Materia para manufacturera" },
    { value: "05", label: "05 - Otra" }
];

export const TIPO_DOCUMENTO_ADUANERO_CATALOG = [
    { value: "01", label: "01 - Pedimento" },
    { value: "02", label: "02 - Importación temporal" },
    { value: "03", label: "03 - Importación temporal embarcaciones" },
    { value: "04", label: "04 - Importación temporal para reparación" },
    { value: "05", label: "05 - Importación de vehículos especializados" },
    { value: "06", label: "06 - Aviso de exportación temporal" },
    { value: "07", label: "07 - Aviso traslado (IMMEX/RFE/Operador Autorizado)" },
    { value: "08", label: "08 - Aviso traslado autopartes franja fronteriza" },
    { value: "09", label: "09 - Constancia importación contenedores" },
    { value: "10", label: "10 - Constancia de transferencia de mercancías" },
    { value: "11", label: "11 - Donación de mercancías (extranjero)" },
    { value: "12", label: "12 - Cuaderno ATA" },
    { value: "13", label: "13 - Listas de intercambio" },
    { value: "14", label: "14 - Permiso Importación Temporal" },
    { value: "15", label: "15 - Permiso casa rodante" },
    { value: "16", label: "16 - Permiso embarcaciones" },
    { value: "17", label: "17 - Donación (emergencias/desastres)" },
    { value: "18", label: "18 - Aviso de consolidado" },
    { value: "19", label: "19 - Aviso de cruce de mercancias" },
    { value: "20", label: "20 - Otro" }
];

export const TIPO_TRANSPORTE_CATALOG = [
    { value: "PT01", label: "PT01 - Camión unitario" },
    { value: "PT02", label: "PT02 - Camión" },
    { value: "PT03", label: "PT03 - Tractocamión" },
    { value: "PT04", label: "PT04 - Remolque" },
    { value: "PT05", label: "PT05 - Semirremolque" },
    { value: "PT06", label: "PT06 - Vehículo ligero de carga" },
    { value: "PT07", label: "PT07 - Grúa" },
    { value: "PT08", label: "PT08 - Aeronave" },
    { value: "PT09", label: "PT09 - Barco o buque" },
    { value: "PT10", label: "PT10 - Carro o vagón" },
    { value: "PT11", label: "PT11 - Contenedor" },
    { value: "PT12", label: "PT12 - Locomotora" }
];

export const FIGURAS_TRANSPORTE_CATALOG = [
    { value: "01", label: "01 - Operador" },
    { value: "02", label: "02 - Propietario" },
    { value: "03", label: "03 - Arrendador" },
    { value: "04", label: "04 - Notificado" },
    { value: "05", label: "05 - Integrante de Coordinados" }
];

export const REGISTRO_ISTMO_CATALOG = [
    { value: "01", label: "01 - Coatzacoalcos I" },
    { value: "02", label: "02 - Coatzacoalcos II" },
    { value: "03", label: "03 - Texistepec" },
    { value: "04", label: "04 - San Juan Evangelista" },
    { value: "05", label: "05 - Salina Cruz" },
    { value: "06", label: "06 - San Blas Atempa" }
];

export const CLAVE_TIPO_CARGA_CATALOG = [
    { value: "CGS", label: "CGS - Carga General Suelta" },
    { value: "CGC", label: "CGC - Carga General Contenerizada" },
    { value: "GMN", label: "GMN - Gran Mineral" },
    { value: "GAG", label: "GAG - Granel Agrícola" },
    { value: "OFL", label: "OFL - Otros Fluidos" },
    { value: "PYD", label: "PYD - Petróleo y Derivados" }
];

export const CONFIGURACION_MARITIMA_CATALOG = [
    { value: "B01", label: "B01 - Abastecedor" },
    { value: "B02", label: "B02 - Barcaza" },
    { value: "B03", label: "B03 - Granelero" },
    { value: "B04", label: "B04 - Porta Contenedor" },
    { value: "B05", label: "B05 - Draga" },
    { value: "B06", label: "B06 - Pesquero" },
    { value: "B07", label: "B07 - Carga General" },
    { value: "B08", label: "B08 - Quimiqueros" },
    { value: "B09", label: "B09 - Transbordadores" },
    { value: "B10", label: "B10 - Carga RoRo" },
    { value: "B11", label: "B11 - Investigación" },
    { value: "B12", label: "B12 - Tanquero" },
    { value: "B13", label: "B13 - Gasero" },
    { value: "B14", label: "B14 - Remolcador" },
    { value: "B15", label: "B15 - Extraordinaria especialización" }
];

export const TIPO_TRAFICO_FERROVIARIO_CATALOG = [
    { value: "TT01", label: "TT01 - Tráfico local" },
    { value: "TT02", label: "TT02 - Tráfico interlineal remitido" },
    { value: "TT03", label: "TT03 - Tráfico interlineal recibido" },
    { value: "TT04", label: "TT04 - Tráfico interlineal en tránsito" }
];

export const TIPO_CONTENEDOR_CATALOG = [
    { value: "TC01", label: "TC01 - Contenedor 6.1 Mts" },
    { value: "TC02", label: "TC02 - Contenedor 12.2 Mts" },
    { value: "TC03", label: "TC03 - Contenedor 13.7 Mts" },
    { value: "TC04", label: "TC04 - Contenedor 14.6 Mts" },
    { value: "TC05", label: "TC05 - Contenedor 16.1 Mts" }
];

export const TIPO_CONTENEDOR_MARITIMO_CATALOG = [
    { value: "CM001", label: "CM001 - Contenedores refrigerados 20FT" },
    { value: "CM002", label: "CM002 - Contenedores refrigerados 40FT" },
    { value: "CM003", label: "CM003 - Contenedores estándar 8FT" },
    { value: "CM004", label: "CM004 - Contenedores estándar 10FT" },
    { value: "CM005", label: "CM005 - Contenedores estándar 20FT" },
    { value: "CM006", label: "CM006 - Contenedores estándar 40FT" },
    { value: "CM007", label: "CM007 - Contenedores Open Side" },
    { value: "CM008", label: "CM008 - Contenedor Isotanque" },
    { value: "CM009", label: "CM009 - Contenedor flat racks" },
    { value: "CM010", label: "CM010 - Buque tanque" },
    { value: "CM011", label: "CM011 - Ferri" },
    { value: "CM012", label: "CM012 - Ferri Turístico y vacíos" }
];

export const TIPO_CARRO_FERROVIARIO_CATALOG = [
    { value: "TC01", label: "TC01 - Furgón" },
    { value: "TC02", label: "TC02 - Góndola" },
    { value: "TC03", label: "TC03 - Tolva" },
    { value: "TC04", label: "TC04 - Tanque" },
    { value: "TC05", label: "TC05 - Plataforma Intermodal" },
    { value: "TC06", label: "TC06 - Plataforma de Uso General" },
    { value: "TC07", label: "TC07 - Plataforma Automotriz" },
    { value: "TC08", label: "TC08 - Locomotora" },
    { value: "TC09", label: "TC09 - Carro Especial" },
    { value: "TC10", label: "TC10 - Pasajeros" },
    { value: "TC11", label: "TC11 - Mantenimiento de Vía" }
];

export const TIPO_SERVICIO_FERROVIARIO_CATALOG = [
    { value: "TS01", label: "TS01 - Carros Ferroviarios" },
    { value: "TS02", label: "TS02 - Carros Ferroviarios intermodal" },
    { value: "TS03", label: "TS03 - Tren unitario de carros ferroviarios" },
    { value: "TS04", label: "TS04 - Tren unitario Intermodal" }
];

export const CLAVE_UNIDAD_PESO_CATALOG = [
    { value: 'KGM', label: 'KGM - Kilogramo' },
    { value: 'TNE', label: 'TNE - Tonelada Métrica' },
    { value: 'GRM', label: 'GRM - Gramo' },
    { value: 'LBR', label: 'LBR - Libra' },
    { value: 'ONZ', label: 'ONZ - Onza' },
    { value: 'MGM', label: 'MGM - Miligramo' },
    { value: 'STN', label: 'STN - Tonelada corta (EEUU)' },
    { value: 'LTN', label: 'LTN - Tonelada larga (RU)' }
];

export const COUNTRIES_CATALOG = [
    { label: "México", value: "MEX" },
    { label: "Estados Unidos", value: "USA" },
    { label: "Canadá", value: "CAN" },
];

export const STATES_MEXICO = [
    { label: "Aguascalientes", value: "Aguascalientes" },
    { label: "Baja California", value: "Baja California" },
    { label: "Baja California Sur", value: "Baja California Sur" },
    { label: "Campeche", value: "Campeche" },
    { label: "Chiapas", value: "Chiapas" },
    { label: "Chihuahua", value: "Chihuahua" },
    { label: "Coahuila", value: "Coahuila" },
    { label: "Colima", value: "Colima" },
    { label: "Ciudad de México", value: "Ciudad de México" },
    { label: "Durango", value: "Durango" },
    { label: "Guanajuato", value: "Guanajuato" },
    { label: "Guerrero", value: "Guerrero" },
    { label: "Hidalgo", value: "Hidalgo" },
    { label: "Jalisco", value: "Jalisco" },
    { label: "Estado de México", value: "México" },
    { label: "Michoacán", value: "Michoacán" },
    { label: "Morelos", value: "Morelos" },
    { label: "Nayarit", value: "Nayarit" },
    { label: "Nuevo León", value: "Nuevo León" },
    { label: "Oaxaca", value: "Oaxaca" },
    { label: "Puebla", value: "Puebla" },
    { label: "Querétaro", value: "Querétaro" },
    { label: "Quintana Roo", value: "Quintana Roo" },
    { label: "San Luis Potosí", value: "San Luis Potosí" },
    { label: "Sinaloa", value: "Sinaloa" },
    { label: "Sonora", value: "Sonora" },
    { label: "Tabasco", value: "Tabasco" },
    { label: "Tamaulipas", value: "Tamaulipas" },
    { label: "Tlaxcala", value: "Tlaxcala" },
    { label: "Veracruz", value: "Veracruz" },
    { label: "Yucatán", value: "Yucatán" },
    { label: "Zacatecas", value: "Zacatecas" }
];

export const STATES_USA = [
    { label: "Alabama", value: "AL" },
    { label: "Alaska", value: "AK" },
    { label: "Arizona", value: "AZ" },
    { label: "Arkansas", value: "AR" },
    { label: "California", value: "CA" },
    { label: "Colorado", value: "CO" },
    { label: "Connecticut", value: "CT" },
    { label: "Delaware", value: "DE" },
    { label: "Florida", value: "FL" },
    { label: "Georgia", value: "GA" },
    { label: "Hawaii", value: "HI" },
    { label: "Idaho", value: "ID" },
    { label: "Illinois", value: "IL" },
    { label: "Indiana", value: "IN" },
    { label: "Iowa", value: "IA" },
    { label: "Kansas", value: "KS" },
    { label: "Kentucky", value: "KY" },
    { label: "Louisiana", value: "LA" },
    { label: "Maine", value: "ME" },
    { label: "Maryland", value: "MD" },
    { label: "Massachusetts", value: "MA" },
    { label: "Michigan", value: "MI" },
    { label: "Minnesota", value: "MN" },
    { label: "Mississippi", value: "MS" },
    { label: "Missouri", value: "MO" },
    { label: "Montana", value: "MT" },
    { label: "Nebraska", value: "NE" },
    { label: "Nevada", value: "NV" },
    { label: "New Hampshire", value: "NH" },
    { label: "New Jersey", value: "NJ" },
    { label: "New Mexico", value: "NM" },
    { label: "New York", value: "NY" },
    { label: "North Carolina", value: "NC" },
    { label: "North Dakota", value: "ND" },
    { label: "Ohio", value: "OH" },
    { label: "Oklahoma", value: "OK" },
    { label: "Oregon", value: "OR" },
    { label: "Pennsylvania", value: "PA" },
    { label: "Rhode Island", value: "RI" },
    { label: "South Carolina", value: "SC" },
    { label: "South Dakota", value: "SD" },
    { label: "Tennessee", value: "TN" },
    { label: "Texas", value: "TX" },
    { label: "Utah", value: "UT" },
    { label: "Vermont", value: "VT" },
    { label: "Virginia", value: "VA" },
    { label: "Washington", value: "WA" },
    { label: "West Virginia", value: "WV" },
    { label: "Wisconsin", value: "WI" },
    { label: "Wyoming", value: "WY" }
];

export const STATES_CANADA = [
    { label: "Alberta", value: "AB" },
    { label: "British Columbia", value: "BC" },
    { label: "Manitoba", value: "MB" },
    { label: "New Brunswick", value: "NB" },
    { label: "Newfoundland and Labrador", value: "NL" },
    { label: "Nova Scotia", value: "NS" },
    { label: "Ontario", value: "ON" },
    { label: "Prince Edward Island", value: "PE" },
    { label: "Quebec", value: "QC" },
    { label: "Saskatchewan", value: "SK" },
    { label: "Northwest Territories", value: "NT" },
    { label: "Nunavut", value: "NU" },
    { label: "Yukon", value: "YT" }
];
