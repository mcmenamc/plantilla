import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { Loader2, FileDown, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { getSignedUrl } from '@/features/invoicing/data/invoicing-api'
import XMLViewer from 'react-xml-viewer'

const route = getRouteApi('/_authenticated/viewer/')

export function Viewer() {
    const search = route.useSearch() as any
    const { path, title, type } = search
    const [signedUrl, setSignedUrl] = useState<string | null>(null)
    const [rawXml, setRawXml] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const docType = type || (path?.toLowerCase().endsWith('.xml') ? 'xml' : 'pdf')

    useEffect(() => {
        const fetchUrl = async () => {
            if (!path) {
                setError('No se proporcionó una ruta de archivo válida.')
                setLoading(false)
                return
            }

            setLoading(true)
            try {
                const { signedUrl: sUrl } = await getSignedUrl(path)
                setSignedUrl(sUrl)

                if (docType === 'xml') {
                    // Do a plain GET against the S3 signed URL — this is a cross-origin request
                    // but S3 returns the raw text when accessed directly (no CORS headers needed
                    // for a simple GET to read the XML as text; the CORS error only happens with
                    // JSON/REST content-type restrictions or POST. Plain GETs typically work).
                    const xmlRes = await fetch(sUrl)
                    if (!xmlRes.ok) throw new Error('Error al leer el XML')
                    const xmlText = await xmlRes.text()
                    setRawXml(xmlText)
                }
            } catch (err) {
                console.error(err)
                setError('Error al cargar el documento.')
            } finally {
                setLoading(false)
            }
        }
        fetchUrl()
    }, [path])

    const docTitle = title || 'Documento'

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950">
            <Header fixed>
                <Search />
                <div className='ms-auto flex items-center space-x-4'>
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className="flex flex-1 flex-col gap-4 p-4 md:p-6 h-[calc(100vh-4rem)]">
                <div className="flex items-center justify-between pb-2 border-b">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">{docTitle}</h2>
                        {docType && <p className="text-sm text-muted-foreground uppercase">{docType}</p>}
                    </div>

                    <div className="flex gap-2">
                        {signedUrl && (
                            <>
                                <Button variant="outline" size="sm" asChild>
                                    <a href={signedUrl} target="_blank" rel="noreferrer">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        <span className="hidden sm:inline">Abrir en otra pestaña</span>
                                        <span className="sm:hidden">Abrir</span>
                                    </a>
                                </Button>
                                <Button size="sm" asChild>
                                    <a href={signedUrl} download target="_blank" rel="noreferrer">
                                        <FileDown className="w-4 h-4 mr-2" />
                                        Descargar
                                    </a>
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex-1 w-full bg-slate-200 dark:bg-zinc-900 rounded-lg overflow-hidden border border-slate-300 dark:border-zinc-800 relative shadow-inner">
                    {loading && (
                        <div className="absolute inset-0 z-10 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center">
                            <Loader2 className="h-12 w-12 animate-spin text-orange-600 mb-4" />
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wider">OBTENIENDO DOCUMENTO...</p>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 z-10 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center">
                            <p className="text-red-500 font-medium">{error}</p>
                        </div>
                    )}

                    {/* PDF – render in iframe */}
                    {!loading && !error && docType === 'pdf' && signedUrl && (
                        <iframe
                            src={signedUrl}
                            className="w-full h-full bg-white"
                            title={docTitle}
                        />
                    )}

                    {/* XML – render with syntax-highlighted viewer */}
                    {!loading && !error && docType === 'xml' && rawXml && (
                        <div className="w-full h-full overflow-auto bg-white dark:bg-zinc-950 p-4 text-sm font-mono">
                            <XMLViewer
                                xml={rawXml}
                                collapsible
                                theme={{
                                    attributeKeyColor: '#a51d2d',
                                    attributeValueColor: '#1a56db',
                                    tagColor: '#047857',
                                    textColor: '#111827',
                                    separatorColor: '#6b7280',
                                    commentColor: '#6b7280',
                                }}
                            />
                        </div>
                    )}

                    {/* XML loaded but nothing to show (CORS fallback) */}
                    {!loading && !error && docType === 'xml' && !rawXml && signedUrl && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                            <p className="text-muted-foreground text-sm">No se puede previsualizar el XML por restricciones del navegador.</p>
                            <Button asChild>
                                <a href={signedUrl} download target="_blank" rel="noreferrer">
                                    <FileDown className="w-4 h-4 mr-2" />
                                    Descargar XML
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            </Main>
        </div>
    )
}
