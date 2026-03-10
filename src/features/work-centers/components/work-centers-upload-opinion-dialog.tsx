'use client'

import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
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
import { useWorkCenters } from './work-centers-provider'
import { uploadOpinionCumplimiento } from '../data/work-centers-api'
import { AlertTriangle, ExternalLink, FileUp } from 'lucide-react'

const uploadSchema = z.object({
    opinionFile: z.any().refine((file) => file instanceof File, 'El archivo PDF es obligatorio'),
})

type UploadSchema = z.infer<typeof uploadSchema>

export function WorkCentersUploadOpinionDialog() {
    const { open, setOpen, currentRow, setCurrentRow } = useWorkCenters()
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const form = useForm<UploadSchema>({
        resolver: zodResolver(uploadSchema),
    })

    const { mutate: uploadMutate, isPending } = useMutation({
        mutationFn: (data: UploadSchema) => {
            const formData = new FormData()
            formData.append('file', data.opinionFile)
            return uploadOpinionCumplimiento(currentRow?._id || '', formData)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-centers'] })
            toast.success('Opinión de cumplimiento subida y validada correctamente')
            handleOpenChange(false)
        },
        onError: (error: any) => {
            const data = error.response?.data;

            // 1. Mostrar el mensaje general
            toast.error(data?.message || 'Error en el servidor');

            // 2. Si hay detalles, mostrarlos uno por uno o como lista
            data?.detalles?.forEach((detalle: string) => {
                toast.error(detalle, {
                    duration: 5000, // Un poco más de tiempo para que alcancen a leer
                });
            });
        }
    })

    const handleOpenChange = (state: boolean) => {
        if (!state) {
            setOpen(null)

            // If we are in the /add route, navigate back to list
            if (window.location.pathname.includes('/work-centers/add')) {
                navigate({ to: '/work-centers', search: { page: 1, perPage: 10 } })
            }

            setTimeout(() => {
                setCurrentRow(null)
                form.reset()
            }, 500)
        }
    }

    const onSubmit = (data: UploadSchema) => {
        uploadMutate(data)
    }

    const isOpen = open === 'upload-opinion'

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <FileUp className='h-5 w-5' />
                        Subir Opinión de Cumplimiento
                    </DialogTitle>
                    <DialogDescription>
                        Sube el archivo PDF de la Opinión de Cumplimiento (SAT) para: <span className='font-bold text-zinc-900 dark:text-zinc-100'>{currentRow?.workcenterName}</span>.
                        Este documento tiene una vigencia de 6 meses (180 días) en el sistema.
                    </DialogDescription>
                </DialogHeader>

                <div className='bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-800 dark:bg-orange-950/20 dark:border-orange-900/30 dark:text-orange-400'>
                    <p className='font-bold flex items-center gap-1.5 mb-1'>
                        <AlertTriangle className='h-3.5 w-3.5' /> Recordatorio de Vigencia
                    </p>
                    <p>
                        Para mantener tu capacidad de facturación, la Opinión del SAT debe renovarse cada <strong>6 meses</strong>.
                        El sistema validará automáticamente que el archivo sea el correcto, el RFC coincida y que el sentido sea <strong>POSITIVO</strong>.
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='opinionFile'
                            render={({ field: { value, onChange, ...field } }) => (
                                <FormItem>
                                    <FormLabel className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                                        Seleccionar Archivo PDF
                                    </FormLabel>
                                    <FormControl>
                                        <div className='space-y-3'>
                                            <Input
                                                type='file'
                                                accept='.pdf'
                                                className='bg-zinc-50 dark:bg-zinc-900'
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) onChange(file)
                                                }}
                                                {...field}
                                            />
                                            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                                <ExternalLink className='h-4 w-4' />
                                                <span>¿No tienes tu opinión? </span>
                                                <a
                                                    href='https://www.sat.gob.mx/portal/public/tramites/opinion-del-cumplimiento'
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='text-primary font-medium hover:underline flex items-center gap-1'
                                                >
                                                    Descárgala aquí desde el SAT
                                                </a>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='flex justify-end gap-3 pt-4'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => handleOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancelar
                            </Button>
                            <Button type='submit' disabled={isPending}>
                                {isPending ? 'Validando...' : 'Subir Documento'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
