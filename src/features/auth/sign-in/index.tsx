import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearch, useNavigate, Link } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { Loader2, LogIn, Mail, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
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
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  correo: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type SignInForm = z.infer<typeof formSchema>

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignInForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      correo: '',
      password: '',
    },
  })

  const { mutate } = useMutation({
    mutationFn: async (values: SignInForm) => {
      const response = await api.post('/auth/login', values)
      return response.data
    },
    onSuccess: (data) => {
      console.log(data)
      const mockUser = {
        id: data.usuario._id,
        nombre: data.usuario.nombre,
        apellidos: data.usuario.apellidos,
        email: data.usuario.email,
        imagen: data.usuario.imagen,
        business: data.usuario.business,
        workcenter: data.usuario.workcenter,
        role: data.usuario.role,
        exp: Date.now() + 24 * 60 * 60 * 1000,
      }

      auth.setUser(mockUser)
      auth.setAccessToken(data.token)

      toast.success(data.message || '¡Bienvenido de nuevo!')

      const targetPath = redirect || '/'
      navigate({ to: targetPath, replace: true })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al iniciar sesión'
      toast.error(message)
      setIsLoading(false)
    },
  })

  function onSubmit(data: SignInForm) {
    setIsLoading(true)
    mutate(data)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-100/40 via-white to-orange-100/40 dark:from-orange-950/20 dark:via-background dark:to-orange-950/20 flex items-center justify-center p-6 font-sans'>
      <div className='w-full max-w-md space-y-8'>
        {/* Logo/Brand */}
        <div className='text-center space-y-2'>
          <div className='flex justify-center mb-2'>
            <img
              src='/logo/logo%20transparente.png'
              alt='Haz Factura'
              className='w-32 h-32 object-contain drop-shadow-sm dark:hidden'
            />
            <img
              src='/logo/logo-light.png'
              alt='Haz Factura'
              className='w-32 h-32 object-contain drop-shadow-sm hidden dark:block'
            />
          </div>
          <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100'>Inicia sesión</h1>
          <p className='text-gray-500 dark:text-gray-400 text-sm'>
            Accede a tu panel de facturación electrónica
          </p>
        </div>


        <div className='bg-white dark:bg-card rounded-2xl shadow-xl shadow-orange-100/20 dark:shadow-orange-950/20 p-8 border border-gray-100 dark:border-border ring-1 ring-gray-100/50 dark:ring-border/50 backdrop-blur-xl'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='correo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>Correo electrónico</FormLabel>
                    <FormControl>
                      <div className='relative group'>
                        <Input
                          placeholder='tu@empresa.com'
                          className='h-12 pl-11 bg-gray-50/50 dark:bg-muted/50 border-gray-200 dark:border-border focus:bg-white dark:focus:bg-muted focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all duration-200 rounded-xl'
                          {...field}
                        />
                        <Mail className='w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-orange-500 transition-colors' />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center justify-between mb-2'>
                      <FormLabel className='text-gray-700 dark:text-gray-300 font-medium'>Contraseña</FormLabel>
                      <Link
                        to='/forgot-password'
                        className='text-sm text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 font-medium transition-colors hover:underline underline-offset-4'
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <FormControl>
                      <PasswordInput
                        placeholder='••••••••'
                        className='h-12 bg-gray-50/50 dark:bg-muted/50 border-gray-200 dark:border-border focus:bg-white dark:focus:bg-muted focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all duration-200 rounded-xl'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remember me - Mock implementation */}
              <div className='flex items-center gap-3'>
                <div className="flex h-6 items-center">
                  <input
                    type='checkbox'
                    id='remember'
                    className='h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500/20 dark:bg-muted'
                  />
                </div>
                <label htmlFor='remember' className='text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none'>
                  Mantener sesión iniciada
                </label>
              </div>

              <Button
                type='submit'
                disabled={isLoading}
                className='w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold h-12 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200'
              >
                {isLoading ? (
                  <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                ) : (
                  <LogIn className='mr-2 h-5 w-5' />
                )}
                Iniciar sesión
              </Button>
            </form>
          </Form>

          {/* Register Link */}
          <div className='mt-8 pt-6 border-t border-gray-100 dark:border-border text-center'>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>
              ¿Aún no tienes cuenta?{' '}
              <Link
                to='/prueba-gratis'
                className='text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 font-semibold transition-colors hover:underline underline-offset-4'
              >
                Comienza tu prueba gratis
              </Link>
            </p>
          </div>
        </div>

        {/* Security Note */}
        {/* <div className='flex justify-center'>
          <div className='inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100/50 dark:border-border/50 shadow-sm'>
            <ShieldCheck className='w-4 h-4 text-green-600 dark:text-green-500' />
            <span>Encriptación de 256-bits activada</span>
          </div>
        </div> */}
      </div>
    </div>
  )
}
