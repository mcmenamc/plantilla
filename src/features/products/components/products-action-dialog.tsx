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
import { type Product } from '../data/schema'

const formSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido.'),
    code: z.string().min(1, 'El código es requerido.'),
    price: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0.'),
    stock: z.coerce.number().min(0, 'El stock debe ser mayor o igual a 0.'),
    status: z.string().min(1, 'El estado es requerido.'),
    isEdit: z.boolean(),
})

type ProductForm = z.infer<typeof formSchema>

type ProductsActionDialogProps = {
    currentRow?: Product
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ProductsActionDialog({
    currentRow,
    open,
    onOpenChange,
}: ProductsActionDialogProps) {
    const isEdit = !!currentRow
    const form = useForm<ProductForm>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: isEdit
            ? {
                ...currentRow,
                isEdit,
            }
            : {
                name: '',
                code: '',
                price: 0,
                stock: 0,
                status: 'active',
                isEdit,
            },
    })

    const onSubmit = (values: ProductForm) => {
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
                    <DialogTitle>{isEdit ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Actualiza los datos del producto aquí. ' : 'Crea un nuevo producto aquí. '}
                        Haz clic en guardar cuando termines.
                    </DialogDescription>
                </DialogHeader>
                <div className='h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
                    <Form {...form}>
                        <form
                            id='product-form'
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
                                            <Input placeholder='Producto X' className='col-span-4' {...field} />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name='code'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>Código</FormLabel>
                                        <FormControl>
                                            <Input placeholder='PROD001' className='col-span-4' {...field} />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name='price'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>Precio</FormLabel>
                                        <FormControl>
                                            <Input type='number' placeholder='0.00' className='col-span-4' {...field} />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name='stock'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                                        <FormLabel className='col-span-2 text-end'>Stock</FormLabel>
                                        <FormControl>
                                            <Input type='number' placeholder='0' className='col-span-4' {...field} />
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
                    <Button type='submit' form='product-form'>
                        Guardar cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
