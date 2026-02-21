'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWorkCenterStore } from '@/stores/work-center-store'
import { createProducto, getProductoById, updateProducto, searchSatProducts, searchSatUnits } from '../data/products-api'
import { createProductSchema, type CreateProductPayload, type Product } from '../data/schema'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { RemoteCombobox } from '@/components/remote-combobox'
import { useFieldArray } from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

interface ProductsFormProps {
    productId?: string
    initialData?: Product
}

export function ProductsForm({ productId, initialData }: ProductsFormProps) {
    const isEdit = !!productId

    const { data: fetchedProduct, isLoading: isLoadingProduct } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => getProductoById(productId!),
        enabled: isEdit && !initialData,
    })

    const product = initialData || fetchedProduct

    if (isEdit && isLoadingProduct) {
        return (
            <div className='flex h-64 items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        )
    }

    if (isEdit && !product) {
        return null
    }

    return <ProductsFormInner product={product} />
}

interface ProductsFormInnerProps {
    product?: Product
}

function ProductsFormInner({ product }: ProductsFormInnerProps) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { selectedWorkCenterId } = useWorkCenterStore()
    const isEdit = !!product

    const defaultValues: CreateProductPayload = {
        descripcion: product?.description || '',
        product_key: product?.product_key || '',
        product_key_nombre: product?.product_key_nombre || '',
        precio: product?.price || 0,
        tax_included: product?.tax_included ?? true,
        taxability: product?.taxability || (isEdit ? '01' : '02'),
        taxes: product
            ? (product.taxes?.map(t => ({
                type: (t.type as 'IVA' | 'ISR' | 'IEPS') || 'IVA',
                rate: t.rate || 0,
                withholding: !!(t.withholding ?? (t as any).is_retention ?? false),
                base: Number(t.base ?? 1),
                factor: (t.factor as 'Tasa' | 'Cuota' | 'Exento') || 'Tasa'
            })) || [])
            : [{ type: 'IVA', rate: 0.16, withholding: false, base: 1, factor: 'Tasa' }],
        local_taxes: product?.local_taxes?.map(t => ({
            type: String(t.type || (t as any).name || ''),
            rate: t.rate || 0,
            withholding: !!(t.withholding ?? (t as any).is_retention ?? false),
            base: Number(t.base ?? 1)
        })) || [],
        unit_key: product?.unit_key || '',
        unit_name: product?.unit_name || '',
        sku: product?.sku || '',
        workCenterId: product?.workCenter || selectedWorkCenterId || '',
    }

    const form = useForm<CreateProductPayload>({
        resolver: zodResolver(createProductSchema) as any,
        defaultValues: defaultValues,
    })

    const { fields: taxFields, append: appendTax, remove: removeTax } = useFieldArray({
        control: form.control as any,
        name: 'taxes',
    })

    const { fields: localTaxFields, append: appendLocalTax, remove: removeLocalTax } = useFieldArray({
        control: form.control as any,
        name: 'local_taxes',
    })

    const taxes = form.watch('taxes')
    const localTaxes = form.watch('local_taxes')

    useEffect(() => {
        if ((taxes && taxes.length > 0) || (localTaxes && localTaxes.length > 0)) {
            if (form.getValues('taxability') === '01') {
                form.setValue('taxability', '02')
            }
        }
    }, [taxes, localTaxes, form])

    const { mutate: createMutate, isPending: isCreating } = useMutation({
        mutationFn: createProducto,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', selectedWorkCenterId] })
            toast.success('Producto registrado correctamente')
            navigate({ to: '/products', search: { page: 1, perPage: 10 } as any })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al registrar el producto')
        },
    })

    const { mutate: updateMutate, isPending: isUpdating } = useMutation({
        mutationFn: (data: CreateProductPayload) => updateProducto(product!._id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', selectedWorkCenterId] })
            queryClient.invalidateQueries({ queryKey: ['product', product?._id] })
            toast.success('Producto actualizado correctamente')
            navigate({ to: '/products', search: { page: 1, perPage: 10 } as any })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al actualizar el producto')
        },
    })

    const isPending = isCreating || isUpdating

    const onSubmit = (data: CreateProductPayload) => {
        if (isEdit) {
            updateMutate(data)
        } else {
            createMutate(data)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className='space-y-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>{isEdit ? 'Editar Producto' : 'Registro de Producto'}</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4 pt-4'>
                        <FormField
                            control={form.control as any}
                            name='descripcion'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Descripción del producto o servicio' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control as any}
                            name='product_key'
                            render={({ field }) => (
                                <FormItem className='flex flex-col'>
                                    <FormLabel>Clave Producto/Servicio (SAT)</FormLabel>
                                    <FormControl>
                                        <RemoteCombobox
                                            value={field.value}
                                            onValueChange={(val, label) => {
                                                field.onChange(val)
                                                form.setValue('product_key_nombre', label)
                                            }}
                                            fetchFn={searchSatProducts}
                                            placeholder='Buscar clave...'
                                            initialLabel={form.getValues('product_key_nombre')}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <FormField
                                control={form.control as any}
                                name='precio'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Precio</FormLabel>
                                        <FormControl>
                                            <Input type='number' step='0.01' placeholder='0.00' {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name='sku'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SKU (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Código interno' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control as any}
                            name='unit_key'
                            render={({ field }) => (
                                <FormItem className='flex flex-col'>
                                    <FormLabel>Clave de Unidad</FormLabel>
                                    <FormControl>
                                        <RemoteCombobox
                                            value={field.value}
                                            onValueChange={(val, label) => {
                                                field.onChange(val)
                                                form.setValue('unit_name', label)
                                            }}
                                            fetchFn={searchSatUnits}
                                            placeholder='Buscar unidad...'
                                            initialLabel={form.getValues('unit_name')}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator className='my-4' />

                        <div className='space-y-4'>
                            <div className='flex items-center justify-between'>
                                <h3 className='text-lg font-medium'>Impuestos</h3>
                                <FormField
                                    control={form.control as any}
                                    name='tax_included'
                                    render={({ field }) => (
                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormLabel className='text-sm font-normal cursor-pointer'>
                                                Impuestos incluidos en el precio
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Botón Personalizado y Preajustes removidos por solicitud del usuario */}
                            <div className='space-y-4'>
                                {taxFields.map((field, index) => (
                                    <div key={field.id} className='flex items-end gap-4'>
                                        <FormField
                                            control={form.control as any}
                                            name={`taxes.${index}.type`}
                                            render={({ field }) => (
                                                <FormItem className='w-32'>
                                                    <FormLabel>Tipo</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Tipo' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value='IVA'>IVA</SelectItem>
                                                            <SelectItem value='ISR'>ISR</SelectItem>
                                                            <SelectItem value='IEPS'>IEPS</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name={`taxes.${index}.rate`}
                                            render={({ field }) => (
                                                <FormItem className='w-32'>
                                                    <FormLabel>Tasa (0.16)</FormLabel>
                                                    <FormControl>
                                                        <Input type='number' step='0.01' {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name={`taxes.${index}.base`}
                                            render={({ field }) => (
                                                <FormItem className='w-24'>
                                                    <FormLabel>Base</FormLabel>
                                                    <FormControl>
                                                        <Input type='number' {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name={`taxes.${index}.factor`}
                                            render={({ field }) => (
                                                <FormItem className='w-28'>
                                                    <FormLabel>Factor</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Factor' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value='Tasa'>Tasa</SelectItem>
                                                            <SelectItem value='Cuota'>Cuota</SelectItem>
                                                            <SelectItem value='Exento'>Exento</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name={`taxes.${index}.withholding`}
                                            render={({ field }) => (
                                                <FormItem className='flex-1'>
                                                    <FormLabel>Tipo de Impuesto</FormLabel>
                                                    <Select
                                                        onValueChange={(val) => field.onChange(val === 'true')}
                                                        value={field.value ? 'true' : 'false'}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Traslado/Retención' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value='false'>Traslado</SelectItem>
                                                            <SelectItem value='true'>Retención</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            size='icon'
                                            className='mb-1 text-destructive hover:text-destructive/80 hover:bg-destructive/10'
                                            onClick={() => removeTax(index)}
                                        >
                                            <Trash2 className='h-4 w-4' />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    className='mt-2'
                                    onClick={() => appendTax({ type: 'IVA', rate: 0.16, withholding: false, base: 1, factor: 'Tasa' })}
                                >
                                    <Plus className='mr-2 h-4 w-4' />
                                    Agregar Impuesto
                                </Button>
                            </div>
                        </div>

                        <Separator className='my-4' />

                        <div className='space-y-4'>
                            <h3 className='text-lg font-medium'>Impuestos Locales</h3>
                            <div className='space-y-4'>
                                {localTaxFields.map((field, index) => (
                                    <div key={field.id} className='flex items-end gap-4'>
                                        <FormField
                                            control={form.control as any}
                                            name={`local_taxes.${index}.type`}
                                            render={({ field }) => (
                                                <FormItem className='flex-1'>
                                                    <FormLabel>Nombre</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder='Ej. ISH' {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name={`local_taxes.${index}.rate`}
                                            render={({ field }) => (
                                                <FormItem className='w-32'>
                                                    <FormLabel>Tasa</FormLabel>
                                                    <FormControl>
                                                        <Input type='number' step='0.01' {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name={`local_taxes.${index}.base`}
                                            render={({ field }) => (
                                                <FormItem className='w-24'>
                                                    <FormLabel>Base</FormLabel>
                                                    <FormControl>
                                                        <Input type='number' {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name={`local_taxes.${index}.withholding`}
                                            render={({ field }) => (
                                                <FormItem className='flex-1'>
                                                    <FormLabel>Tipo de Impuesto</FormLabel>
                                                    <Select
                                                        onValueChange={(val) => field.onChange(val === 'true')}
                                                        value={field.value ? 'true' : 'false'}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Traslado/Retención' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value='false'>Traslado</SelectItem>
                                                            <SelectItem value='true'>Retención</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            size='icon'
                                            className='mb-1 text-destructive hover:text-destructive/80 hover:bg-destructive/10'
                                            onClick={() => removeLocalTax(index)}
                                        >
                                            <Trash2 className='h-4 w-4' />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    className='mt-2'
                                    onClick={() => appendLocalTax({ type: '', rate: 0, withholding: false, base: 1 })}
                                >
                                    <Plus className='mr-2 h-4 w-4' />
                                    Agregar Impuesto Local
                                </Button>
                            </div>
                        </div>

                        <Separator className='my-4' />

                        <FormField
                            control={form.control as any}
                            name='taxability'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Objeto de Impuesto</FormLabel>
                                    <FormControl>
                                        <select
                                            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value)}
                                        >
                                            <option value='01'>01 - No objeto de impuesto</option>
                                            <option value='02'>02 - Sí objeto de impuesto</option>
                                            <option value='03'>03 - Sí objeto de impuesto, pero no obligado a desglose</option>
                                            <option value='04'>04 - Sí objeto de impuesto, y no causa impuesto</option>
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className='flex justify-end gap-4'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => navigate({ to: '/products', search: { page: 1, perPage: 10 } as any })}
                    >
                        Cancelar
                    </Button>
                    <Button type='submit' disabled={isPending}>
                        {isPending ? (isEdit ? 'Guardando...' : 'Registrando...') : (isEdit ? 'Guardar Cambios' : 'Registrar Producto')}
                    </Button>
                </div>
            </form>
        </Form >
    )
}
