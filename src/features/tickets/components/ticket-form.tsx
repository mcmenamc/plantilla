import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTicketSchema, CreateTicketPayload, Ticket } from '../data/schema'
import { useState, useEffect } from 'react'
import { uploadFileToS3, getModules } from '../data/tickets-api'
import {
  Loader2, X, Image as ImageIcon, Bug, Lightbulb, RefreshCw,
  HeadphonesIcon, AlertTriangle, AlertCircle, ChevronUp, ArrowDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'

interface TicketFormProps {
  initialData?: Ticket
  onSubmit: (data: CreateTicketPayload) => void
  isSubmitting: boolean
  onCancel: () => void
  title: string
  description: string
}

const typeOptions = [
  { value: 'Bug', label: 'Error / Bug', desc: 'Algo no funciona correctamente', icon: Bug, color: 'text-red-500' },
  { value: 'Mejora', label: 'Mejora', desc: 'Sugerencia para mejorar algo existente', icon: Lightbulb, color: 'text-green-500' },
  { value: 'Cambio', label: 'Cambio', desc: 'Modificar comportamiento actual', icon: RefreshCw, color: 'text-blue-500' },
  { value: 'Soporte', label: 'Soporte', desc: 'Necesito ayuda con algo', icon: HeadphonesIcon, color: 'text-gray-500' },
]

const priorityOptions = [
  { value: 'Crítica', label: 'Crítica', desc: 'Bloquea el trabajo completamente', icon: AlertTriangle, color: 'text-red-600' },
  { value: 'Alta', label: 'Alta', desc: 'Impacto significativo en operaciones', icon: AlertCircle, color: 'text-orange-500' },
  { value: 'Media', label: 'Media', desc: 'Afecta parcialmente el flujo', icon: ChevronUp, color: 'text-yellow-500' },
  { value: 'Baja', label: 'Baja', desc: 'Molestia menor, no urgente', icon: ArrowDown, color: 'text-blue-400' },
]

import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export function TicketForm({ initialData, onSubmit, isSubmitting, title, description }: TicketFormProps) {
  const navigate = useNavigate()
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialData?.images || []) // En edición, esto idealmente deberían ser URLs firmadas, pero por simplicidad...
  const [isUploading, setIsUploading] = useState(false)
  const [selectedModule, setSelectedModule] = useState('')
  const [customModule, setCustomModule] = useState('')

  // Obtener módulos de la DB
  const { data: dbModules = [], isLoading: isLoadingModules } = useQuery({
    queryKey: ['ticket-modules'],
    queryFn: getModules
  })

  const form = useForm<CreateTicketPayload>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      module: initialData?.module || '',
      type: (initialData?.type as any) || 'Bug',
      priority: (initialData?.priority as any) || 'Media',
      comment: initialData?.comment || '',
      images: initialData?.images || [],
      status: initialData?.status || 'Pendiente'
    }
  })

  const watchComment = form.watch('comment')

  useEffect(() => {
    if (initialData) {
      const isCustom = !dbModules.some(m => m.nombre === initialData.module)
      if (isCustom && initialData.module.startsWith('Otro: ')) {
        setSelectedModule('Otro')
        setCustomModule(initialData.module.replace('Otro: ', ''))
      } else {
        setSelectedModule(initialData.module)
      }
    }
  }, [initialData, dbModules])

  const handleModuleChange = (value: string) => {
    setSelectedModule(value)
    if (value !== 'Otro') {
      form.setValue('module', value)
      setCustomModule('')
    } else {
      form.setValue('module', '')
    }
  }

  const handleCustomModuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomModule(value)
    form.setValue('module', value ? `Otro: ${value}` : '')
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const newImages = [...images]
      const newPreviews = [...imagePreviews]
      for (const file of Array.from(files)) {
        const { path, signedUrl } = await uploadFileToS3(file, 'tickets')
        newImages.push(path)
        newPreviews.push(signedUrl)
      }
      setImages(newImages)
      setImagePreviews(newPreviews)
      form.setValue('imagePreviews' as any, newPreviews)
      form.setValue('images', newImages)
    } catch {
      // silently fail
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const nextImages = images.filter((_, i) => i !== index)
    const nextPreviews = imagePreviews.filter((_, i) => i !== index)
    setImages(nextImages)
    setImagePreviews(nextPreviews)
    form.setValue('images', nextImages)
  }

  return (
    <div className='max-w-8xl mx-auto'>
      <div className='mb-8 flex items-center gap-4'>
        <Button
          variant='outline'
          size='icon'
          onClick={() => navigate({ to: '/tickets' })}
          title='Regresar'
          className='flex-shrink-0'
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>{title}</h1>
          <p className='text-muted-foreground mt-2'>{description}</p>
        </div>
      </div>

      <div className='bg-card border rounded-xl shadow-sm overflow-hidden'>
        <div className='p-6 border-b bg-muted/30'>
          <h2 className='text-lg font-semibold'>Información del Ticket</h2>
        </div>
        
        <div className='p-6'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Módulo */}
                <FormField
                  control={form.control}
                  name='module'
                  render={() => (
                    <FormItem>
                      <FormLabel className='font-semibold'>Módulo afectado</FormLabel>
                      <Select 
                        onValueChange={handleModuleChange} 
                        value={selectedModule}
                        disabled={isLoadingModules}
                      >
                        <FormControl>
                          <SelectTrigger className='h-11'>
                            <SelectValue placeholder={isLoadingModules ? 'Cargando módulos...' : 'Selecciona el módulo'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dbModules.map((mod: any) => (
                            <SelectItem key={mod._id} value={mod.nombre}>{mod.nombre}</SelectItem>
                          ))}
                          <SelectItem value='Otro'>Otro / No listado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Prioridad */}
                <FormField
                  control={form.control}
                  name='priority'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='font-semibold'>Prioridad</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className='h-11 py-2'>
                            <SelectValue placeholder='Selecciona prioridad'>
                              {field.value && (() => {
                                const p = priorityOptions.find(opt => opt.value === field.value)
                                if (!p) return null
                                const Icon = p.icon
                                return (
                                  <div className='flex items-center gap-2 text-left'>
                                    <Icon size={14} className={p.color} />
                                    <span className='text-sm font-medium leading-none'>{p.label}</span>
                                  </div>
                                )
                              })()}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorityOptions.map((p) => {
                            const Icon = p.icon
                            return (
                               <SelectItem key={p.value} value={p.value}>
                                <div className='flex items-center gap-2'>
                                  <Icon size={14} className={p.color} />
                                  <span>{p.label}</span>
                                  <span className='text-muted-foreground text-[10px] hidden md:inline opacity-70 ml-1'>— {p.desc}</span>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {selectedModule === 'Otro' && (
                <FormItem className='animate-in fade-in slide-in-from-top-2 duration-300'>
                  <FormLabel className='font-semibold'>
                    Especifica el módulo o sección <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className='h-11'
                      placeholder='Ej: Reporte de Ventas, Menu lateral...'
                      value={customModule}
                      onChange={handleCustomModuleChange}
                    />
                  </FormControl>
                </FormItem>
              )}

              {/* Tipo de reporte */}
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-semibold'>Tipo de solicitud</FormLabel>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                      {typeOptions.map((opt) => {
                        const Icon = opt.icon
                        const isSelected = field.value === opt.value
                        return (
                          <button
                            key={opt.value}
                            type='button'
                            onClick={() => field.onChange(opt.value)}
                            className={cn(
                              'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center',
                              isSelected
                                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                : 'border-border hover:border-muted-foreground/30 hover:bg-muted/30'
                            )}
                          >
                            <Icon size={24} className={isSelected ? 'text-primary' : opt.color} />
                            <div className='flex flex-col'>
                              <span className={cn('text-sm font-semibold', isSelected ? 'text-primary' : '')}>
                                {opt.label}
                              </span>
                              <span className='text-[10px] text-muted-foreground leading-tight hidden sm:block mt-0.5'>
                                {opt.desc}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Comentarios */}
              <FormField
                control={form.control}
                name='comment'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex justify-between items-center'>
                      <FormLabel className='font-semibold'>Descripción del problema</FormLabel>
                      <span className='text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full'>
                        {watchComment?.length || 0} caracteres
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder='Explica con detalle qué está sucediendo o qué necesitas...'
                        className='min-h-[150px] resize-none shadow-inner'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Imágenes */}
              <FormItem>
                <FormLabel className='font-semibold'>Evidencia visual (Capturas)</FormLabel>
                <div className='grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3 p-4 border-2 border-dashed rounded-xl bg-muted/10'>
                  {imagePreviews.map((previewUrl, index) => (
                    <div key={index} className='relative aspect-square rounded-lg overflow-hidden border bg-background group shadow-sm'>
                      <img src={previewUrl} className='w-full h-full object-cover transition-transform group-hover:scale-105' alt='preview' />
                      <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1'>
                        <button
                          type='button'
                          onClick={() => removeImage(index)}
                          className='bg-destructive text-destructive-foreground rounded-full p-1.5 hover:bg-destructive/90 transition-colors'
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <label className='aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-background hover:border-primary/50 transition-all text-muted-foreground hover:text-primary group'>
                    {isUploading ? (
                      <Loader2 size={24} className='animate-spin' />
                    ) : (
                      <>
                        <div className='bg-muted group-hover:bg-primary/10 rounded-full p-2 mb-1 transition-colors'>
                          <ImageIcon size={20} />
                        </div>
                        <span className='text-[10px] font-medium'>Añadir</span>
                      </>
                    )}
                    <input
                      type='file'
                      multiple
                      accept='image/*'
                      className='hidden'
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </FormItem>

              <div className='flex items-center justify-between pt-6 border-t'>
              
                <div className='flex gap-3'>
                  <Button type='submit' disabled={isSubmitting || isUploading} className='min-w-[160px] h-11 shadow-lg shadow-primary/20'>
                    {isSubmitting ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        {initialData ? 'Guardando...' : 'Enviando...'}
                      </>
                    ) : (
                      initialData ? 'Guardar Cambios' : 'Enviar Ticket'
                    )}
                  </Button>
                </div>
              </div>

            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
