import { useState, useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'sonner'
import { CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import { api } from '@/lib/api'
import { Route } from '@/routes/bienvenido'
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

const passwordSchema = z.string()
  .min(8, 'Al menos 8 caracteres')
  .regex(/[A-Z]/, 'Una letra mayúscula')
  .regex(/[0-9]/, 'Un número')

const formSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type BienvenidoForm = z.infer<typeof formSchema>

interface JWTPayload {
  id: string
  nombre: string
  apellidos: string
  email: string
}

export function Bienvenido() {
  const { token } = Route.useSearch()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const userData = useMemo(() => {
    if (!token) return null
    try {
      return jwtDecode<JWTPayload>(token)
    } catch (e) {
      console.error('Error decoding token:', e)
      return null
    }
  }, [token])

  const form = useForm<BienvenidoForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: BienvenidoForm) => {
      if (!userData?.id) throw new Error('Usuario no identificado')
      const response = await api.post('/user/registro-password', {
        usuario: userData.id,
        password: values.password
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Contraseña actualizada')
      setIsSubmitted(true)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Error interno'
      toast.error(message)
    },
  })

  const onSubmit = (values: BienvenidoForm) => {
    mutate(values)
  }

  if (!userData) {
    return (
      <div className='min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-orange-100/40 via-white to-orange-100/40 dark:from-orange-950/20 dark:via-background dark:to-orange-950/20'>
        <div className='max-w-md w-full text-center space-y-4'>
          <div className='bg-white dark:bg-card p-8 rounded-2xl shadow-xl border border-orange-100 dark:border-border'>
            <h2 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>Acceso inválido</h2>
            <p className='text-gray-600 dark:text-gray-400 mt-4 leading-relaxed'>
              El enlace de activación parece ser incorrecto o ha expirado.
              Por favor, solicita una nueva invitación de registro.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex flex-col lg:flex-row bg-white dark:bg-background'>
      {/* Left Panel - Formulario */}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12'>
        <div className='w-full max-w-md'>
          {/* Logo/Brand */}
          <div className='mb-8'>
            <div className='flex justify-center mb-6'>
              <img
                src='/logo/logo transparente.png'
                alt='Haz Factura'
                className='w-60 object-contain drop-shadow-sm dark:hidden'
              />
              <img
                src='/logo/logo-light.png'
                alt='Haz Factura'
                className='w-32 h-32 object-contain drop-shadow-sm hidden dark:block'
              />
            </div>
            <h1 className='text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2'>Configura tu contraseña</h1>
            <p className='text-gray-600 dark:text-gray-400'>Último paso para activar tu cuenta</p>
          </div>

          {!isSubmitted ? (
            <>
              {/* User Info */}
              <div className='mb-8 pb-6 border-b border-gray-200 dark:border-border'>
                <div className='flex items-start gap-4'>
                  <div className='w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0'>
                    <span className='text-primary font-bold text-lg'>
                      {userData.nombre?.charAt(0)}
                      {userData.apellidos?.charAt(0)}
                    </span>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>Bienvenido</p>
                    <p className='font-semibold text-gray-900 dark:text-gray-100 truncate uppercase'>
                      {userData.nombre} {userData.apellidos}
                    </p>
                    <p className='text-sm text-gray-600 dark:text-gray-400 truncate'>{userData.email}</p>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                          Contraseña
                        </FormLabel>
                        <div className='relative'>
                          <FormControl>
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder='Mínimo 8 caracteres'
                              className='h-12 pr-12 bg-gray-50/50 dark:bg-muted/50 border-gray-200 dark:border-border focus:bg-white dark:focus:bg-muted'
                              {...field}
                            />
                          </FormControl>
                          <button
                            type='button'
                            onClick={() => setShowPassword(!showPassword)}
                            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors'
                          >
                            {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                          Confirmar contraseña
                        </FormLabel>
                        <div className='relative'>
                          <FormControl>
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder='Repite tu contraseña'
                              className='h-12 pr-12 bg-gray-50/50 dark:bg-muted/50 border-gray-200 dark:border-border focus:bg-white dark:focus:bg-muted'
                              {...field}
                            />
                          </FormControl>
                          <button
                            type='button'
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors'
                          >
                            {showConfirmPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-xl p-4 space-y-3'>
                    <p className='text-sm font-medium text-gray-800 dark:text-gray-200'>Requerimientos de seguridad:</p>
                    <ul className='space-y-2'>
                      <li className='flex items-center gap-2 text-sm'>
                        <CheckCircle2 className={`w-4 h-4 ${form.watch('password').length >= 8 ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`} />
                        <span className={form.watch('password').length >= 8 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>Mínimo 8 caracteres</span>
                      </li>
                      <li className='flex items-center gap-2 text-sm'>
                        <CheckCircle2 className={`w-4 h-4 ${/[A-Z]/.test(form.watch('password')) ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`} />
                        <span className={/[A-Z]/.test(form.watch('password')) ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>Una letra mayúscula</span>
                      </li>
                      <li className='flex items-center gap-2 text-sm'>
                        <CheckCircle2 className={`w-4 h-4 ${/[0-9]/.test(form.watch('password')) ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`} />
                        <span className={/[0-9]/.test(form.watch('password')) ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>Un número</span>
                      </li>
                    </ul>
                  </div>

                  <Button
                    type='submit'
                    disabled={isPending}
                    className='w-full bg-gradient-to-r from-primary to-orange-600 text-white font-semibold py-4 h-auto text-lg rounded-xl hover:shadow-lg transition-all duration-200'
                  >
                    {isPending ? 'Activando...' : 'Activar mi cuenta'}
                  </Button>
                </form>
              </Form>
            </>
          ) : (
            <div className='text-center py-8 space-y-6 animate-in fade-in zoom-in duration-300'>
              <div className='flex justify-center'>
                <div className='bg-green-100 p-6 rounded-full'>
                  <ShieldCheck className='w-16 h-16 text-green-600' />
                </div>
              </div>
              <div className='space-y-2'>
                <h2 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>¡Felicidades!</h2>
                <p className='text-lg text-gray-600 dark:text-gray-400 leading-relaxed'>
                  Tu cuenta ha sido activada correctamente. Ahora puedes acceder a todas las funcionalidades de Haz Factura.
                </p>
              </div>
              <Button
                className='w-full text-lg py-6 rounded-xl'
                onClick={() => window.location.href = '/sign-in'}
              >
                Iniciar sesión ahora
              </Button>
            </div>
          )}

          <div className='mt-8 pt-6 border-t border-gray-100 dark:border-border'>
            <div className='flex items-start gap-3 text-sm text-gray-500 dark:text-gray-400'>
              <Lock className='w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0' />
              <p>Tus datos son encriptados y almacenados con los más altos estándares de seguridad.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Visual Panel */}
      <div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-100 via-orange-50 to-white dark:from-orange-950/20 dark:via-background dark:to-orange-950/10 relative overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute top-20 right-20 w-96 h-96 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl'></div>
          <div className='absolute bottom-20 left-20 w-96 h-96 bg-orange-200/30 dark:bg-orange-900/20 rounded-full blur-3xl'></div>
        </div>

        <div className='relative z-10 flex flex-col items-center justify-center p-12'>
          <div className='max-w-lg text-center space-y-12'>
            <div className='space-y-6'>
              <div className='w-20 h-20 bg-white dark:bg-card shadow-xl rounded-2xl flex items-center justify-center mx-auto border border-orange-100 dark:border-border'>
                <ShieldCheck className='w-12 h-12 text-primary' />
              </div>
              <h2 className='text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight'>
                Comienza tu transformación digital
              </h2>
              <p className='text-xl text-gray-600 dark:text-gray-400'>
                Facturación electrónica rápida, sencilla y segura para tu negocio.
              </p>
            </div>

            <div className='grid gap-6 text-left'>
              {[
                { title: 'Facturación instantánea', desc: 'Emite facturas en segundos', icon: Mail },
                { title: 'Gestión completa', desc: 'Organiza todo en un solo lugar', icon: Lock },
                { title: '100% Legal y Seguro', desc: 'Certificado ante el SAT', icon: ShieldCheck },
              ].map((item, i) => (
                <div key={i} className='flex items-start gap-4 bg-white/50 dark:bg-card/50 backdrop-blur-sm p-4 rounded-2xl border border-white dark:border-border'>
                  <div className='w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0'>
                    <item.icon className='w-6 h-6 text-primary' />
                  </div>
                  <div>
                    <h3 className='font-bold text-gray-900 dark:text-gray-100'>{item.title}</h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
