import { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { FileCode, Search, Download, ExternalLink, ArrowLeft, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { getSignedUrl } from '../../invoicing/data/invoicing-api'
import { verificarEstatusIndividual, MassiveDownload } from '../data/massive-download-api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import XMLViewer from 'react-xml-viewer'
import axios from 'axios'

export function MassiveDownloadViewerPage() {
    const { downloadId } = useParams({ from: '/_authenticated/massive-downloads/viewer/$downloadId' })
    const navigate = useNavigate()
    const [download, setDownload] = useState<MassiveDownload | null>(null)
    const [selectedFile, setSelectedFile] = useState<any>(null)
    const [xmlContent, setXmlContent] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingFile, setIsLoadingFile] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchDownload = async () => {
            try {
                setIsLoading(true)
                const data = await verificarEstatusIndividual(downloadId)
                setDownload(data)
            } catch (error) {
                toast.error('Error al cargar la descarga')
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDownload()
    }, [downloadId])

    const handleViewFile = async (file: any) => {
        setSelectedFile(file)
        setXmlContent(null)
        setIsLoadingFile(true)
        try {
            const { signedUrl } = await getSignedUrl(file.s3Key)
            const response = await axios.get(signedUrl)

            // Si la respuesta es un objeto (axios lo parsea si es XML a veces), lo convertimos a string
            let content = response.data
            if (typeof content === 'object') {
                content = new XMLSerializer().serializeToString(content)
            }
            setXmlContent(content)
        } catch (error) {
            toast.error('Error al cargar el archivo XML')
            console.error(error)
        } finally {
            setIsLoadingFile(false)
        }
    }

    const handleDownloadSingle = async (file: any) => {
        try {
            const { signedUrl } = await getSignedUrl(file.s3Key)
            const link = document.createElement('a')
            link.href = signedUrl
            link.setAttribute('download', file.nombre)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (error) {
            toast.error('Error al descargar el archivo')
        }
    }

    if (isLoading) {
        return (
            <div className='flex h-[400px] items-center justify-center bg-white dark:bg-slate-950 rounded-xl border border-dashed border-slate-300 dark:border-slate-800'>
                <div className='flex flex-col items-center gap-4'>
                    <Loader2 className='h-10 w-10 animate-spin text-orange-500' />
                    <p className='text-sm font-medium text-slate-500'>Sincronizando con el servidor...</p>
                </div>
            </div>
        )
    }

    const files = download?.xmlFiles || []
    const filteredFiles = files.filter(f =>
        f.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className='flex flex-col h-[calc(100vh-140px)] bg-background overflow-hidden relative'>
            {/* Header / Toolbar Simple */}
            <div className='pb-4 flex items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => navigate({ to: '/massive-downloads' })}
                        className='h-9 w-9 hover:bg-orange-50 hover:text-orange-600 transition-colors'
                    >
                        <ArrowLeft className='h-5 w-5' />
                    </Button>
                    <div>
                        <h1 className='text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100 uppercase tracking-tight'>
                            Visor Masivo
                            <Badge variant='secondary' className='bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-1.5 py-0 text-[10px] font-bold'>
                                {download?.tipo === 'issued' ? 'EMITIDAS' : 'RECIBIDAS'}
                            </Badge>
                        </h1>
                        <p className='text-[10px] text-muted-foreground font-medium'>
                            {files.length} documentos encontrados en esta descarga
                        </p>
                    </div>
                </div>

                <div className='flex items-center gap-2'>
                    <div className='relative w-56 hidden md:block'>
                        <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
                        <Input
                            placeholder='Buscar por nombre...'
                            className='pl-8 h-9 text-[11px] bg-slate-100/50 border-none ring-offset-background focus-visible:ring-1 focus-visible:ring-orange-500'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {selectedFile && (
                        <>
                            <Button size='sm' variant='ghost' className='h-9 gap-2 text-[11px] hover:text-orange-600 hover:bg-orange-50' onClick={() => handleDownloadSingle(selectedFile)}>
                                <Download className='h-4 w-4' />
                                <span className='hidden sm:inline'>Descargar</span>
                            </Button>
                            <Button
                                size='sm'
                                className='h-9 gap-2 bg-orange-500 hover:bg-orange-600 text-[11px] font-semibold text-white shadow-sm'
                                onClick={async () => {
                                    const { signedUrl } = await getSignedUrl(selectedFile.s3Key)
                                    window.open(signedUrl, '_blank')
                                }}
                            >
                                <ExternalLink className='h-4 w-4' />
                                <span className='hidden sm:inline'>Ver Original</span>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className='flex flex-1 overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 shadow-sm'>
                {/* Lateral: Lista de Archivos Mejorada */}
                <div className={cn(
                    'w-full md:w-64 lg:w-80 border-r flex flex-col bg-slate-50/10',
                    selectedFile && 'hidden md:flex'
                )}>
                    <div className='p-3 border-b bg-slate-50/30'>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Documentos</p>
                    </div>
                    <ScrollArea className='flex-1'>
                        <div className='divide-y divide-slate-100/50'>
                            {filteredFiles.length === 0 ? (
                                <div className='text-center py-12 text-muted-foreground opacity-50 px-4'>
                                    <p className='text-xs'>Sin coincidencias para "{searchTerm}"</p>
                                </div>
                            ) : (
                                filteredFiles.map((file: any) => (
                                    <button
                                        key={file.s3Key}
                                        onClick={() => handleViewFile(file)}
                                        className={cn(
                                            'w-full text-left px-4 py-3 text-[11px] transition-all flex items-center justify-between group relative',
                                            selectedFile?.s3Key === file.s3Key
                                                ? 'bg-orange-50/50 text-orange-700 font-bold'
                                                : 'hover:bg-slate-50 text-slate-600'
                                        )}
                                    >
                                        {selectedFile?.s3Key === file.s3Key && (
                                            <div className='absolute left-0 top-0 bottom-0 w-1 bg-orange-500' />
                                        )}
                                        <div className='flex items-center truncate'>
                                            <span className='truncate tracking-tight'>{file.nombre}</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Principal: Visor */}
                <div className='flex-1 flex flex-col bg-white dark:bg-slate-950 min-w-0'>
                    {!selectedFile ? (
                        <div className='flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30'>
                            <div className='h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4'>
                                <FileCode className='h-8 w-8 text-slate-400' />
                            </div>
                            <p className='text-sm font-semibold text-slate-600 uppercase tracking-wider'>Selecciona un CFDI</p>
                            <p className='text-[11px] mt-1'>Navega por la lista lateral para visualizarlo aquí</p>
                        </div>
                    ) : (
                        <div className='flex-1 flex flex-col overflow-hidden'>
                            {/* Cabecera del archivo actual */}
                            <div className='px-4 py-2 border-b border-slate-200 flex items-center justify-between bg-white'>
                                <div className='flex items-center gap-3 w-full'>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='md:hidden h-8 w-8'
                                        onClick={() => setSelectedFile(null)}
                                    >
                                        <ArrowLeft className='h-4 w-4' />
                                    </Button>
                                    <div className='flex flex-col truncate'>
                                        <span className='text-[8px] font-extrabold text-orange-600 uppercase tracking-tighter'>CFDI</span>
                                        <h2 className='text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 truncate'>
                                            {selectedFile.nombre}
                                        </h2>
                                    </div>
                                </div>
                            </div>

                            <div className='flex-1 overflow-hidden relative bg-white'>
                                {isLoadingFile && (
                                    <div className='absolute inset-0 bg-white/40 dark:bg-slate-950/40 backdrop-blur-[2px] z-50 flex items-center justify-center'>
                                        <Loader2 className='h-8 w-8 animate-spin text-orange-500' />
                                    </div>
                                )}

                                <ScrollArea className='h-full'>
                                    <div className='p-2 md:p-3'>
                                        <div className='bg-white dark:bg-slate-900 font-mono leading-tight min-h-full'>
                                            {xmlContent ? (
                                                <div className='text-[12px]'>
                                                    <XMLViewer
                                                        xml={xmlContent}
                                                        indentSize={2}
                                                        collapsible={true}
                                                        theme={{
                                                            attributeKeyColor: '#f97316', // Orange-500
                                                            attributeValueColor: '#16a34a', // Green-600
                                                            tagColor: '#6366f1', // Indigo-500
                                                            textColor: '#475569', // Slate-600
                                                            separatorColor: '#94a3b8' // Slate-400
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className='h-40 flex flex-col items-center justify-center gap-3 opacity-40'>
                                                    <Loader2 className='h-6 w-6 animate-spin' />
                                                    <p className='text-xs italic'>Esperando respuesta de S3...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
