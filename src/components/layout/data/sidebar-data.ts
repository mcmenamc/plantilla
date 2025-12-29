import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Map,
  FileText,
  Files,
  CreditCard,
  Truck,
  BarChart3,
  Database,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: '',
    email: '',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Haz factura',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Cotizador',
          url: '/quotes',
          icon: FileText,
        },
      ],
    },
    {
      title: 'Gestión',
      items: [
        {
          title: 'Clientes',
          url: '/clients',
          icon: Map,
        },
        {
          title: 'Productos',
          url: '/products',
          icon: Files,
        },
      ],
    },
    {
      title: 'Facturación',
      items: [
        {
          title: 'Facturas',
          url: '/invoicing',
          icon: FileText,
        },
        {
          title: 'Complementos de Pago',
          url: '/invoicing/payment-complements',
          icon: CreditCard,
        },
        {
          title: 'Notas de Crédito',
          url: '/invoicing/credit-notes',
          icon: FileText,
        },
        {
          title: 'Carta Porte',
          url: '/invoicing/bill-of-lading',
          icon: Truck,
        },
      ],
    },
    {
      title: 'Reportes',
      items: [
        {
          title: 'Reporte de Ventas',
          url: '/reports/sales',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'Configuración',
      items: [
        {
          title: 'Catálogos SAT',
          url: '/catalogs',
          icon: Database,
        },
        {
          title: 'Configuración',
          url: '/settings',
          icon: Settings,
        },
      ],
    },
    {
      title: 'Soporte',
      items: [
        {
          title: 'Ayuda',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
