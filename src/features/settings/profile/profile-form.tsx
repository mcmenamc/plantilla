import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { actualizarPerfil } from '../data/settings-api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState } from 'react'

const profileFormSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(30, 'El nombre debe tener menos de 30 caracteres.'),
  apellidos: z
    .string()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres.')
    .max(30, 'Los apellidos deben tener menos de 30 caracteres.'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres.')
    .or(z.literal(''))
    .optional(),
  imagen: z.any().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const queryClient = useQueryClient()
  const { auth: { user } } = useAuthStore()
  const [preview, setPreview] = useState<string | null>(user?.imagen || null)

  const defaultValues: Partial<ProfileFormValues> = {
    nombre: user?.nombre || '',
    apellidos: user?.apellidos || '',
    password: '',
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  const { mutate, isPending } = useMutation({
    mutationFn: actualizarPerfil,
    onSuccess: (data) => {
      toast.success(data.message || 'Perfil actualizado con éxito')
      queryClient.invalidateQueries({ queryKey: ['user-data'] })
      form.reset({ ...form.getValues(), password: '' })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el perfil')
    },
  })

  function onSubmit(data: ProfileFormValues) {
    const formData = new FormData()
    formData.append('nombre', data.nombre)
    formData.append('apellidos', data.apellidos)
    if (data.password && data.password.trim() !== '') {
      formData.append('password', data.password)
    }

    // El campo imagen del schema puede contener el File del input
    const imageFile = form.getValues('imagen')
    if (imageFile instanceof File) {
      formData.append('imagen', imageFile)
    }

    mutate(formData)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño (500KB)
      if (file.size > 500 * 1024) {
        toast.error('La imagen no debe superar los 500KB')
        return
      }

      form.setValue('imagen', file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8'
      >
        <div className='flex flex-col items-center gap-6 md:flex-row'>
          <Avatar className='h-24 w-24'>
            <AvatarImage src={preview || ''} className='object-cover' />
            <AvatarFallback className='text-2xl bg-muted'>
              {user?.nombre?.[0]}{user?.apellidos?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 space-y-2'>
            <FormLabel>Imagen de Perfil</FormLabel>
            <Input
              type='file'
              accept='image/*'
              onChange={handleImageChange}
              className='cursor-pointer'
            />
            <p className='text-[0.8rem] text-muted-foreground'>
              Sube una foto cuadrada (JPG o PNG). Máximo 500KB.
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='nombre'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre <span className='text-red-500'>*</span></FormLabel>
                <FormControl>
                  <Input placeholder='Tu nombre' {...field} />
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
                <FormLabel>Apellidos <span className='text-red-500'>*</span></FormLabel>
                <FormControl>
                  <Input placeholder='Tus apellidos' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type='password' placeholder='********' {...field} />
              </FormControl>
              <FormDescription>
                Deja este campo en blanco si no deseas cambiar tu contraseña.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={isPending} className='w-full md:w-auto'>
          {isPending ? 'Guardando...' : 'Actualizar perfil'}
        </Button>
      </form>
    </Form>
  )
}
