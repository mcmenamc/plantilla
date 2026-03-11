import { Link } from '@tanstack/react-router'
import { ForgotPasswordForm } from './components/forgot-password-form'

export function ForgotPassword() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-100/40 via-white to-orange-100/40 dark:from-orange-950/20 dark:via-background dark:to-orange-950/20 flex items-center justify-center p-6 font-sans'>
      <div className='w-full max-w-md space-y-8'>
        {/* Logo/Brand */}
        <div className='text-center space-y-2'>
          <div className='flex justify-center mb-2'>
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
          <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100'>Recuperar acceso</h1>
          <p className='text-gray-500 dark:text-gray-400 text-sm'>
            Te enviaremos un correo para restablecer tu contraseña
          </p>
        </div>

        <div className='bg-white dark:bg-card rounded-2xl shadow-xl shadow-orange-100/20 dark:shadow-orange-950/20 p-8 border border-gray-100 dark:border-border ring-1 ring-gray-100/50 dark:ring-border/50 backdrop-blur-xl'>
          <ForgotPasswordForm />

          {/* Back to Login Link */}
          <div className='mt-8 pt-6 border-t border-gray-100 dark:border-border text-center'>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>
              ¿Recordaste tu contraseña?{' '}
              <Link
                to='/sign-in'
                className='text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 font-semibold transition-colors hover:underline underline-offset-4'
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

