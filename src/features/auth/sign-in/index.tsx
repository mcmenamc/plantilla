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
    <div className='min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-6'>
      <div className='w-full max-w-md'>
        {/* Logo/Brand */}
        <div className='mb-8 text-center'>
          <div className='inline-flex items-center gap-2 mb-6'>
            <div className='w-12 h-12 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center shadow-lg'>
              <ShieldCheck className='w-7 h-7 text-white' />
            </div>
            <span className='text-2xl font-bold text-gray-900'>Haz Factura</span>
          </div>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Inicia sesión</h1>
          <p className='text-gray-600'>Accede a tu panel de facturación</p>
        </div>

        <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
              <FormField
                control={form.control}
                name='correo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>Correo electrónico</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          placeholder='tu@correo.com'
                          className='h-12 pl-11 focus-visible:ring-primary'
                          {...field}
                        />
                        <Mail className='w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2' />
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
                      <FormLabel className='text-gray-700'>Contraseña</FormLabel>
                      <Link
                        to='/forgot-password'
                        className='text-sm text-primary hover:text-orange-600 font-medium transition-colors'
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <FormControl>
                      <PasswordInput
                        placeholder='Tu contraseña'
                        className='h-12 focus-visible:ring-primary'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remember me - Mock implementation as it's not handled by backend yet */}
              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id='remember'
                  className='w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary'
                />
                <label htmlFor='remember' className='text-sm text-gray-700 cursor-pointer'>
                  Mantener sesión iniciada
                </label>
              </div>

              <Button
                type='submit'
                disabled={isLoading}
                className='w-full bg-gradient-to-r from-primary to-orange-600 text-white font-semibold h-auto text-lg rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all duration-200'
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
          <div className='mt-6 pt-6 border-t border-gray-200 text-center'>
            <p className='text-gray-600'>
              ¿No tienes una cuenta?{' '}
              <Link
                to='/prueba-gratis'
                className='text-primary hover:text-orange-600 font-semibold transition-colors'
              >
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className='mt-6'>
          <div className='flex items-start gap-3 text-sm text-gray-600 bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-gray-100'>
            <ShieldCheck className='w-5 h-5 text-primary flex-shrink-0 mt-0.5' />
            <p>Tu información está protegida con encriptación de nivel bancario.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
