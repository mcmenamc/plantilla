import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
    apellidos: z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres.'),
    correo: z.string().email('Introduce un correo electrónico válido.'),
    terms: z.boolean().refine((val) => val === true, {
        message: 'Debes aceptar los términos y condiciones.',
    }),
})

type PruebaGratisForm = z.infer<typeof formSchema>

export function PruebaGratis() {
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [submittedEmail, setSubmittedEmail] = useState('')
    const form = useForm<PruebaGratisForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: '',
            apellidos: '',
            correo: '',
            terms: false,
        },
    })

    const { mutate, isPending } = useMutation({
        mutationFn: async (values: PruebaGratisForm) => {
            const response = await api.post('/auth', values)
            return response.data
        },
        onSuccess: (data) => {
            const email = form.getValues('correo')
            toast.success(data.message || '¡Cuenta creada con éxito!')
            setSubmittedEmail(email)
            setIsSubmitted(true)
            form.reset()
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Error interno'
            toast.error(message)
        },
    })

    const onSubmit = (values: PruebaGratisForm) => {
        mutate(values)
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50'>
            {/* Main Content */}
            <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16'>
                <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
                    {/* Left Side - Marketing Content */}
                    <div className='space-y-8'>
                        <div className='space-y-4'>
                            <div className='inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold'>
                                🎁 Oferta de Lanzamiento
                            </div>
                            <h2 className='text-4xl sm:text-5xl font-bold text-gray-900 leading-tight text-balance'>
                                Regístrate gratis y recibe
                                <span className='text-primary'>{' '}10 timbres de regalo</span>
                            </h2>
                            <p className='text-xl text-gray-600 leading-relaxed'>
                                Empieza a facturar de manera profesional sin costo inicial.
                                Obtén 10 timbres fiscales completamente gratis para comenzar tu
                                negocio.
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className='grid sm:grid-cols-2 gap-6'>
                            <div className='flex gap-4'>
                                <div className='flex-shrink-0'>
                                    <div className='w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center'>
                                        <svg
                                            className='w-6 h-6 text-primary'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h3 className='font-semibold text-gray-900 mb-1'>
                                        100% Legal
                                    </h3>
                                    <p className='text-sm text-gray-600'>
                                        Facturas con validez fiscal ante el SAT
                                    </p>
                                </div>
                            </div>

                            <div className='flex gap-4'>
                                <div className='flex-shrink-0'>
                                    <div className='w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center'>
                                        <svg
                                            className='w-6 h-6 text-primary'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M13 10V3L4 14h7v7l9-11h-7z'
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h3 className='font-semibold text-gray-900 mb-1'>
                                        Súper Rápido
                                    </h3>
                                    <p className='text-sm text-gray-600'>
                                        Genera tus facturas en menos de 30 segundos
                                    </p>
                                </div>
                            </div>

                            <div className='flex gap-4'>
                                <div className='flex-shrink-0'>
                                    <div className='w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center'>
                                        <svg
                                            className='w-6 h-6 text-primary'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h3 className='font-semibold text-gray-900 mb-1'>Seguro</h3>
                                    <p className='text-sm text-gray-600'>
                                        Tus datos protegidos con encriptación
                                    </p>
                                </div>
                            </div>

                            <div className='flex gap-4'>
                                <div className='flex-shrink-0'>
                                    <div className='w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center'>
                                        <svg
                                            className='w-6 h-6 text-primary'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z'
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h3 className='font-semibold text-gray-900 mb-1'>
                                        En la Nube
                                    </h3>
                                    <p className='text-sm text-gray-600'>
                                        Accede desde cualquier dispositivo
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className='flex flex-wrap gap-6 items-center pt-4 border-t border-gray-200'>
                            <div className='flex items-center gap-2'>
                                <svg
                                    className='w-5 h-5 text-green-500'
                                    fill='currentColor'
                                    viewBox='0 0 20 20'
                                >
                                    <path
                                        fillRule='evenodd'
                                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                                <span className='text-sm font-medium text-gray-700'>
                                    +1,000 empresas confían en nosotros
                                </span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <svg
                                    className='w-5 h-5 text-primary'
                                    fill='currentColor'
                                    viewBox='0 0 20 20'
                                >
                                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                </svg>
                                <span className='text-sm font-medium text-gray-700'>
                                    4.9/5 en reseñas
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Registration Form or Success View */}
                    <div className='lg:pl-8'>
                        <div className='bg-white rounded-2xl shadow-xl border border-orange-100 p-8 lg:p-10'>
                            {!isSubmitted ? (
                                <>
                                    <div className='mb-8'>
                                        <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                                            Crea tu cuenta gratis
                                        </h3>
                                        <p className='text-gray-600'>
                                            Solo te tomará un minuto y podrás empezar a facturar
                                        </p>
                                    </div>

                                    <Form {...form}>
                                        <form
                                            onSubmit={form.handleSubmit(onSubmit)}
                                            className='space-y-6'
                                        >
                                            <FormField
                                                control={form.control}
                                                name='nombre'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className='text-gray-700'>
                                                            Nombre(s)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder='Ej: Juan Carlos'
                                                                className='h-12'
                                                                {...field}
                                                            />
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
                                                        <FormLabel className='text-gray-700'>
                                                            Apellidos
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder='Ej: García López'
                                                                className='h-12'
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name='correo'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className='text-gray-700'>
                                                            Correo electrónico
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type='email'
                                                                placeholder='tu@email.com'
                                                                className='h-12'
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name='terms'
                                                render={({ field }) => (
                                                    <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md p-2 shadow-none'>
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <div className='space-y-1 leading-none'>
                                                            <FormLabel className='text-sm text-gray-600 font-normal'>
                                                                <span>
                                                                    Acepto los{' '}
                                                                    <a
                                                                        href='#'
                                                                        className='text-primary hover:underline font-medium'
                                                                    >
                                                                        términos y condiciones
                                                                    </a>{' '}
                                                                    y la{' '}
                                                                    <a
                                                                        href='#'
                                                                        className='text-primary hover:underline font-medium'
                                                                    >
                                                                        política de privacidad
                                                                    </a>
                                                                </span>
                                                            </FormLabel>
                                                            <FormMessage />
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />

                                            <Button
                                                type='submit'
                                                disabled={isPending}
                                                className='w-full bg-gradient-to-r from-primary to-orange-600 text-white font-semibold py-4 px-6 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 h-auto text-lg'
                                            >
                                                {isPending ? 'Procesando...' : 'Crear cuenta y obtener 10 timbres gratis'}
                                            </Button>

                                            <p className='text-xs text-center text-gray-500 mt-4'>
                                                🔒 Tus datos están protegidos y nunca los compartiremos con
                                                terceros
                                            </p>
                                        </form>
                                    </Form>
                                </>
                            ) : (
                                <div className='text-center py-8 space-y-6'>
                                    <div className='flex justify-center'>
                                        <div className='bg-green-100 p-4 rounded-full'>
                                            <CheckCircle2 className='w-16 h-16 text-green-600' />
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <h3 className='text-3xl font-bold text-gray-900'>
                                            ¡Casi listo!
                                        </h3>
                                        <p className='text-lg text-gray-600'>
                                            Hemos enviado un correo de verificación a:
                                        </p>
                                        <p className='text-xl font-bold text-primary break-all'>
                                            {submittedEmail}
                                        </p>
                                    </div>
                                    <div className='bg-orange-50 p-6 rounded-xl border border-orange-100 flex items-start gap-4 text-left'>
                                        <Mail className='w-6 h-6 text-orange-500 mt-1 flex-shrink-0' />
                                        <div className='space-y-2'>
                                            <p className='font-semibold text-gray-900'>
                                                Siguiente paso:
                                            </p>
                                            <p className='text-sm text-gray-600 leading-relaxed'>
                                                Haz clic en el enlace que te enviamos para activar tu cuenta y empezar a disfrutar tus 10 timbres gratis.
                                            </p>
                                            <p className='text-xs text-gray-500 italic'>
                                                ¿No ves el correo? Revisa tu carpeta de spam o correo no deseado.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => setIsSubmitted(false)}
                                        variant='outline'
                                        className='text-gray-500 hover:text-primary transition-colors'
                                    >
                                        ¿Te equivocaste de correo? Editar datos
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className='mt-20 pt-16 border-t border-gray-200'>
                    <div className='text-center mb-12'>
                        <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                            ¿Qué incluye tu registro gratuito?
                        </h2>
                        <p className='text-lg text-gray-600'>
                            Todo lo que necesitas para facturar profesionalmente
                        </p>
                    </div>

                    <div className='grid md:grid-cols-3 gap-8'>
                        <div className='text-center'>
                            <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <svg
                                    className='w-8 h-8 text-primary'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                                    />
                                </svg>
                            </div>
                            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                                10 Timbres Fiscales
                            </h3>
                            <p className='text-gray-600'>
                                Facturas válidas ante el SAT desde el primer momento. Sin letras
                                pequeñas ni cargos ocultos.
                            </p>
                        </div>

                        <div className='text-center'>
                            <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <svg
                                    className='w-8 h-8 text-primary'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
                                    />
                                </svg>
                            </div>
                            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                                Panel de Control
                            </h3>
                            <p className='text-gray-600'>
                                Administra todas tus facturas desde un solo lugar. Intuitivo y
                                fácil de usar.
                            </p>
                        </div>

                        <div className='text-center'>
                            <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <svg
                                    className='w-8 h-8 text-primary'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z'
                                    />
                                </svg>
                            </div>
                            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                                Soporte Técnico
                            </h3>
                            <p className='text-gray-600'>
                                Equipo de expertos listo para ayudarte cuando lo necesites. Por
                                chat, email o teléfono.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
