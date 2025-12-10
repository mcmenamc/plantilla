'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { SelectDropdown } from '@/components/select-dropdown'
import { type Client } from '../data/schema'

const formSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido.'),
    rfc: z.string().min(12, 'RFC inválido.').max(13, 'RFC inválido.'),
    email: z.email('Email inválido.'),
    phone: z.string().min(1, 'El teléfono es requerido.'),
    status: z.string().min(1, 'El estado es requerido.'),
    isEdit: z.boolean(),
})

type ClientForm = z.infer<typeof formSchema>

type ClientsActionDialogProps = {
    currentRow?: Client
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ClientsActionDialog({
    currentRow,
    open,
    onOpenChange,
}: ClientsActionDialogProps) {
    const isEdit = !!currentRow
    const form = useForm<ClientForm>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: isEdit
            ? {
                ...currentRow,
                isEdit,
            }
            : {
                name: '',
                rfc: '',
                email: '',
                phone: '',
                status: 'active',
                isEdit,
            },
    })

    const onSubmit = (values: ClientForm) => {
        form.reset()
        showSubmittedData(values)
        onOpenChange(false)
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(state) => {
                form.reset()
                onOpenChange(state)
            }}
        >
            <DialogContent className='sm:max-w-lg'>
                <DialogHeader className='text-start'>
                    <DialogTitle>{isEdit ? 'Editar Cliente' : 'Agregar Cliente'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Actualiza los datos del cliente aquí. ' : 'Crea un nuevo cliente aquí. '}
                        Haz clic en guardar cuando termines.
                    </DialogDescription>
                </DialogHeader>
                <div className='h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
                    <Form {...form}>
                        <form
                            id='client-form'
                            onSubmit={form.handleSubmit(onSubmit as any)}
                            className='space-y-4 px-0.5'
                        >
                            <FormField
                                control={form.control as any}
                                name='name'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>Nombre</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Empresa S.A. de C.V.' className='col-span-4' {...field} />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name='rfc'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>RFC</FormLabel>
                                        <FormControl>
                                            <Input placeholder='XAXX010101000' className='col-span-4' {...field} />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name='email'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder='contacto@empresa.com' className='col-span-4' {...field} />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name='phone'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>Teléfono</FormLabel>
                                        <FormControl>
                                            <Input placeholder='5512345678' className='col-span-4' {...field} />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name='status'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>Estado</FormLabel>
                                        <SelectDropdown
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder='Selecciona un estado'
                                            className='col-span-4'
                                            items={[
                                                { label: 'Activo', value: 'active' },
                                                { label: 'Inactivo', value: 'inactive' },
                                            ]}
                                        />
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>
                <DialogFooter>
                    <Button type='submit' form='client-form'>
                        Guardar cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
