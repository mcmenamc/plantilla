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
import { uploadCertificates } from '../data/work-centers-api'

const uploadSchema = z.object({
    contrasena: z.string().min(1, 'La contraseña es obligatoria'),
    cerFile: z.any().refine((file) => file instanceof File, 'El archivo .cer es obligatorio'),
    keyFile: z.any().refine((file) => file instanceof File, 'El archivo .key es obligatorio'),
})

type UploadSchema = z.infer<typeof uploadSchema>

export function WorkCentersUploadCertDialog() {
    const { open, setOpen, currentRow, setCurrentRow } = useWorkCenters()
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const form = useForm<UploadSchema>({
        resolver: zodResolver(uploadSchema),
        defaultValues: {
            contrasena: '',
        },
    })

    const { mutate: uploadMutate, isPending } = useMutation({
        mutationFn: (data: UploadSchema) => {
            const formData = new FormData()
            formData.append('workCenterId', currentRow?._id || '')
            formData.append('contrasena', data.contrasena)
            formData.append('files', data.cerFile)
            formData.append('files', data.keyFile)
            return uploadCertificates(formData)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-centers'] })
            toast.success('Certificados subidos correctamente')
            handleOpenChange(false)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al subir los certificados')
        },
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

    const isOpen = open === 'upload-cert'

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <FileUp className='h-5 w-5' />
                        Subir Certificados (CSD)
                    </DialogTitle>
                    <DialogDescription>
                        Sube los archivos .cer y .key de tu centro de trabajo: {currentRow?.workcenterName}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='contrasena'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contraseña de los Certificados</FormLabel>
                                    <FormControl>
                                        <Input type='password' placeholder='********' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='cerFile'
                            render={({ field: { value, onChange, ...field } }) => (
                                <FormItem>
                                    <FormLabel>Archivo .cer</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='file'
                                            accept='.cer'
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

                        <FormField
                            control={form.control}
                            name='keyFile'
                            render={({ field: { value, onChange, ...field } }) => (
                                <FormItem>
                                    <FormLabel>Archivo .key</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='file'
                                            accept='.key'
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
                                {isPending ? 'Subiendo...' : 'Subir Certificados'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
