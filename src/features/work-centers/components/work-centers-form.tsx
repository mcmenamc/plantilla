'use client'

import React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useWorkCenters } from './work-centers-provider'
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
import { useAuthStore } from '@/stores/auth-store'
import { getWorkCenters, createWorkCenter, updateWorkCenter, getTaxRegimes, getWorkCenterById } from '../data/work-centers-api'
import { type WorkCenter, createWorkCenterSchema, type CreateWorkCenterPayload } from '../data/schema'
import { Loader2 } from 'lucide-react'

type WorkCentersFormProps = {
    workCenterId?: string
    initialData?: WorkCenter
    onSuccess?: () => void
}

export function WorkCentersForm({ workCenterId, initialData, onSuccess }: WorkCentersFormProps) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { auth } = useAuthStore()

    const isEdit = !!workCenterId || !!initialData

    // Fetch data if we have an ID but no initialData (direct page access)
    const { data: fetchedWorkCenter, isLoading: isLoadingWC } = useQuery({
        queryKey: ['work-center', workCenterId],
        queryFn: () => getWorkCenterById(workCenterId!),
        enabled: !!workCenterId && !initialData,
    })

    const wc = initialData || fetchedWorkCenter

    const form = useForm<CreateWorkCenterPayload>({
        resolver: zodResolver(createWorkCenterSchema),
        defaultValues: {
            rfc: '',
            nombre: '',
            phone: '',
            regimenFiscal: '',
            tipo_persona: 'Persona Física',
            legal_name: '',
            calle: '',
            num_exterior: '',
            num_interior: '',
            cp: '',
            colonia: '',
            ciudad: '',
            municipio: '',
            estado: '',
            email: '',
        },
    })

    // Fetch work centers to check if it's the first one
    const { data: workCenters = [] } = useQuery({
        queryKey: ['work-centers'],
        queryFn: getWorkCenters,
        enabled: !isEdit, // Only needed for creation
    })

    // Autofill for first-time users
    React.useEffect(() => {
        if (!isEdit && workCenters.length === 0 && auth.user) {
            const businessData = auth.user.business

            // Prioritize business data if available, fallback to user profile
            const nombre = businessData?.shortName || businessData?.name || auth.user.nombre || ''
            const legalName = businessData?.legalName || (auth.user.nombre ? `${auth.user.nombre} ${auth.user.apellidos}`.trim() : '')

            form.setValue('nombre', nombre)
            form.setValue('legal_name', legalName)
            form.setValue('email', auth.user.email || '')

            if (businessData) {
                if (businessData.rfc) form.setValue('rfc', businessData.rfc)
                if (businessData.phone) form.setValue('phone', businessData.phone)

                // Use business data or user profile data
                const regimenFiscal = businessData.regimenFiscal || auth.user.regimenFiscal
                if (regimenFiscal) form.setValue('regimenFiscal', regimenFiscal)

                const tipoPersona = businessData.tipoPersona || (auth.user.tipoPersona as any)
                if (tipoPersona) form.setValue('tipo_persona', tipoPersona)
            } else {
                // If no business data, try to use user profile data if available
                if (auth.user.regimenFiscal) form.setValue('regimenFiscal', auth.user.regimenFiscal)
                if (auth.user.tipoPersona) form.setValue('tipo_persona', auth.user.tipoPersona as any)
            }
        }
    }, [isEdit, workCenters.length, auth.user, form])

    // Helper to normalize person type from API
    const normalizeTipoPersona = (type: string | undefined): 'Persona Física' | 'Persona Moral' => {
        if (!type) return 'Persona Física'
        const lower = type.toLowerCase()
        if (lower.includes('moral')) return 'Persona Moral'
        return 'Persona Física'
    }

    // Update form when data changes
    React.useEffect(() => {
        if (wc) {
            form.reset({
                rfc: wc.rfc,
                nombre: wc.workcenterName,
                phone: wc.phone,
                regimenFiscal: wc.regimenFiscal,
                tipo_persona: normalizeTipoPersona(wc.tipo_persona),
                legal_name: (wc as any).legal_name || wc.workcenterName || '',
                calle: wc.direccion.calle,
                num_exterior: wc.direccion.exterior,
                num_interior: wc.direccion.interior || '',
                cp: wc.direccion.cp,
                colonia: (wc as any).colonia || '',
                ciudad: wc.direccion.localidad_ciudad,
                municipio: wc.direccion.municipio,
                estado: wc.direccion.estado,
                email: (wc as any).email || '',
            })
        }
    }, [wc, form])

    const tipoPersona = useWatch({
        control: form.control,
        name: 'tipo_persona',
    })

    // Reset tax regime when person type changes (ONLY when changed by user)
    const handleTipoPersonaChange = (val: string, onChange: (...event: any[]) => void) => {
        onChange(val)
        form.setValue('regimenFiscal', '')
    }

    const { data: taxRegimes = [], isLoading: isLoadingRegimes } = useQuery({
        queryKey: ['tax-regimes', tipoPersona],
        queryFn: () => getTaxRegimes(tipoPersona as 'Persona Física' | 'Persona Moral'),
        enabled: !!tipoPersona,
    })

    const { setOpen, setCurrentRow } = useWorkCenters()

    const { mutate: createMutate, isPending: isCreating } = useMutation({
        mutationFn: (data: CreateWorkCenterPayload) => createWorkCenter(data),
        onSuccess: (newWorkCenter) => {
            queryClient.invalidateQueries({ queryKey: ['work-centers'] })
            toast.success('Centro de trabajo creado correctamente')

            // Prompt for certificates (The dialog itself will handle exit/navigation)
            setCurrentRow(newWorkCenter)
            setOpen('confirm-upload')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al crear el centro de trabajo')
        },
    })

    const { mutate: updateMutate, isPending: isUpdating } = useMutation({
        mutationFn: (data: CreateWorkCenterPayload) =>
            updateWorkCenter({ id: (workCenterId || initialData?._id)!, data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['work-centers'] })
            queryClient.invalidateQueries({ queryKey: ['work-center', workCenterId] })
            toast.success('Centro de trabajo actualizado correctamente')
            if (onSuccess) {
                onSuccess()
            } else {
                navigate({ to: '/work-centers', search: { page: 1, perPage: 10 } })
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al actualizar el centro de trabajo')
        },
    })

    const isPending = isCreating || isUpdating || isLoadingWC

    if (isLoadingWC) {
        return (
            <div className='flex h-64 items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        )
    }

    const onSubmit = (data: CreateWorkCenterPayload) => {
        if (isEdit) {
            updateMutate(data)
        } else {
            createMutate(data)
        }
    }

    const handleCancel = () => {
        if (onSuccess) {
            onSuccess()
        } else {
            navigate({ to: '/work-centers', search: { page: 1, perPage: 10 } })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6'>
                    {/* Información General */}
                    <Card className={onSuccess ? 'border-0 shadow-none' : ''}>
                        {!onSuccess && (
                            <CardHeader>
                                <CardTitle>Información General</CardTitle>
                            </CardHeader>
                        )}
                        <CardContent className='space-y-4 pt-4'>
                            <FormField
                                control={form.control}
                                name='nombre'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre del Centro de Trabajo (Alias)</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Ej. Sucursal Centro' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='legal_name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Razón Social (Legal Name)</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Ej. Mi Empresa' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                                <FormField
                                    control={form.control}
                                    name='rfc'
                                    render={({ field }) => (
                                        <FormItem className='sm:col-span-1'>
                                            <FormLabel>RFC</FormLabel>
                                            <FormControl>
                                                <Input placeholder='XAXX010101000' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='tipo_persona'
                                    render={({ field }) => (
                                        <FormItem className='sm:col-span-2'>
                                            <FormLabel>Tipo Persona</FormLabel>
                                            <SelectDropdown
                                                className='w-full'
                                                defaultValue={field.value}
                                                onValueChange={(val) => handleTipoPersonaChange(val, field.onChange)}
                                                placeholder='Selecciona tipo'
                                                isControlled={true}
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
                            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                                <FormField
                                    control={form.control}
                                    name='regimenFiscal'
                                    render={({ field }) => (
                                        <FormItem className='sm:col-span-2'>
                                            <FormLabel>Régimen Fiscal</FormLabel>
                                            <FormControl>
                                                <Combobox
                                                    items={taxRegimes}
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    placeholder='Selecciona un régimen'
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
                                    name='phone'
                                    render={({ field }) => (
                                        <FormItem className='sm:col-span-1'>
                                            <FormLabel>Teléfono</FormLabel>
                                            <FormControl>
                                                <Input placeholder='5512345678' {...field} maxLength={10} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder='contacto@empresa.com' {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Dirección */}
                    <Card className={onSuccess ? 'border-0 shadow-none' : ''}>
                        {!onSuccess && (
                            <CardHeader>
                                <CardTitle>Dirección</CardTitle>
                            </CardHeader>
                        )}
                        <CardContent className='space-y-4 pt-4'>
                            <FormField
                                control={form.control}
                                name='calle'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Calle</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Av. Juárez' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className='grid grid-cols-3 gap-4'>
                                <FormField
                                    control={form.control}
                                    name='num_exterior'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>No. Ext</FormLabel>
                                            <FormControl>
                                                <Input placeholder='100' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='num_interior'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>No. Int</FormLabel>
                                            <FormControl>
                                                <Input placeholder='A' {...field} value={field.value || ''} />
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
                                            <FormLabel>C.P.</FormLabel>
                                            <FormControl>
                                                <Input placeholder='12345' {...field} maxLength={5} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name='colonia'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Colonia (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Centro' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <FormField
                                    control={form.control}
                                    name='ciudad'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ciudad (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder='Ciudad de México' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='municipio'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Municipio (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder='Cuauhtémoc' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name='estado'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder='CDMX' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className='flex justify-end gap-4'>
                    <Button type='button' variant='outline' onClick={handleCancel}>
                        Cancelar
                    </Button>
                    <Button type='submit' disabled={isPending}>
                        {isPending ? (isEdit ? 'Guardando...' : 'Creando...') : (isEdit ? 'Guardar Cambios' : 'Crear Centro de Trabajo')}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
