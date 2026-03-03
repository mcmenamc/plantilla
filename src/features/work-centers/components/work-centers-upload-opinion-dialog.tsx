'use client'

import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FileUp } from 'lucide-react'
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
                        Sube el archivo PDF de la Opinión de Cumplimiento (SAT) para: {currentRow?.workcenterName}. Se validará el RFC y que sea POSITIVO.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='opinionFile'
                            render={({ field: { value, onChange, ...field } }) => (
                                <FormItem>
                                    <FormLabel>Archivo PDF</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='file'
                                            accept='.pdf'
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) onChange(file)
                                            }}
                                            {...field}
                                        />
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
