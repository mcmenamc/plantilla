import { type ColumnDef } from '@tanstack/react-table'
import { Administrator } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const administratorsColumns: ColumnDef<Administrator>[] = [
    {
        accessorKey: 'user.nombre',
        id: 'user_nombre', // For filtering table state
        header: 'Administrador',
        cell: ({ row }) => {
            const { nombre, apellidos, email } = row.original.user
            return (
                <div className='flex flex-col ps-3'>
                    <span className='font-medium text-nowrap'>{`${nombre} ${apellidos}`}</span>
                    <span className='text-xs text-muted-foreground line-clamp-1 italic'>
                        {email}
                    </span>
                </div>
            )
        },
        filterFn: (row, _, value) => {
            const user = row.original.user
            const searchTerm = (value as string).toLowerCase()
            const fullName = `${user.nombre} ${user.apellidos}`.toLowerCase()
            const email = (user.email || '').toLowerCase()

            return fullName.includes(searchTerm) || email.includes(searchTerm)
        },
    },
    {
        accessorKey: 'permissions',
        header: 'Permisos',
        cell: ({ row }) => {
            const permissions = row.original.permissions || []
            if (permissions.length === 0) {
                return <span className='text-xs text-slate-500'>Sin permisos</span>
            }

            return (
                <div className='flex flex-col gap-1 '>
                    <div className='flex flex-wrap gap-1'>
                        {permissions.map((p, i) => {
                            const moduleName = typeof p.module === 'string' ? p.module : p.module?.nombre || 'Módulo'
                            return (
                                <span
                                    key={i}
                                    className='text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                >
                                    {moduleName}
                                </span>
                            )
                        })}
                    </div>
                </div>
            )
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
