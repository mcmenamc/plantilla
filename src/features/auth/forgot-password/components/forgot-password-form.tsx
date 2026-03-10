import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Loader2 } from 'lucide-react'
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
        className={cn('grid gap-2', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input placeholder='nombre@ejemplo.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          Continuar
          {isLoading ? (
            <Loader2 className='ml-2 h-4 w-4 animate-spin' />
          ) : (
            <ArrowRight className='ml-2 h-4 w-4' />
          )}
        </Button>
      </form>
    </Form>
  )
}

