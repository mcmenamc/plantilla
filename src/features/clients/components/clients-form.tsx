'use client'

import React from 'react'
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
import { Loader2 } from 'lucide-react'

interface ClientsFormProps {
    clientId?: string
    initialData?: Client
}

export function ClientsForm({ clientId, initialData }: ClientsFormProps) {
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

    return <ClientsFormInner client={client} />
}

interface ClientsFormInnerProps {
    client?: Client
}

function ClientsFormInner({ client }: ClientsFormInnerProps) {
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

    const { mutate: createMutate, isPending: isCreating } = useMutation({
        mutationFn: createClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients', selectedWorkCenterId] })
            toast.success('Cliente registrado correctamente')
            navigate({ to: '/clients', search: { page: 1, perPage: 10 } })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al registrar el cliente')
        },
    })

    const { mutate: updateMutate, isPending: isUpdating } = useMutation({
        mutationFn: (data: CreateClientPayload) => updateClient(client!._id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients', selectedWorkCenterId] })
            queryClient.invalidateQueries({ queryKey: ['client', client?._id] })
            toast.success('Cliente actualizado correctamente')
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
                                    <FormLabel>Nombre o Razón Social</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Ej. Servicios Integrales Osvaldo GS SA de CV' {...field} />
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
                                        <FormLabel>RFC</FormLabel>
                                        <FormControl>
                                            <Input placeholder='XAXX010101000' {...field} className='uppercase' />
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
                                        <FormLabel>Tipo de Persona</FormLabel>
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
                        <FormField
                            control={form.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder='facturacion@osvaldogs.com' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <FormField
                                control={form.control}
                                name='regimenFiscal'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Régimen Fiscal</FormLabel>
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
                                        <FormLabel>Código Postal</FormLabel>
                                        <FormControl>
                                            <Input placeholder='03100' {...field} maxLength={5} />
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
                        onClick={() => navigate({ to: '/clients', search: { page: 1, perPage: 10 } })}
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
