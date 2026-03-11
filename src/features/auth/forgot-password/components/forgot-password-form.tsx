import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Mail, Send } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
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

const formSchema = z.object({
  email: z.string().email({
    message: 'Ingresa un correo electrónico válido',
  }),
})

type ForgotPasswordFormValues = z.infer<typeof formSchema>

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  const { mutate } = useMutation({
    mutationFn: async (values: ForgotPasswordFormValues) => {
      const response = await api.post('/auth/recovery-password', {
        correo: values.email
      })
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Correo de recuperación enviado con éxito')
      setIsLoading(false)
      form.reset()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al enviar el correo'
      toast.error(message)
      setIsLoading(false)
    },
  })

  function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true)
    mutate(data)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-6', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
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
        <Button
          type='submit'
          disabled={isLoading}
          className='w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold h-12 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200'
        >
          {isLoading ? (
            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
          ) : (
            <Send className='mr-2 h-5 w-5' />
          )}
          Enviar enlace
        </Button>
      </form>
    </Form>
  )
}

