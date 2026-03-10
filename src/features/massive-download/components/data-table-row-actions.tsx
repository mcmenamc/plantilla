import { Row } from '@tanstack/react-table'
import { MoreVertical,  FileSpreadsheet, Archive, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MassiveDownload } from '../data/massive-download-api'
import { toast } from 'sonner'
import { getSignedUrl } from '../../invoicing/data/invoicing-api'

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
}

export function DataTableRowActions<TData>({
    row,
}: DataTableRowActionsProps<TData>) {
    const download = row.original as MassiveDownload

    const handleDownloadExcel = async (s3Key: string) => {
        try {
            const { signedUrl } = await getSignedUrl(s3Key)
            window.open(signedUrl, '_blank')
        } catch (error) {
            toast.error('Error al obtener el enlace de descarga')
        }
    }

    return (
        <div className='flex justify-end gap-1'>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-8 w-8 hover:bg-slate-200'>
                        <MoreVertical className='h-4 w-4' />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                    <DropdownMenuLabel className='text-[10px] text-muted-foreground uppercase py-1'>
                        Acciones
                    </DropdownMenuLabel>

                    {download.status === 'completed' && (
                        <>
                            {/* <DropdownMenuItem
                                className='gap-2 py-2'
                                onClick={() => {
                                    navigate({
                                        to: '/massive-downloads/viewer/$downloadId',
                                        params: { downloadId: download._id }
                                    })
                                }}
                            >
                                <Eye className='h-4 w-4 text-blue-500' />
                                <span>Ver Documentos</span>
                            </DropdownMenuItem> */}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem className='gap-2 py-2' onClick={() => handleDownloadExcel(download.excelS3Key!)}>
                                <FileSpreadsheet className='h-4 w-4 text-green-600' />
                                <span>Reporte Excel</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem className='gap-2 py-2' onClick={() => handleDownloadExcel(download.zipS3Key!)}>
                                <Archive className='h-4 w-4 text-orange-600' />
                                <span>Descargar ZIP</span>
                            </DropdownMenuItem>
                        </>
                    )}

                    {download.status === 'error' && (
                        <DropdownMenuItem className='gap-2 py-2 text-red-600' onClick={() => toast.error(download.errorDescription)}>
                            <AlertCircle className='h-4 w-4' />
                            <span>Ver Error</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
