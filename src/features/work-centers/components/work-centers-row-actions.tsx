import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { useNavigate } from '@tanstack/react-router'
import { Trash2, Edit, FileUp, ImagePlus, FileCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type WorkCenter } from '../data/schema'
import { useWorkCenters } from './work-centers-provider'

type DataTableRowActionsProps = {
    row: Row<WorkCenter>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
    const navigate = useNavigate()
    const { setOpen, setCurrentRow } = useWorkCenters()
    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant='ghost'
                        className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
                    >
                        <DotsHorizontalIcon className='h-4 w-4' />
                        <span className='sr-only'>Abrir menú</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-[160px]'>
                    <DropdownMenuItem
                        onClick={() => navigate({
                            to: '/work-centers/$workCenterId/edit',
                            params: { workCenterId: row.original._id }
                        })}
                    >
                        Editar
                        <DropdownMenuShortcut>
                            <Edit size={16} />
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            setCurrentRow(row.original)
                            setOpen('upload-cert')
                        }}
                    >
                        Certificados
                        <DropdownMenuShortcut>
                            <FileUp size={16} />
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            setCurrentRow(row.original)
                            setOpen('upload-logo')
                        }}
                    >
                        Logo
                        <DropdownMenuShortcut>
                            <ImagePlus size={16} />
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            setCurrentRow(row.original)
                            setOpen('upload-opinion')
                        }}
                    >
                        Opinión del SAT
                        <DropdownMenuShortcut>
                            <FileCheck size={16} />
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => {
                            setCurrentRow(row.original)
                            setOpen('delete')
                        }}
                        className='text-red-500!'
                    >
                        Eliminar
                        <DropdownMenuShortcut>
                            <Trash2 size={16} />
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
