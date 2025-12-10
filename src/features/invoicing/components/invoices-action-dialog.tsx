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
import { type Invoice } from '../data/schema'

const formSchema = z.object({
    client: z.string().min(1, 'El cliente es requerido.'),
    total: z.coerce.number().min(0, 'El total debe ser mayor o igual a 0.'),
    status: z.string().min(1, 'El estado es requerido.'),
    isEdit: z.boolean(),
})

type InvoiceForm = z.infer<typeof formSchema>

type InvoicesActionDialogProps = {
    currentRow?: Invoice
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function InvoicesActionDialog({
    currentRow,
    open,
    onOpenChange,
}: InvoicesActionDialogProps) {
    const isEdit = !!currentRow
    const form = useForm<InvoiceForm>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: isEdit
            ? {
                ...currentRow,
                isEdit,
            }
            : {
                client: '',
                total: 0,
                status: 'pending',
                isEdit,
            },
    })

    const onSubmit = (values: InvoiceForm) => {
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
                    <DialogTitle>{isEdit ? 'Editar Factura' : 'Nueva Factura'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Actualiza los datos de la factura aquí. ' : 'Crea una nueva factura aquí. '}
                        Haz clic en guardar cuando termines.
                    </DialogDescription>
                </DialogHeader>
                <div className='h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
                    <Form {...form}>
                        <form
                            id='invoice-form'
                            onSubmit={form.handleSubmit(onSubmit as any)}
                            className='space-y-4 px-0.5'
                        >
                            <FormField
                                control={form.control as any}
                                name='client'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>Cliente</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Cliente S.A.' className='col-span-4' {...field} />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name='total'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>Total</FormLabel>
                                        <FormControl>
                                            <Input type='number' placeholder='0.00' className='col-span-4' {...field} />
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
                                                { label: 'Pagada', value: 'paid' },
                                                { label: 'Pendiente', value: 'pending' },
                                                { label: 'Cancelada', value: 'cancelled' },
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
                    <Button type='submit' form='invoice-form'>
                        Guardar cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
