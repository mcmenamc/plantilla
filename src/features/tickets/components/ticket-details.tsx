import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Ticket } from '../data/schema'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTicketStatus, addTracking, getSignedUrl, uploadFileToS3 } from '../data/tickets-api'
import { toast } from 'sonner'
import {
  Loader2, Image as ImageIcon, X, Bug, Lightbulb, HeadphonesIcon, 
  Clock, User, Hash, MessageSquare, Send, AlertTriangle, AlertCircle,
  ChevronUp, ArrowDown, CalendarDays, RefreshCw
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

interface TicketDetailsProps {
  ticket: Ticket
  mode?: 'detail' | 'tracking'
  onBack: () => void
}

const statusConfig: Record<string, { color: string; bg: string }> = {
  'Pendiente':  { color: 'text-blue-700 dark:text-blue-400',  bg: 'bg-blue-100 dark:bg-blue-900/30' },
  'En proceso': { color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  'Finalizado': { color: 'text-green-700 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-900/30' },
  'Rechazado':  { color: 'text-red-700 dark:text-red-400',    bg: 'bg-red-100 dark:bg-red-900/30' },
}

const typeConfig: Record<string, { label: string; desc: string; icon: any; color: string }> = {
  'Bug':     { label: 'Error / Bug', desc: 'Algo no funciona correctamente', icon: Bug,             color: 'text-red-500' },
  'Mejora':  { label: 'Mejora',      desc: 'Sugerencia para mejorar algo existente', icon: Lightbulb,       color: 'text-green-500' },
  'Cambio':  { label: 'Cambio',      desc: 'Modificar comportamiento actual', icon: RefreshCw,       color: 'text-blue-500' },
  'Soporte': { label: 'Soporte',     desc: 'Necesito ayuda con algo', icon: HeadphonesIcon,  color: 'text-gray-500' },
}

const priorityConfig: Record<string, { label: string; desc: string; icon: any; color: string }> = {
  'Crítica': { label: 'Crítica', desc: 'Bloquea el trabajo completamente', icon: AlertTriangle, color: 'text-red-600' },
  'Alta':    { label: 'Alta',    desc: 'Impacto significativo en operaciones', icon: AlertCircle,   color: 'text-orange-500' },
  'Media':   { label: 'Media',   desc: 'Afecta parcialmente el flujo', icon: ChevronUp,     color: 'text-yellow-500' },
  'Baja':    { label: 'Baja',    desc: 'Molestia menor, no urgente', icon: ArrowDown,     color: 'text-blue-400' },
}

export function TicketDetails({ ticket, mode, onBack }: TicketDetailsProps) {
  const queryClient = useQueryClient()
  const { auth: { user } } = useAuthStore()
  const isRoot = user?.role === 'Root'

  const [newComment, setNewComment] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [signedImages, setSignedImages] = useState<Record<string, string>>({})
  
  const commentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (mode === 'tracking') {
      setTimeout(() => {
        commentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        commentRef.current?.focus()
      }, 500)
    }

    // Cargar imágenes prefirmadas del backend si existen
    const initialSigned: Record<string, string> = {}
    if (ticket.images && ticket.imagePreviews) {
      ticket.images.forEach((img, i) => {
        if (ticket.imagePreviews?.[i]) initialSigned[img] = ticket.imagePreviews[i]
      })
    }
    if (ticket.tracking) {
      ticket.tracking.forEach((track: any) => {
        if (track.images && track.imagePreviews) {
          track.images.forEach((img: string, i: number) => {
            if (track.imagePreviews[i]) initialSigned[img] = track.imagePreviews[i]
          })
        }
      })
    }
    if (Object.keys(initialSigned).length > 0) {
      setSignedImages(prev => ({ ...prev, ...initialSigned }))
    }
  }, [ticket, mode])

  const [trackingImages, setTrackingImages] = useState<string[]>([])
  const [trackingPreviews, setTrackingPreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const trackingMutation = useMutation({
    mutationFn: ({ id, comment, status, images }: { id: string; comment: string; status?: string; images: string[] }) => {
      if (status) return updateTicketStatus(id, status, comment || undefined, images)
      return addTracking(id, comment, images)
    },
    onSuccess: () => {
      toast.success('Seguimiento agregado correctamente')
      queryClient.invalidateQueries({ queryKey: ['ticket', ticket._id] })
      setNewComment('')
      setNewStatus('')
      setTrackingImages([])
      setTrackingPreviews([])
    },
    onError: () => toast.error('Error al guardar el seguimiento'),
  })

  const handleSignImage = async (path: string) => {
    if (signedImages[path]) return
    try {
      const { signedUrl } = await getSignedUrl(path)
      setSignedImages(prev => ({ ...prev, [path]: signedUrl }))
    } catch {
      toast.error('No se pudo cargar la imagen')
    }
  }

  const handleTrackingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setIsUploading(true)
    try {
      const newPaths = [...trackingImages]
      const newPrev = [...trackingPreviews]
      for (const file of Array.from(files)) {
        const { path, signedUrl } = await uploadFileToS3(file, 'tickets')
        newPaths.push(path)
        newPrev.push(signedUrl)
      }
      setTrackingImages(newPaths)
      setTrackingPreviews(newPrev)
    } catch {
      toast.error('Error al subir imagen')
    } finally {
      setIsUploading(false)
    }
  }

  const removeTrackingImage = (i: number) => {
    setTrackingImages(trackingImages.filter((_, idx) => idx !== i))
    setTrackingPreviews(trackingPreviews.filter((_, idx) => idx !== i))
  }

  const handleSubmit = () => {
    if (!ticket?._id) return
    
    const hasImages = trackingImages.length > 0
    const hasComment = newComment.trim().length > 0

    // Si hay imágenes, el comentario es OBLIGATORIO
    if (hasImages && !hasComment) {
      toast.warning('Debes escribir un mensaje si adjuntas una evidencia')
      return
    }

    if (!hasComment && !newStatus && !hasImages) {
      toast.warning('Escribe un comentario, cambia el estatus o adjunta una imagen')
      return
    }

    trackingMutation.mutate({ id: ticket._id, comment: newComment.trim(), status: newStatus || undefined, images: trackingImages })
  }

  const typeInfo = typeConfig[ticket.type] || typeConfig['Soporte']
  const TypeIcon = typeInfo.icon
  const statusInfo = statusConfig[ticket.status] || { color: 'text-gray-600', bg: 'bg-gray-100' }
  const priorityInfo = priorityConfig[(ticket as any).priority] || priorityConfig['Media']
  const PriorityIcon = priorityInfo.icon

  const tracking = ticket.tracking || []

  return (
    <div className='max-w-8xl mx-auto space-y-6 animate-in fade-in duration-500'>
      
      <div className='flex items-center gap-4 mb-2'>
        <Button
          variant='outline'
          size='icon'
          onClick={onBack}
          title='Regresar'
          className='flex-shrink-0'
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Detalle de Ticket de Soporte</h1>
          <p className='text-muted-foreground'>Visualiza el estado y seguimiento de tu reporte.</p>
        </div>
      </div>
      
      {/* Cabecera Principal */}
      <div className='bg-card border rounded-xl shadow-sm p-6 overflow-hidden relative'>
        <div className={cn('absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-widest', statusInfo.bg, statusInfo.color)}>
          {ticket.status}
        </div>
        
        <div className='flex items-center gap-3 mb-4'>
           <div className={cn('p-2 rounded-lg bg-muted', typeInfo.color)}>
             <TypeIcon size={24} />
           </div>
           <div>
             <h1 className='text-2xl font-bold tracking-tight'>Ticket #{ticket._id?.slice(-6).toUpperCase()}</h1>
             <p className='text-sm text-muted-foreground'>
               Reportado por <span className='font-semibold'>{(ticket.user as any)?.nombre} {(ticket.user as any)?.apellidos}</span> 
               {' · '}
               {ticket.createdAt && formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: es })}
             </p>
           </div>
        </div>

        {/* Metadata cards */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 py-4'>
            <div className='flex flex-col items-center gap-1.5 p-3 rounded-lg border bg-muted/20 text-center'>
              <Hash size={18} className='text-muted-foreground/70' />
              <span className='text-[10px] font-bold text-muted-foreground uppercase opacity-70'>Módulo</span>
              <span className='text-xs font-semibold line-clamp-2'>{ticket.module}</span>
            </div>

            <div className='flex flex-col items-center gap-1.5 p-3 rounded-lg border bg-muted/20 text-center'>
              <TypeIcon size={18} className={typeInfo.color} />
              <span className='text-[10px] font-bold text-muted-foreground uppercase opacity-70'>Tipo</span>
              <span className='text-xs font-semibold'>{typeInfo.label}</span>
            </div>

            <div className='flex flex-col items-center gap-1.5 p-3 rounded-lg border bg-muted/20 text-center'>
              <PriorityIcon size={18} className={priorityInfo.color} />
              <span className='text-[10px] font-bold text-muted-foreground uppercase opacity-70'>Prioridad</span>
              <span className='text-xs font-semibold'>{priorityInfo.label}</span>
            </div>

            <div className='flex flex-col items-center gap-1.5 p-3 rounded-lg border bg-muted/20 text-center'>
              <CalendarDays size={18} className='text-muted-foreground/70' />
              <span className='text-[10px] font-bold text-muted-foreground uppercase opacity-70'>Fecha</span>
              <span className='text-xs font-semibold'>{ticket.createdAt && format(new Date(ticket.createdAt), 'dd/MM/yy HH:mm')}</span>
            </div>
        </div>

        {/* Descripción */}
        <div className='mt-4 pt-4 border-t'>
          <p className='text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2'>
            <MessageSquare size={14} /> Descripción Original
          </p>
          <div className='bg-muted/30 rounded-xl p-5 border border-dashed whitespace-pre-wrap text-sm leading-relaxed'>
            {ticket.comment}
          </div>
        </div>

        {/* Imágenes */}
        {ticket.images && ticket.images.length > 0 && (
          <div className='mt-6'>
            <p className='text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2'>
              <ImageIcon size={14} /> Archivos Adjuntos ({ticket.images.length})
            </p>
            <div className='flex flex-wrap gap-3'>
              {ticket.images.map((img, i) => {
                const url = signedImages[img]
                const isImage = img.match(/\.(jpg|jpeg|png|gif|webp|svg)/i)
                return (
                  <div key={i} className='relative group'>
                    {url ? (
                      <a href={url} target='_blank' rel='noopener noreferrer'>
                        {isImage ? (
                          <img
                            src={url}
                            alt={`img-${i}`}
                            className='w-24 h-24 rounded-xl border object-cover transition-all group-hover:ring-2 ring-primary/40 shadow-sm'
                          />
                        ) : (
                          <div className='w-24 h-24 rounded-xl border flex flex-col items-center justify-center bg-muted/30 group-hover:bg-muted transition-colors text-muted-foreground'>
                            <ImageIcon size={24} className='opacity-40' />
                            <span className='text-[8px] mt-1 font-bold uppercase truncate px-2 w-full text-center'>
                              {img.split('/').pop()?.slice(-15)}
                            </span>
                          </div>
                        )}
                      </a>
                    ) : (
                      <button
                        type='button'
                        onClick={() => handleSignImage(img)}
                        className='w-24 h-24 rounded-xl border flex flex-col items-center justify-center bg-muted/50 hover:bg-muted transition-colors'
                      >
                        <ImageIcon size={20} className='text-muted-foreground/50' />
                        <span className='text-[10px] text-muted-foreground mt-2 font-medium'>Revelar</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Seguimiento / Chat */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        
        {/* Historial (Columna Izquierda / Central) */}
        <div className='lg:col-span-2 space-y-6'>
          <h3 className='text-lg font-bold flex items-center gap-2 px-2'>
            <Clock size={18} className='text-primary' /> 
            Actividad y Seguimiento
          </h3>

          <div className='space-y-4 relative'>
            <div className='absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent' />
            
            {tracking.length === 0 ? (
              <div className='bg-muted/20 border-2 border-dashed rounded-xl p-8 text-center ml-12'>
                <p className='text-muted-foreground text-sm italic'>No hay actividad registrada aún.</p>
              </div>
            ) : (
              tracking.map((track, i) => (
                <div key={i} className='pl-14 relative group'>
                  <div className='absolute left-4 top-2 w-5 h-5 rounded-full bg-background border-4 border-primary shadow-sm z-10 transition-transform group-hover:scale-125' />
                  
                  <div className='bg-card border rounded-xl p-4 shadow-sm hover:shadow transition-all'>
                    <div className='flex justify-between items-center mb-3 pb-3 border-b border-muted/50'>
                      <div className='flex items-center gap-2'>
                        <div className='w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center'>
                          <User size={14} className='text-primary' />
                        </div>
                        <span className='font-bold text-xs'>
                          {(track.user as any)?.nombre || (track.user as any)?.email}
                        </span>
                        { (track.user as any)?.role === 'Root' && <span className='text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded-full font-bold uppercase'>Soporte</span> }
                      </div>
                      <span className='text-[10px] text-muted-foreground font-medium'>
                        {format(new Date(track.createdAt), 'dd MMMM, HH:mm', { locale: es })}
                      </span>
                    </div>

                    {track.comment && (
                      <p className='text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed'>{track.comment}</p>
                    )}

                    {track.images && track.images.length > 0 && (
                      <div className='flex flex-wrap gap-2 mt-3'>
                        {track.images.map((img, j) => {
                          const url = signedImages[img]
                          const isImage = img.match(/\.(jpg|jpeg|png|gif|webp|svg)/i)
                          return (
                            <div key={j}>
                              {url ? (
                                <a href={url} target='_blank' rel='noopener noreferrer'>
                                  {isImage ? (
                                    <img
                                      src={url}
                                      className='w-16 h-16 rounded-lg border object-cover shadow-sm'
                                    />
                                  ) : (
                                    <div className='w-16 h-16 rounded-lg border flex flex-col items-center justify-center bg-muted/30 text-muted-foreground'>
                                      <ImageIcon size={18} className='opacity-40' />
                                      <span className='text-[7px] mt-0.5 font-bold uppercase truncate px-1 w-full text-center'>
                                        {img.split('/').pop()?.slice(-10)}
                                      </span>
                                    </div>
                                  )}
                                </a>
                              ) : (
                                <button
                                  onClick={() => handleSignImage(img)}
                                  className='w-16 h-16 rounded-lg border bg-muted/40 flex items-center justify-center'
                                >
                                  <ImageIcon size={14} className='text-muted-foreground/40' />
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel de Acción (Columna Derecha / Sticky) */}
        <div className='space-y-6'>
          <div className='bg-card border rounded-xl shadow-sm p-6 sticky top-24'>
            <h3 className='text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2'>
              <Send size={14} /> Tu Respuesta
            </h3>
            
            <div className='space-y-5'>
              {isRoot && (
                <div className='space-y-2'>
                  <label className='text-xs font-bold'>Nuevo Estatus</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Mantener estatus' />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([s, cfg]) => (
                        <SelectItem key={s} value={s}>
                          <span className={cn('font-bold text-xs', cfg.color)}>{s}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className='space-y-2'>
                <label className='text-xs font-bold'>Mensaje</label>
                <Textarea
                  ref={commentRef}
                  placeholder='Escribe tu actualización o respuesta aquí...'
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className='min-h-[140px] resize-none focus:ring-primary'
                />
              </div>

              <div className='space-y-2'>
                <div className='flex flex-wrap gap-2 mb-2'>
                   {trackingPreviews.map((p, i) => {
                     const s3Key = trackingImages[i] || ''
                     const isImage = s3Key.match(/\.(jpg|jpeg|png|gif|webp|svg)/i)
                     const fileName = s3Key.split('/').pop() || 'archivo'
                     const extension = fileName.split('.').pop()?.toUpperCase() || 'FILE'
                     
                     return (
                       <div key={i} className='relative w-12 h-12 rounded-lg overflow-hidden border bg-muted/20 group'>
                         {isImage ? (
                           <img src={p} className='w-full h-full object-cover' />
                         ) : (
                           <a href={p} target='_blank' rel='noopener noreferrer' className='w-full h-full flex flex-col items-center justify-center text-muted-foreground hover:bg-muted transition-colors'>
                             <span className='font-black text-[7px] mb-[-2px] opacity-60'>{extension}</span>
                             <ImageIcon size={14} className='opacity-40' />
                           </a>
                         )}
                         <button onClick={() => removeTrackingImage(i)} className='absolute inset-0 bg-red-500/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                           <X size={12} className='text-white' />
                         </button>
                       </div>
                     )
                   })}
                </div>
                <label className='w-full h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all text-muted-foreground'>
                   {isUploading ? <Loader2 size={16} className='animate-spin' /> : <><ImageIcon size={18} /><span className='text-[10px] mt-1 font-bold uppercase'>Adjuntar Archivo</span></>}
                   <input type='file' multiple className='hidden' onChange={handleTrackingImageUpload} disabled={isUploading} />
                </label>
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={trackingMutation.isPending || isUploading || (!newComment.trim() && !newStatus && trackingImages.length === 0)}
                className='w-full h-11 shadow-lg shadow-primary/20 gap-2'
              >
                {trackingMutation.isPending ? <Loader2 size={16} className='animate-spin' /> : <Send size={16} />}
                Enviar Seguimiento
              </Button>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
