import {
    FileText,
    CreditCard,
    AlertCircle,
    CheckCircle,
    Clock,
    DollarSign,
} from 'lucide-react'
import type { Notification } from '@/stores/notification-store'

export const mockNotifications: Omit<Notification, 'id' | 'createdAt'>[] = [
    {
        logo: CheckCircle,
        title: 'Factura timbrada exitosamente',
        description: 'La factura #F-2024-001 ha sido timbrada correctamente por el SAT.',
        actionUrl: '/invoicing',
        read: false,
    },
    {
        logo: CreditCard,
        title: 'Nuevo pago recibido',
        description: 'Se ha registrado un pago de $15,000.00 MXN del cliente Acme Corp.',
        actionUrl: '/invoicing/payment-complements',
        read: false,
    },
    {
        logo: AlertCircle,
        title: 'Error en timbrado',
        description: 'La factura #F-2024-002 no pudo ser timbrada. Verifica los datos fiscales.',
        actionUrl: '/invoicing',
        read: false,
    },
    {
        logo: FileText,
        title: 'Nueva factura creada',
        description: 'Se ha creado la factura #F-2024-003 para el cliente XYZ S.A. de C.V.',
        actionUrl: '/invoicing',
        read: true,
    },
    {
        logo: Clock,
        title: 'Recordatorio: Certificado próximo a vencer',
        description: 'Tu certificado .cer vence en 15 días. Renuévalo para evitar interrupciones.',
        actionUrl: '/settings',
        read: true,
    },
    {
        logo: DollarSign,
        title: 'Reporte mensual disponible',
        description: 'El reporte de ventas de enero 2024 está listo para descargar.',
        actionUrl: '/reports/sales',
        read: true,
    },
]
