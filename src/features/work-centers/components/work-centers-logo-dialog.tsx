import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ImagePlus, Loader2, UploadCloud } from 'lucide-react'
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
    FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { useWorkCenters } from './work-centers-provider'

const MAX_SIZE = 500 * 1024 // 500 KB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png']

const formSchema = z.object({
    file: z
        .custom<FileList>((val) => val instanceof FileList, 'La imagen es obligatoria')
        .refine((files) => files.length > 0, 'La imagen es obligatoria')
        .refine(
            (files) => ALLOWED_MIME_TYPES.includes(files[0]?.type),
            'Solo se permiten archivos .jpg y .png'
        )
        .refine(
            (files) => files[0]?.size <= MAX_SIZE,
            'El tamaño máximo del archivo es de 500KB'
        ),
})

export function WorkCentersLogoDialog() {
    const { open, setOpen, currentRow, setCurrentRow } = useWorkCenters()
    const queryClient = useQueryClient()
    const [preview, setPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const isOpen = open === 'upload-logo'

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    const { mutate: uploadLogo, isPending } = useMutation({
        mutationFn: async (formData: FormData) => {
            const response = await api.post('/workcenter/agregar-logo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            return response.data
        },
        onSuccess: () => {
            toast.success('Logo actualizado correctamente')
            queryClient.invalidateQueries({ queryKey: ['work-centers'] })
            handleClose()
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message ||
                'Ocurrió un error al subir el logo'
            )
        },
    })

    const handleClose = () => {
        setOpen(null)
        form.reset()
        setPreview(null)
        setTimeout(() => setCurrentRow(null), 500)
    }

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (!currentRow) return

        const formData = new FormData()
        formData.append('workCenterId', currentRow._id)
        formData.append('file', values.file[0])

        uploadLogo(formData)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setPreview(URL.createObjectURL(file))
        }
    }

    // Trigger file input click
    const handleBoxClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>Actualizar Logo</DialogTitle>
                    <DialogDescription>
                        Sube el logotipo de la organización que será colocado en el PDF y en los correos que se envían al cliente.
                        Se recomienda un tamaño de <span className='font-medium text-zinc-900 dark:text-zinc-100'>800 × 500px</span>.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-6'
                    >
                        <FormField
                            control={form.control}
                            name='file'
                            render={({ field: { onChange, value, ...field } }) => (
                                <FormItem>
                                    <FormControl>
                                        <div
                                            onClick={handleBoxClick}
                                            className='border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 transition-colors rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer gap-4 min-h-[200px]'
                                        >
                                            <Input
                                                {...field}
                                                value={undefined}
                                                type='file'
                                                accept='image/png, image/jpeg'
                                                className='hidden'
                                                ref={fileInputRef}
                                                onChange={(e) => {
                                                    onChange(e.target.files)
                                                    handleFileChange(e)
                                                }}
                                            />
                                            {preview ? (
                                                <div className='relative w-32 h-32 rounded-full overflow-hidden border-2 border-border shadow-sm'>
                                                    <img
                                                        src={preview}
                                                        alt='Preview'
                                                        className='w-full h-full object-cover'
                                                    />
                                                </div>
                                            ) : (
                                                currentRow?.imagen ? (
                                                    <div className='relative w-32 h-32 rounded-full overflow-hidden border-2 border-border shadow-sm'>
                                                        <img
                                                            // Assuming logo is a full URL or relative path. If relative, prepend base URL
                                                            src={currentRow.imagen}
                                                            alt='Current Logo'
                                                            className='w-full h-full object-cover'
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className='w-20 h-20 bg-muted rounded-full flex items-center justify-center'>
                                                        <ImagePlus className='w-10 h-10 text-muted-foreground' />
                                                    </div>
                                                )
                                            )}
                                            <div className='text-center space-y-1'>
                                                <p className='text-sm font-medium text-primary'>
                                                    {preview
                                                        ? 'Cambiar imagen'
                                                        : 'Clic para subir imagen'}
                                                </p>
                                                <p className='text-xs text-muted-foreground'>
                                                    PNG o JPG (Máx. 500KB)
                                                </p>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='flex justify-end gap-2'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleClose}
                            >
                                Cancelar
                            </Button>
                            <Button type='submit' disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Subiendo...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className='mr-2 h-4 w-4' />
                                        Subir Logo
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
