import { useEffect } from 'react'

import { useForm, useWatch } from 'react-hook-form'
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
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { Combobox } from '@/components/combobox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWorkCenterStore } from '@/stores/work-center-store'
import { createClient, getClientById, updateClient } from '../data/clients-api'
import { getTaxRegimes } from '@/features/work-centers/data/work-centers-api'
import { createClientSchema, type CreateClientPayload, type Client } from '../data/schema'
import {
    getCfdiUses,
    COUNTRIES_CATALOG,
    STATES_MEXICO,
    STATES_USA,
    STATES_CANADA
} from '@/features/invoicing/data/invoicing-api'
import { Loader2 } from 'lucide-react'

interface ClientsFormProps {
    clientId?: string
    initialData?: Client
    onSuccess?: (data: Client) => void
    onCancel?: () => void
}

export function ClientsForm({ clientId, initialData, onSuccess, onCancel }: ClientsFormProps) {
    const isEdit = !!clientId

    // Fetch data if we have an ID but no initialData (direct access)
    const { data: fetchedClient, isLoading: isLoadingClient } = useQuery({
        queryKey: ['client', clientId],
        queryFn: () => getClientById(clientId!),
        enabled: isEdit && !initialData,
    })

    const client = initialData || fetchedClient

    if (isEdit && isLoadingClient) {
        return (
            <div className='flex h-64 items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        )
    }

    // Only render the form when we have the client data (if editing)
    // This ensures useForm initializes with the correct data immediately.
    if (isEdit && !client) {
        return null // Or an error state
    }

    return <ClientsFormInner client={client} onSuccess={onSuccess} onCancel={onCancel} />
}

interface ClientsFormInnerProps {
    client?: Client
    onSuccess?: (data: Client) => void
    onCancel?: () => void
}

function ClientsFormInner({ client, onSuccess, onCancel }: ClientsFormInnerProps) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { selectedWorkCenterId } = useWorkCenterStore()
    const isEdit = !!client

    const normalizeTipoPersona = (value: string | undefined): 'Persona Física' | 'Persona Moral' => {
        if (!value) return 'Persona Física'
        const normalized = value.trim()
        if (/moral/i.test(normalized)) return 'Persona Moral'
        if (/f[íi]sica/i.test(normalized)) return 'Persona Física'
        return 'Persona Física'
    }

    const defaultValues: Partial<CreateClientPayload> = {
        rfc: client?.rfc || '',
        razonSocial: client?.razonSocial || '',
        email: client?.email || '',
        tipo_persona: normalizeTipoPersona(client?.tipo_persona),
        regimenFiscal: client?.regimenFiscal || '',
        cp: client?.cp || '',
        workcenterId: client?.workcenterId || selectedWorkCenterId || '',
        default_invoice_use: client?.default_invoice_use || '',
        street: client?.street || '',
        exterior: client?.exterior || '',
        interior: client?.interior || '',
        neighborhood: client?.neighborhood || '',
        city: client?.city || '',
        municipality: client?.municipality || '',
        state: client?.state || '',
        country: client?.country || 'MEX',
        phone: client?.phone || '',
    }

    const form = useForm<CreateClientPayload>({
        resolver: zodResolver(createClientSchema),
        defaultValues,
    })

    const tipoPersona = useWatch({
        control: form.control,
        name: 'tipo_persona',
    })

    const handleTipoPersonaChange = (val: string, onChange: (...event: any[]) => void) => {
        onChange(val)
        form.setValue('regimenFiscal', '')
    }

    const { data: taxRegimes = [], isLoading: isLoadingRegimes } = useQuery({
        queryKey: ['tax-regimes', tipoPersona],
        queryFn: () => getTaxRegimes(tipoPersona as 'Persona Física' | 'Persona Moral'),
        enabled: !!tipoPersona,
    })

    const regimenFiscal = useWatch({
        control: form.control,
        name: 'regimenFiscal',
    })

    const { data: cfdiUses = [], isLoading: isLoadingCfdiUses } = useQuery({
        queryKey: ['cfdi-uses', regimenFiscal],
        queryFn: () => getCfdiUses(regimenFiscal),
        enabled: !!regimenFiscal,
    })

    const currentDefaultUse = useWatch({
        control: form.control,
        name: 'default_invoice_use',
    })

    const selectedCountry = useWatch({
        control: form.control,
        name: 'country',
    })

    const stateOptions = (() => {
        switch (selectedCountry) {
            case 'MEX': return STATES_MEXICO;
            case 'USA': return STATES_USA;
            case 'CAN': return STATES_CANADA;
            default: return [];
        }
    })()

    useEffect(() => {
        if (regimenFiscal && cfdiUses.length > 0 && currentDefaultUse) {
            const isValid = cfdiUses.some(u => u.value === currentDefaultUse)
            if (!isValid) {
                form.setValue('default_invoice_use', '')
            }
        }
    }, [cfdiUses, currentDefaultUse, form, regimenFiscal])



    const { mutate: createMutate, isPending: isCreating } = useMutation({
        mutationFn: createClient,
        onSuccess: (res: any) => {
            const data = res.data_hazFactura || res;
            const validation = res.validation;

            queryClient.setQueryData(['clients', selectedWorkCenterId], (old: Client[] | undefined) => {
                return old ? [data, ...old] : [data]
            })
            queryClient.invalidateQueries({ queryKey: ['clients', selectedWorkCenterId] })
            queryClient.invalidateQueries({ queryKey: ['notifications', 'my'] })

            if (validation && !validation.is_valid) {
                toast.warning('Cliente registrado con observaciones SAT', {
                    description: 'Revisa el centro de notificaciones para ver el detalle de validación.',
                    duration: 5000
                });
            } else {
                toast.success('Cliente registrado correctamente')
            }

            if (onSuccess) {
                onSuccess(data)
            } else {
                navigate({ to: '/clients', search: { page: 1, perPage: 10 } })
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al registrar el cliente')
        },
    })

    const { mutate: updateMutate, isPending: isUpdating } = useMutation({
        mutationFn: (data: CreateClientPayload) => updateClient(client!._id, data),
        onSuccess: (res: any) => {
            const validation = res.validation;

            queryClient.invalidateQueries({ queryKey: ['clients', selectedWorkCenterId] })
            queryClient.invalidateQueries({ queryKey: ['client', client?._id] })
            queryClient.invalidateQueries({ queryKey: ['notifications', 'my'] })

            if (validation && !validation.is_valid) {
                toast.warning('Cliente actualizado con observaciones SAT', {
                    description: 'Revisa el centro de notificaciones para ver el detalle de validación.',
                    duration: 5000
                });
            } else {
                toast.success('Cliente actualizado correctamente')
            }

            navigate({ to: '/clients', search: { page: 1, perPage: 10 } })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al actualizar el cliente')
        },
    })

    const isPending = isCreating || isUpdating

    const onSubmit = (data: CreateClientPayload) => {
        if (isEdit) {
            updateMutate(data)
        } else {
            createMutate(data)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>{isEdit ? 'Editar Cliente' : 'Registro de Cliente'}</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4 pt-4'>
                        <FormField
                            control={form.control}
                            name='razonSocial'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre o Razón Social *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={tipoPersona === 'Persona Física' ? 'Ej. Juan García López' : 'Ej. Empresa'}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <FormField
                                control={form.control}
                                name='rfc'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>RFC *</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Ej. XAXX010101000' {...field} className='uppercase' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='tipo_persona'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Persona *</FormLabel>
                                        <SelectDropdown
                                            className='w-full'
                                            isControlled={true}
                                            defaultValue={field.value}
                                            onValueChange={(val) => handleTipoPersonaChange(val, field.onChange)}
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
                        </div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <FormField
                                control={form.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email *</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Ej. contacto@ejemplo.com' {...field} value={field.value || ''} />
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
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Ej. 5512345678' {...field} value={field.value || ''} maxLength={10} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-6 border-b pb-2'>Datos Fiscales y Domicilio</div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <FormField
                                control={form.control}
                                name='regimenFiscal'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Régimen Fiscal *</FormLabel>
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
                            <FormField
                                control={form.control}
                                name='cp'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Código Postal *</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Ej. 03100' {...field} maxLength={5} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name='default_invoice_use'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Uso de CFDI por defecto</FormLabel>
                                    <FormControl>
                                        <Combobox
                                            items={cfdiUses}
                                            value={field.value || ''}
                                            onValueChange={field.onChange}
                                            placeholder='Selecciona el uso por defecto...'
                                            searchPlaceholder='Buscar uso CFDI...'
                                            isLoading={isLoadingCfdiUses}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                            <FormField
                                control={form.control}
                                name='country'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>País</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                items={COUNTRIES_CATALOG}
                                                placeholder='Seleccione un país'
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
                                                placeholder='Seleccione un estado'
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
                                        <FormLabel>Municipio / Delegación</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Ej. Cuauhtémoc' {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <FormField
                                control={form.control}
                                name='city'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ciudad / Localidad</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Ej. México' {...field} value={field.value || ''} />
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
                                            <Input placeholder='Ej. Centro' {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                            <FormField
                                control={form.control}
                                name='street'
                                render={({ field }) => (
                                    <FormItem className='sm:col-span-1'>
                                        <FormLabel>Calle</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Ej. Av. Reforma' {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='exterior'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Num. Exterior</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Ej. 123' {...field} value={field.value || ''} />
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
                                        <FormLabel>Num. Interior</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Ej. B-4' {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className='flex justify-end gap-4'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                            if (onCancel) {
                                onCancel()
                            } else {
                                navigate({ to: '/clients', search: { page: 1, perPage: 10 } })
                            }
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button type='submit' disabled={isPending}>
                        {isPending ? (isEdit ? 'Guardando...' : 'Registrando...') : (isEdit ? 'Guardar Cambios' : 'Registrar Cliente')}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
