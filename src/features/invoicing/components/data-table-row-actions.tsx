import { Row } from '@tanstack/react-table'
import { MoreHorizontal, Trash, Eye, FileDown, ExternalLink, FileCode } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
            <DropdownMenuContent align='end' className='w-[200px]'>
                <DropdownMenuItem
                    onClick={() => {
                        setCurrentRow(invoice)
                        setOpen('edit')
                    }}
                >
                    <Eye className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
                    Ver Detalles
                </DropdownMenuItem>

                {invoice.verification_url && (
                    <DropdownMenuItem asChild>
                        <a href={invoice.verification_url} target='_blank' rel='noreferrer' className='cursor-pointer w-full'>
                            <ExternalLink className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
                            Verificar SAT
                        </a>
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {(invoice.pdfPath || invoice.status === 'valid') && (
                    <DropdownMenuItem asChild>
                        <Link
                            to='/viewer'
                            search={{
                                path: invoice.pdfPath || '',
                                title: `Factura ${invoice.serie || ''}${invoice.folio_number ? `-${invoice.folio_number}` : ''}`,
                                type: 'pdf'
                            }}
                            target='_blank'
                            className='cursor-pointer w-full'
                        >
                            <FileDown className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
                            Ver PDF
                        </Link>
                    </DropdownMenuItem>
                )}

                {(invoice.xmlPath || invoice.status === 'valid') && (
                    <DropdownMenuItem asChild>
                        <Link
                            to='/viewer'
                            search={{
                                path: invoice.xmlPath || '',
                                title: `Factura ${invoice.serie || ''}${invoice.folio_number ? `-${invoice.folio_number}` : ''}`,
                                type: 'xml'
                            }}
                            target='_blank'
                            className='cursor-pointer w-full'
                        >
                            <FileCode className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
                            Ver XML
                        </Link>
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => {
                        setCurrentRow(invoice)
                        setOpen('delete')
                    }}
                    className='text-red-600'
                >
                    <Trash className='mr-2 h-3.5 w-3.5 text-red-600/70' />
                    Cancelar CFDI
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
