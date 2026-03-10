

import {
  LayoutDashboard,
  Settings,
  Database,
  Map,
  FileText,
  Users,
  Download,
  LucideIcon
} from 'lucide-react'
import { type NavGroup } from '../types'
import { type UserPermission } from '@/hooks/use-permissions'

// Map the API string 'icono' to a react component
const ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  workcenter: Database,
  customers: Map,
  products: FileText,
  invoices: FileText,
  download: Download,
  administrators: Users,
  series: FileText,
  settings: Settings,
}

/**
 * Transforms an array of backend UserPermissions into an array of NavGroups
 * for the sidebar.
 */
export function generateNavGroups(permissions: UserPermission[]): NavGroup[] {
  const groupsTemp: Record<string, { title: string, items: any[] }> = {}

  // Sort permissions globally by their module 'orden' first
  const sortedPerms = [...permissions].sort((a, b) => a.module.orden - b.module.orden)

  sortedPerms.forEach(p => {
    // If the module has 0 actions, it means they don't have access to see it
    if (!p.actions || p.actions.length === 0) return

    const m = p.module
    const parentTitle = m.padre || 'General'

    // Initialize group if not exists
    if (!groupsTemp[parentTitle]) {
      groupsTemp[parentTitle] = {
        title: parentTitle,
        items: []
      }
    }

    // Determine basic navigation info
    let url = m.url || '#'
    // Ensure absolute paths for internal links
    if (url !== '#' && !url.startsWith('/') && !url.startsWith('http')) {
      url = `/${url}`
    }
    const icon = ICON_MAP[m.icono] || FileText // Default fallback

    // Add main valid module item
    groupsTemp[parentTitle].items.push({
      title: m.nombre,
      url,
      icon,
    })
  })

  // Convert the generated Record to the raw Array of navGroups
  // You might want to sort these parent groups themselves using hard-coded order if needed
  const parentOrder = ['General', 'Gestión', 'Facturación', 'Reportes', 'Configuración', 'Soporte']
  const finalGroups = Object.values(groupsTemp)

  finalGroups.sort((a, b) => {
    const i = parentOrder.indexOf(a.title)
    const j = parentOrder.indexOf(b.title)
    // Put unknown groups at the end
    return (i !== -1 ? i : 99) - (j !== -1 ? j : 99)
  })

  return finalGroups
}


