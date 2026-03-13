import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Ticket } from '../data/schema'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { TicketsRowActions } from './tickets-row-actions'

const statusColors: Record<string, string> = {
  'Pendiente': 'bg-blue-500 text-white',
  'En proceso': 'bg-yellow-500 text-white',
  'Finalizado': 'bg-green-500 text-white',
  'Rechazado': 'bg-red-500 text-white',
}

const typeColors: Record<string, string> = {
  'Bug': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400',
  'Mejora': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400',
  'Cambio': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
  'Soporte': 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400',
}

export const ticketsColumns: ColumnDef<Ticket>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Fecha',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return (
        <div className='text-sm text-nowrap text-muted-foreground'>
          {date ? format(new Date(date), 'dd/MM/yy HH:mm', { locale: es }) : '—'}
        </div>
      )
    },
    meta: { className: 'w-28' },
  },
  {
    accessorKey: 'module',
    header: 'Módulo',
    cell: ({ row }) => (
      <div className='font-medium text-sm max-w-[140px] truncate' title={row.getValue('module')}>
        {row.getValue('module')}
      </div>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      return (
        <Badge variant='outline' className={typeColors[type]}>
          {type}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'user',
    header: 'Usuario',
    cell: ({ row }) => {
      const user = row.getValue('user') as any
      return (
        <div className='flex flex-col'>
          <span className='text-sm font-medium text-nowrap'>
            {user?.nombre} {user?.apellidos}
          </span>
          <span className='text-xs text-muted-foreground'>{user?.email}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'comment',
    header: 'Descripción',
    cell: ({ row }) => (
      <div className='max-w-[220px] truncate text-sm text-muted-foreground' title={row.getValue('comment')}>
        {row.getValue('comment')}
      </div>
    ),
  },
  {
    accessorKey: 'tracking',
    header: 'Seguimiento',
    cell: ({ row }) => {
      const tracking = (row.getValue('tracking') as any[]) || []
      return (
        <div className='text-center'>
          {tracking.length > 0 ? (
            <span className='text-xs font-medium bg-muted px-2 py-0.5 rounded-full'>
              {tracking.length}
            </span>
          ) : (
            <span className='text-xs text-muted-foreground'>—</span>
          )}
        </div>
      )
    },
    meta: { className: 'text-center w-24' },
  },
  {
    accessorKey: 'status',
    header: 'Estatus',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge className={statusColors[status] || 'bg-gray-500 text-white'}>
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: 'actions',
    cell: ({ row }) => <TicketsRowActions row={row} />,
  },
]
