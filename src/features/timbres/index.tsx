import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import {
  Sparkles,
  Zap,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Users,
  Building2,
  Headphones
} from 'lucide-react'
import {
  crearIntentoPago,
} from './data/timbres-api'
import { TimbresPackageCard } from './components/timbres-package-card'
import { StripeCheckoutForm } from './components/stripe-checkout-form'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { useTheme } from '@/context/theme-provider'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const TIMBRE_PACKAGES = [
  {
    title: 'Inicial',
    timbres: 25,
    price: 250,
    description: 'Para pruebas o facturación esporádica.',
    highlighted: false,
    discountLabel: ''
  },
  {
    title: 'Básico',
    timbres: 50,
    price: 475,
    description: 'Ideal para pequeños negocios.',
    highlighted: false,
    discountLabel: '5% ahorro'
  },
  {
    title: 'Profesional',
    timbres: 100,
    price: 900,
    description: 'Nuestra opción más equilibrada.',
    highlighted: true,
    discountLabel: '10% ahorro'
  },
  {
    title: 'Crecimiento',
    timbres: 250,
    price: 2125,
    description: 'Para empresas en expansión.',
    highlighted: false,
    discountLabel: '15% ahorro'
  },
  {
    title: 'Empresarial',
    timbres: 500,
    price: 4000,
    description: 'Máximo ahorro para alto volumen.',
    highlighted: false,
    discountLabel: '20% ahorro'
  }
]

const GLOBAL_BENEFITS = [
  { icon: Clock, title: 'Vigencia ilimitada', desc: 'Tus timbres nunca caducan' },
  { icon: Zap, title: 'Emisión inmediata', desc: 'Folios disponibles al instante' },
  { icon: ShieldCheck, title: 'Gerente de cuenta', desc: 'Atención personalizada' },
  { icon: Users, title: 'Multi-usuarios', desc: 'Colabora con tu equipo' },
  { icon: Building2, title: 'Centros ilimitados', desc: 'Gestiona todas tus sucursales' },
  { icon: Headphones, title: 'Soporte técnico', desc: 'Estamos para ayudarte' }
]

export default function TimbresPage() {
  const queryClient = useQueryClient()
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutData, setCheckoutData] = useState<{
    clientSecret: string,
    amount: number,
    timbres: number
  } | null>(null)

  // Handle success from a redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') === 'true') {
      toast.success('¡Pago procesado con éxito!')
      queryClient.invalidateQueries({ queryKey: ['business-data'] })
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [queryClient])

  // Business info for balance
  const { theme } = useTheme()
  const { data: businessData, isLoading: isLoadingBusiness } = useQuery({
    queryKey: ['business-data'],
    queryFn: async () => {
      const response = await api.get('/business/data-business')
      return response.data
    }
  })

  const mutation = useMutation({
    mutationFn: crearIntentoPago,
    onSuccess: (data, variables) => {
      const selectedPkg = TIMBRE_PACKAGES.find(p => p.timbres === variables)
      const amount = selectedPkg ? selectedPkg.price * 100 : 0

      setCheckoutData({
        clientSecret: data.clientSecret,
        amount: amount,
        timbres: variables
      })
      setShowCheckout(true)
    },
    onError: (error: any) => {
      toast.error('Error al iniciar el pago: ' + (error.response?.data?.message || error.message))
    }
  })

  const handleSelectPackage = (timbres: number) => {
    mutation.mutate(timbres)
  }

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['business-data'] })
    setShowCheckout(false)
    setCheckoutData(null)
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-6 px-4 md:px-8 max-w-[1400px] mx-auto w-full'>
        <div className="relative overflow-hidden">
          {/* Dynamic Background Effects */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 pointer-events-none"></div>
          <div className="space-y-6 relative z-10 animate-in fade-in duration-1000">
            {!showCheckout && (
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-zinc-200 dark:border-zinc-800/60 pb-6 mt-1">
                <div className="space-y-1.5 max-w-2xl">
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
                    Comprar <span className="text-primary italic font-extrabold tracking-tighter">Timbres</span>
                  </h1>
                  <p className="text-xs md:text-sm text-zinc-500 font-medium leading-relaxed max-w-xl">
                    Adquiere folios con vigencia ilimitada y soporte premium incluido.
                  </p>
                </div>

                <div className="w-full lg:w-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm group transition-all duration-500">
                  <div className="bg-primary/10 dark:bg-primary/20 p-2.5 rounded-xl group-hover:bg-primary transition-colors">
                    <Sparkles className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Folios Disponibles</p>
                    <p className="text-xl md:text-2xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100 leading-none">
                      {isLoadingBusiness ? '...' : (businessData?.timbresDisponibles ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              {showCheckout && checkoutData ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full mx-auto">
                  {/* Checkout Header style Image 2 */}
                  <div className="flex items-center gap-4 mb-8">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowCheckout(false)}
                      className="h-10 w-10 shrink-0 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      <ArrowLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    </Button>
                    <div className="space-y-0.5">
                      <h1 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">Finalizar Compra</h1>
                      <p className="text-sm text-zinc-500 font-medium">Completa el pago para acreditar tus timbres de manera inmediata.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-6">
                    <div className="lg:col-span-8 space-y-4">
                      <div className="bg-transparent md:bg-card backdrop-blur-3xl border-none md:border md:border-zinc-200 md:dark:border-zinc-800 p-4 md:p-6 rounded-none md:rounded-2xl shadow-none md:shadow-sm">
                        <Elements
                          stripe={stripePromise}
                          options={{
                            clientSecret: checkoutData.clientSecret,
                            appearance: {
                              theme: theme === 'dark' ? 'night' : 'stripe',
                              variables: {
                                colorPrimary: '#f97316',
                                colorBackground: theme === 'dark' ? '#09090b' : '#ffffff',
                                colorText: theme === 'dark' ? '#f4f4f5' : '#18181b',
                                borderRadius: '12px',
                                fontFamily: 'Inter, system-ui, sans-serif',
                              },
                            },
                            locale: 'es',
                          }}
                        >
                          <StripeCheckoutForm
                            amount={checkoutData.amount}
                            timbres={checkoutData.timbres}
                            onSuccess={handlePaymentSuccess}
                            onCancel={() => setShowCheckout(false)}
                          />
                        </Elements>
                      </div>
                    </div>

                    <div className="lg:col-span-4 space-y-3 px-4 md:px-0">
                      <div className="bg-card border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4 shadow-sm">
                        <div className="space-y-0.5">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Resumen de Orden</h4>
                          <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">Detalles de compra</p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-zinc-500">Paquete</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200">{TIMBRE_PACKAGES.find(p => p.timbres === checkoutData.timbres)?.title}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-zinc-500">Cantidad</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200">{checkoutData.timbres} folios</span>
                          </div>
                          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-end">
                            <div className="space-y-0.5">
                              <span className="text-zinc-400 font-bold uppercase text-[9px] tracking-widest">Total a pagar</span>
                              <div className="flex items-baseline gap-1.5">
                                <p className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tighter">${(checkoutData.amount / 100).toLocaleString()}</p>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase">MXN</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { icon: ShieldCheck, text: 'Pago 100% Seguro', detail: 'Encriptación SSL de 256 bits' },
                          { icon: Zap, text: 'Activación Inmediata', detail: 'Tus timbres en segundos' }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm transition-all hover:border-primary/20 group">
                            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary transition-all">
                              <item.icon className="w-4 h-4 text-primary group-hover:text-white transition-all" />
                            </div>
                            <div className="text-left">
                              <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{item.text}</p>
                              <p className="text-[9px] text-zinc-500 font-medium">{item.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  {/* 5-Column Grid Refined - Compact on Mobile */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6 max-w-[1300px] mx-auto">
                    {TIMBRE_PACKAGES.map((pkg, index) => (
                      <TimbresPackageCard
                        key={index}
                        {...pkg}
                        isLoading={mutation.isPending}
                        onSelect={handleSelectPackage}
                      />
                    ))}
                  </div>

                  {/* Global Benefits Section Compacted */}
                  <div className="bg-zinc-50/50 dark:bg-zinc-900/40 rounded-[2.5rem] p-8 lg:p-14 border border-zinc-200 dark:border-zinc-800 relative overflow-hidden group shadow-sm">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/[0.03] dark:bg-primary/5 rounded-full blur-[80px] -mr-48 -mt-48 opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <div className="relative z-10 text-left mb-10 space-y-2">
                      <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-zinc-800 dark:text-zinc-100">
                        Infraestructura <span className="text-primary italic">Premium</span>
                      </h2>
                      <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-xl text-sm md:text-base leading-relaxed">
                        Todas nuestras herramientas están incluidas en cada plan sin costo adicional.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 relative z-10">
                      {GLOBAL_BENEFITS.map((benefit, i) => (
                        <div key={i} className="flex items-start gap-5 group/item underline-offset-4">
                          <div className="shrink-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-2xl shadow-sm group-hover/item:border-primary group-hover/item:text-primary transition-all duration-300">
                            <benefit.icon className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-lg tracking-tight uppercase text-zinc-800 dark:text-zinc-200">{benefit.title}</h4>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-xs leading-relaxed">{benefit.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}
