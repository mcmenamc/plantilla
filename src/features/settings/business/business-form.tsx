import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
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
import { Combobox } from '@/components/combobox'
import { getTaxRegimes } from '@/features/work-centers/data/work-centers-api'
import { actualizarBusiness } from '../data/settings-api'
import { COUNTRIES_CATALOG, STATES_MEXICO, STATES_USA, STATES_CANADA } from '@/features/invoicing/data/invoicing-api'

const businessFormSchema = z.object({
    id: z.string(),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
    legalName: z.string().min(2, 'La razón social debe tener al menos 2 caracteres.'),
    rfc: z.string().regex(/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/, 'El RFC no tiene un formato válido.'),
    regimenFiscal: z.string().min(1, 'El régimen fiscal es obligatorio.'),
    phone: z.string().length(10, 'El teléfono debe tener 10 dígitos.'),
    tipoPersona: z.enum(['Persona Física', 'Persona Moral']),
    street: z.string().optional().nullable(),
    exterior: z.string().optional().nullable(),
    interior: z.string().optional().nullable(),
    zip: z.string().min(5, 'El código postal es obligatorio y debe tener al menos 5 dígitos.'),
    neighborhood: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    municipality: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
})

type BusinessFormValues = z.infer<typeof businessFormSchema>

export function BusinessForm() {
    const queryClient = useQueryClient()
    const { auth: { user } } = useAuthStore()
    const business = user?.business

    const defaultValues: Partial<BusinessFormValues> = {
        id: business?._id || '',
        name: business?.name || '',
        legalName: business?.legalName || '',
        rfc: business?.rfc || '',
        regimenFiscal: business?.regimenFiscal || '',
        phone: business?.phone || '',
        tipoPersona: business?.tipoPersona || 'Persona Física',
        street: business?.street || '',
        exterior: business?.exterior || '',
        interior: business?.interior || '',
        zip: business?.zip || '',
        neighborhood: business?.neighborhood || '',
        city: business?.city || '',
        municipality: business?.municipality || '',
        state: business?.state || '',
        country: business?.country || 'MEX',
    }

    const form = useForm<BusinessFormValues>({
        resolver: zodResolver(businessFormSchema),
        defaultValues,
        mode: 'onChange',
    })

    const tipoPersona = form.watch('tipoPersona')
    const selectedCountry = form.watch('country')

    const { data: taxRegimes = [], isLoading: isLoadingRegimes } = useQuery({
        queryKey: ['tax-regimes', tipoPersona],
        queryFn: () => getTaxRegimes(tipoPersona as 'Persona Física' | 'Persona Moral'),
        enabled: !!tipoPersona,
    })

    const stateOptions = (() => {
        switch (selectedCountry) {
            case 'MEX': return STATES_MEXICO;
            case 'USA': return STATES_USA;
            case 'CAN': return STATES_CANADA;
            default: return [];
        }
    })()

    const { mutate, isPending } = useMutation({
        mutationFn: actualizarBusiness,
        onSuccess: () => {
            toast.success('Datos fiscales actualizados con éxito')
            queryClient.invalidateQueries({ queryKey: ['user-data'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al actualizar los datos fiscales')
        },
    })

    function onSubmit(data: BusinessFormValues) {
        mutate(data as any)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 pb-10'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre Comercial <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder='Mi Negocio' {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='legalName'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Razón Social / Nombre Legal <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder='RAZON SOCIAL S.A. DE C.V.' {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <FormField
                        control={form.control}
                        name='rfc'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>RFC <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder='XAXX010101000' {...field} value={field.value || ''} className='uppercase' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='phone'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teléfono <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder='5512345678' {...field} value={field.value || ''} maxLength={10} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <FormField
                        control={form.control}
                        name='tipoPersona'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Persona <span className='text-red-500'>*</span></FormLabel>
                                <SelectDropdown
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}
                                    placeholder='Seleccionar'
                                    items={[
                                        { label: 'Persona Física', value: 'Persona Física' },
                                        { label: 'Persona Moral', value: 'Persona Moral' },
                                    ]}
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='regimenFiscal'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Régimen Fiscal <span className='text-red-500'>*</span></FormLabel>
                                <FormControl>
                                    <Combobox
                                        items={taxRegimes}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Selecciona el régimen...'
                                        searchPlaceholder='Buscar régimen...'
                                        isLoading={isLoadingRegimes}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='border-t pt-6'>
                    <h3 className='text-lg font-medium mb-4'>Domicilio Fiscal</h3>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                        <FormField
                            control={form.control}
                            name='street'
                            render={({ field }) => (
                                <FormItem className='md:col-span-2'>
                                    <FormLabel>Calle</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Av. Juárez' {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='zip'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Código Postal <span className='text-red-500'>*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder='06000' {...field} value={field.value || ''} maxLength={5} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-6 md:grid-cols-3 mt-4'>
                        <FormField
                            control={form.control}
                            name='exterior'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Num. Ext.</FormLabel>
                                    <FormControl>
                                        <Input placeholder='100' {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='interior'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Num. Int. (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder='A-1' {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='neighborhood'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Colonia</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Centro' {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-6 md:grid-cols-3 mt-4'>
                        <FormField
                            control={form.control}
                            name='country'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>País</FormLabel>
                                    <FormControl>
                                        <Combobox
                                            items={COUNTRIES_CATALOG}
                                            placeholder='País'
                                            value={field.value || 'MEX'}
                                            onValueChange={(val) => {
                                                field.onChange(val)
                                                form.setValue('state', '')
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='state'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado</FormLabel>
                                    <FormControl>
                                        <Combobox
                                            items={stateOptions}
                                            placeholder='Estado'
                                            value={field.value || ''}
                                            onValueChange={field.onChange}
                                            disabled={!selectedCountry}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='municipality'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Municipio / Alcaldía</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Cuauhtémoc' {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Button type='submit' size='lg' disabled={isPending} className='w-full md:w-auto'>
                    {isPending ? 'Guardando...' : 'Actualizar datos fiscales'}
                </Button>
            </form>
        </Form>
    )
}

