import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
    LayoutDashboard,
    Download,
    Users,
    FileText,
    Settings,
    Database,
    PlusCircle,
    Map as MapIcon,
    UserPlus,
    PlusSquare,
    FilePlus,
} from 'lucide-react'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Administrator,
    administratorFormSchema,
    AdministratorFormValues,
    Module
} from '../data/schema'

// Action columns are derived dynamically from backend data inside the component

const iconMap: Record<string, any> = {
    'dashboard': LayoutDashboard,
    'download': Download,
    'users': Users,
    'series': FileText,
    'settings': Settings,
    'workcenter': Database,
    'add_workcenter': PlusCircle,
    'customers': MapIcon,
    'add_customer': UserPlus,
    'products': FileText,
    'add_product': PlusSquare,
    'invoices': FileText,
    'add_invoice': FilePlus,
}


type AdministratorsFormProps = {
    currentRow?: Administrator
    modules: Module[]
    onSubmit: (values: AdministratorFormValues) => void
    isLoading?: boolean
}

export function AdministratorsForm({
    currentRow,
    modules,
    onSubmit,
    isLoading,
}: AdministratorsFormProps) {
    const navigate = useNavigate()
    const isEdit = !!currentRow

    const form = useForm<AdministratorFormValues>({
        resolver: zodResolver(administratorFormSchema),
        defaultValues: isEdit
            ? {
                nombre: currentRow.user.nombre,
                apellidos: currentRow.user.apellidos,
                email: currentRow.user.email,
                workCenterId: currentRow.workCenter,
                permissions: modules.map((m) => {
                    const existing = currentRow.permissions.find(
                        (p) => (typeof p.module === 'string' ? p.module : p.module._id) === m._id
                    )
                    return {
                        module: m._id,
                        actions: existing ? existing.actions : [],
                    }
                }),
            }
            : {
                nombre: '',
                apellidos: '',
                email: '',
                workCenterId: '',
                permissions: modules.map((m) => ({
                    module: m._id,
                    actions: [],
                })),
            },
    })

    useEffect(() => {
        // If modules just loaded and we haven't initialized the form permissions properly yet
        const currentPermissions = form.getValues('permissions') || []

        if (!isEdit && modules.length > 0 && currentPermissions.length === 0) {
            form.reset({
                ...form.getValues(),
                permissions: modules.map((m) => ({
                    module: m._id,
                    actions: [],
                }))
            })
        }

        // Explicitly register the fields so react-hook-form does not strip them during validation
        // just because there isn't a checked checkbox currently mounted
        modules.forEach((m, idx) => {
            form.register(`permissions.${idx}.module` as const)
            form.register(`permissions.${idx}.actions` as const)

            if (form.getValues(`permissions.${idx}.module`) === undefined) {
                form.setValue(`permissions.${idx}.module`, m._id, { shouldDirty: false })
            }
            if (form.getValues(`permissions.${idx}.actions`) === undefined) {
                form.setValue(`permissions.${idx}.actions`, [], { shouldDirty: false })
            }
        })
    }, [modules, isEdit, form])

    const toggleAllInModule = (moduleIndex: number, actions: string[]) => {
        const currentSelected = form.getValues(`permissions.${moduleIndex}.actions`) || []
        if (currentSelected.length === actions.length) {
            form.setValue(`permissions.${moduleIndex}.actions`, [], { shouldDirty: true })
        } else {
            form.setValue(`permissions.${moduleIndex}.actions`, actions, { shouldDirty: true })
        }
    }



    const renderModuleRow = (module: Module, isChild = false) => {
        const moduleIndex = modules.findIndex(m => m._id === module._id)
        const Icon = module.icono ? (iconMap[module.icono] || FileText) : FileText

        return (
            <div
                key={module._id}
                className={`flex flex-col sm:flex-row sm:items-center gap-4 py-3 border-b last:border-b-0 ${isChild ? 'pl-8 bg-muted/20' : ''}`}
            >
                {/* Module name */}
                <div className='flex items-center gap-2 w-full sm:w-[220px] shrink-0'>
                    <Icon className='h-4 w-4 shrink-0 text-muted-foreground' />
                    <span className={`text-sm ${isChild ? 'text-muted-foreground' : 'font-medium'}`}>
                        {module.nombre}
                    </span>
                </div>

                {/* Actions list */}
                <div className='flex flex-wrap items-center gap-4 flex-1'>
                    {module.acciones.map((accion) => (
                        <FormField
                            key={`${module._id}-${accion}`}
                            control={form.control}
                            name={`permissions.${moduleIndex}.actions`}
                            render={({ field }) => {
                                const isChecked = field.value?.includes(accion) || false
                                return (
                                    <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                                        <FormControl>
                                            <Checkbox
                                                checked={isChecked}
                                                onCheckedChange={(checked) => {
                                                    const current = field.value || []
                                                    if (checked) {
                                                        field.onChange([...current, accion])
                                                    } else {
                                                        field.onChange(current.filter((a: string) => a !== accion))
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormLabel className='text-xs font-normal cursor-pointer text-foreground'>
                                            {accion}
                                        </FormLabel>
                                    </FormItem>
                                )
                            }}
                        />
                    ))}
                </div>

                {/* Select all button */}
                <FormField
                    control={form.control}
                    name={`permissions.${moduleIndex}.actions`}
                    render={({ field }) => {
                        const allSelected = (field.value?.length || 0) === module.acciones.length && module.acciones.length > 0
                        return (
                            <div className='shrink-0 sm:w-[100px] flex sm:justify-end'>
                                <Button
                                    type='button'
                                    variant='secondary'
                                    size='sm'
                                    className='h-7 text-xs w-full sm:w-auto'
                                    onClick={() => toggleAllInModule(moduleIndex, module.acciones)}
                                >
                                    {allSelected ? 'Quitar Todos' : 'Seleccionar Todos'}
                                </Button>
                            </div>
                        )
                    }}
                />
            </div>
        )
    }

    return (
        <Card className='mx-auto'>
            <CardHeader>
                <CardTitle>{isEdit ? 'Editar Administrador' : 'Nuevo Administrador'}</CardTitle>
                <CardDescription>
                    {isEdit
                        ? 'Actualiza los permisos del administrador aquí.'
                        : 'Asigna permisos a un nuevo usuario para este centro de trabajo.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        id='admin-form'
                        onSubmit={form.handleSubmit((values) => {
                            // Reconstruct the permissions array safely to ensure `module` ID is always present
                            // even if react-hook-form stripped it out due to being unregistered visually
                            const safePermissions = modules.map((m, idx) => ({
                                module: m._id,
                                actions: values.permissions?.[idx]?.actions || []
                            }))
                            onSubmit({
                                ...values,
                                permissions: safePermissions
                            })
                        }, (errors) => {
                            console.log("Form errors:", errors)
                        })}
                        className='space-y-8'
                    >
                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='nombre'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Juan' {...field}/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='apellidos'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apellidos</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Pérez' {...field}  />
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
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder='juan.perez@ejemplo.com' {...field}  />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Permissions table */}
                        <div className='space-y-1'>
                            <h3 className='text-base font-medium'>Permisos por Módulo</h3>
                            <p className='text-sm text-muted-foreground mb-4'>
                                Selecciona las acciones permitidas para cada módulo.
                            </p>

                            <div className='rounded-md border'>
                                {/* Groups */}
                                {Array.from(new Set(modules.map(m => m.padre || 'Generales'))).map((group) => {
                                    const groupModules = modules.filter(m => (m.padre || 'Generales') === group)
                                    if (groupModules.length === 0) return null

                                    // Render all modules in this group. They are all considered roots now.
                                    return (
                                        <div key={group}>
                                            {/* Group header */}
                                            <div className='px-3 py-1.5 bg-muted/30 border-b'>
                                                <span className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
                                                    {group}
                                                </span>
                                            </div>

                                            <div className='px-3'>
                                                {groupModules.map((root) => {
                                                    return (
                                                        <div key={root._id}>
                                                            {renderModuleRow(root, false)}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className='flex justify-end space-x-2 pt-4 border-t'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => navigate({ to: '/users' })}
                            >
                                Cancelar
                            </Button>
                            <Button type='submit' disabled={isLoading}>
                                {isEdit ? 'Guardar Cambios' : 'Crear Administrador'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
