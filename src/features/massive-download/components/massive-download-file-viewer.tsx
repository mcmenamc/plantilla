'use client'

import { useState } from 'react'
import { FileCode, Search, ChevronRight, Download, Eye, ExternalLink } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getSignedUrl } from '../../invoicing/data/invoicing-api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FileViewerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    download: any
}

export function MassiveDownloadFileViewer({ open, onOpenChange, download }: FileViewerProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFile, setSelectedFile] = useState<any>(null)
    const [xmlContent, setXmlContent] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const files = download?.xmlFiles || []
    const filteredFiles = files.filter((f: any) =>
        f.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleViewFile = async (file: any) => {
        setSelectedFile(file)
        setIsLoading(true)
        setXmlContent(null)
        try {
            const { signedUrl } = await getSignedUrl(file.s3Key)
            const response = await fetch(signedUrl)
            const content = await response.text()
            setXmlContent(content)
        } catch (error) {
            toast.error('Error al cargar contenido del XML')
            setSelectedFile(null)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDownloadSingle = async (file: any) => {
        try {
            const { signedUrl } = await getSignedUrl(file.s3Key)
            const link = document.createElement('a')
            link.href = signedUrl
            link.download = file.nombre
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            toast.error('Error al descargar el archivo')
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            onOpenChange(val)
            if (!val) {
                setSelectedFile(null)
                setXmlContent(null)
            }
        }}>
            <DialogContent className='max-w-6xl h-[85vh] flex flex-col p-0 overflow-hidden'>
                <DialogHeader className='p-6 pb-2'>
                    <DialogTitle className='flex items-center gap-2'>
                        <FileCode className='h-5 w-5 text-blue-500' />
                        Visor de Documentos - {download?.rfc}
                    </DialogTitle>
                </DialogHeader>

                <div className='flex-1 flex overflow-hidden border-t'>
                    {/* Lista de Archivos */}
                    <div className={cn(
                        'w-full md:w-80 border-r flex flex-col bg-slate-50/50 dark:bg-slate-900/20',
                        selectedFile && 'hidden md:flex'
                    )}>
                        <div className='p-4 border-b bg-white dark:bg-slate-950/50'>
                            <div className='relative'>
                                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                                <Input
                                    placeholder='Filtrar archivos...'
                                    className='pl-9 h-9'
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <ScrollArea className='flex-1'>
                            <div className='p-2 space-y-1'>
                                {filteredFiles.length === 0 ? (
                                    <p className='text-xs text-center py-10 text-muted-foreground'>
                                        No se encontraron archivos.
                                    </p>
                                ) : (
                                    filteredFiles.map((file: any) => (
                                        <button
                                            key={file.s3Key}
                                            onClick={() => handleViewFile(file)}
                                            className={cn(
                                                'w-full text-left px-3 py-2 rounded-lg text-xs transition-colors group flex items-center justify-between',
                                                selectedFile?.s3Key === file.s3Key
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                                            )}
                                        >
                                            <div className='flex items-center gap-2 truncate'>
                                                <div className={cn(
                                                    'h-8 w-8 rounded flex items-center justify-center shrink-0',
                                                    selectedFile?.s3Key === file.s3Key ? 'bg-blue-200 dark:bg-blue-800' : 'bg-slate-200 dark:bg-slate-800'
                                                )}>
                                                    <FileCode className='h-4 w-4' />
                                                </div>
                                                <div className='truncate'>
                                                    <p className='font-medium truncate'>{file.nombre}</p>
                                                    <p className='text-[10px] opacity-70'>{(file.tamanoBytes / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </div>
                                            <ChevronRight className='h-3 w-3 opacity-0 group-hover:opacity-100' />
                                        </button>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Contenido / Visor */}
                    <div className='flex-1 flex flex-col bg-white dark:bg-slate-950 min-w-0'>
                        {!selectedFile ? (
                            <div className='flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4'>
                                <div className='h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center'>
                                    <Eye className='h-10 w-10 text-slate-300' />
                                </div>
                                <div>
                                    <h3 className='font-semibold text-lg'>Selecciona un archivo</h3>
                                    <p className='text-sm text-muted-foreground'>
                                        Haz clic en un XML de la lista para visualizar su contenido.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className='p-4 border-b flex items-center justify-between gap-4'>
                                    <div className='flex items-center gap-3 min-w-0'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='md:hidden'
                                            onClick={() => setSelectedFile(null)}
                                        >
                                            <ChevronRight className='h-4 w-4 rotate-180' />
                                        </Button>
                                        <div className='truncate'>
                                            <h4 className='font-semibold text-sm truncate'>{selectedFile.nombre}</h4>
                                            <p className='text-xs text-muted-foreground'>Extensión XML • Documento CFDI</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Button
                                            size='sm'
                                            variant='outline'
                                            className='h-8 gap-2'
                                            onClick={() => handleDownloadSingle(selectedFile)}
                                        >
                                            <Download className='h-3.5 w-3.5' />
                                            Descargar
                                        </Button>
                                        <Button
                                            size='sm'
                                            variant='default'
                                            className='h-8 gap-2 bg-blue-600 hover:bg-blue-700'
                                            onClick={async () => {
                                                const { signedUrl } = await getSignedUrl(selectedFile.s3Key)
                                                window.open(signedUrl, '_blank')
                                            }}
                                        >
                                            <ExternalLink className='h-3.5 w-3.5' />
                                            Abrir
                                        </Button>
                                    </div>
                                </div>
                                <div className='flex-1 overflow-hidden relative'>
                                    {isLoading ? (
                                        <div className='absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-10'>
                                            <div className='flex flex-col items-center gap-2'>
                                                <div className='h-8 w-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin' />
                                                <p className='text-xs font-medium'>Cargando contenido...</p>
                                            </div>
                                        </div>
                                    ) : null}
                                    <ScrollArea className='h-full bg-[#f8f9fa] dark:bg-[#0b0e14]'>
                                        <pre className='p-6 text-[13px] font-mono leading-relaxed overflow-x-auto selection:bg-blue-500/30'>
                                            {xmlContent}
                                        </pre>
                                    </ScrollArea>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
