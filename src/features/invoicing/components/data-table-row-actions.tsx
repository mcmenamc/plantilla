import { Row } from '@tanstack/react-table'
import { MoreHorizontal, Trash, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Invoice } from '../data/schema'
import { useInvoices } from './invoices-provider'

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
}

export function DataTableRowActions<TData>({
    row,
}: DataTableRowActionsProps<TData>) {
    const { setOpen, setCurrentRow } = useInvoices()
    const invoice = row.original as Invoice

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant='ghost'
                    className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
                >
                    <MoreHorizontal className='h-4 w-4' />
                    <span className='sr-only'>Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[160px]'>
                <DropdownMenuItem
                    onClick={() => {
                        setCurrentRow(invoice)
                        setOpen('edit')
                    }}
                >
                    <Eye className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
                    Ver Detalles
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {
                        setCurrentRow(invoice)
                        setOpen('delete')
                    }}
                    className='text-red-600'
                >
                    <Trash className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
                    Cancelar
                    <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
