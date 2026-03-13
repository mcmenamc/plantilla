import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import {
  Zap,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Users,
  Building2,
  Headphones,
  CheckCircle2,
  Stamp
} from 'lucide-react'
import {
  crearIntentoPago,
} from './data/timbres-api'
import { TimbresPackageCard } from './components/timbres-package-card'
import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Search } from '@/components/search'
import { StripeCheckoutForm } from './components/stripe-checkout-form'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { Main } from '@/components/layout/main'
import { useTheme } from '@/context/theme-provider'

// stripePromise now managed inside TimbresPage for lazy loading

// Packages are now fetched from the backend

const GLOBAL_BENEFITS = [
  { icon: Clock, title: 'Vigencia ilimitada', desc: 'Tus timbres nunca caducan' },
  { icon: Zap, title: 'Emisión inmediata', desc: 'Timbres disponibles al instante' },
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
  const [paymentStatus, setPaymentStatus] = useState<'succeeded' | 'processing' | 'requires_action' | null>(null)
  const [isSuccessScreen, setIsSuccessScreen] = useState(false)

  // Handle success from a redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const pi = urlParams.get('payment_intent')
    if (urlParams.get('success') === 'true') {
      setIsSuccessScreen(true)
      setPaymentStatus('succeeded')
      
      if (pi) {
        verifyAndFetch(pi)
      } else {
        queryClient.invalidateQueries({ queryKey: ['business-data'] })
      }
      
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [queryClient])

  // Función para re-intentar fetch hasta que el webhook termine
  const verifyAndFetch = async (paymentIntentId: string) => {
    let attempts = 0
    const maxAttempts = 8 // ~16 segundos de espera max
    
    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await api.post('/pagos/confirm-payment', { paymentIntentId })
        if (res.data.acreditado) {
          queryClient.invalidateQueries({ queryKey: ['business-data'] })
          clearInterval(interval)
        }
      } catch (e) {
        console.error("Error verificando pago:", e)
      }
      
      if (attempts >= maxAttempts) clearInterval(interval)
    }, 2000)
  }

  // Business info for balance
  const { theme } = useTheme()
  const { data: businessData, isLoading: isLoadingBusiness } = useQuery({
    queryKey: ['business-data'],
    queryFn: async () => {
      const response = await api.get('/business/data-business')
      return response.data
    },
  })

  // Invalidar y refrescar datos CADA VEZ que el estado Success cambie
  // Aunque ahora lo hacemos de forma más granulada arriba
  useEffect(() => {
    if (isSuccessScreen) {
      queryClient.invalidateQueries({ queryKey: ['business-data'] })
    }
  }, [isSuccessScreen, queryClient])

  const { data: packagesData, isLoading: isLoadingPackages } = useQuery({
    queryKey: ['packages-data'],
    queryFn: async () => {
      const response = await api.get('/package')
      // Sort by timbres so they remain in the correct ascending order
      return response.data.sort((a: any, b: any) => a.timbres - b.timbres)
    }
  })

  const [stripePromise, setStripePromise] = useState<any>(null)

  const mutation = useMutation({
    mutationFn: crearIntentoPago,
    onSuccess: (data, variables) => {
      const selectedPkg = packagesData?.find((p: any) => p.timbres === variables)
      const amount = selectedPkg ? selectedPkg.price * 100 : 0

      // Inicializar Stripe solo en este punto
      const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      setStripePromise(loadStripe(key))

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

  const handlePaymentSuccess = (status: 'succeeded' | 'processing' | 'requires_action', pi?: string) => {
    setPaymentStatus(status)
    setIsSuccessScreen(true)
    // Limpiar Stripe al terminar
    setStripePromise(null)

    if (pi) {
      verifyAndFetch(pi)
    } else {
      queryClient.invalidateQueries({ queryKey: ['business-data'] })
    }
  }

  const handleReturnToPackages = () => {
    setIsSuccessScreen(false)
    setShowCheckout(false)
    setCheckoutData(null)
    setPaymentStatus(null)
    // "Matar" el proceso de Stripe al salir del método de pago
    setStripePromise(null)
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
            {!showCheckout && !isSuccessScreen && (
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-zinc-200 dark:border-zinc-800/60 pb-6 mt-1">
                <div className="space-y-1.5 max-w-2xl">
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Stamp className="w-5 h-5 text-primary" />
                    </div>
                    Comprar <span className="text-primary italic font-extrabold tracking-tighter">Timbres</span>
                  </h1>
                  <p className="text-xs md:text-sm text-zinc-500 font-medium leading-relaxed max-w-xl">
                    Adquiere timbres con vigencia ilimitada y soporte premium incluido.
                  </p>
                </div>

                <div className="w-full lg:w-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm group transition-all duration-500">
                  <div className="bg-primary/10 dark:bg-primary/20 p-2.5 rounded-xl group-hover:bg-primary transition-colors">
                    <Stamp className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Timbres Disponibles</p>
                    <p className="text-xl md:text-2xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100 leading-none">
                      {isLoadingBusiness ? '...' : (businessData?.timbresDisponibles ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              {isSuccessScreen ? (
                <div className="animate-in zoom-in-75 fade-in duration-700 w-full max-w-4xl mx-auto py-10 md:py-20">
                  <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-3xl border border-white/50 dark:border-zinc-800/50 p-8 md:p-16 rounded-[2.5rem] shadow-2xl text-center flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[100px] opacity-70 animate-pulse pointer-events-none"></div>
                    
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-8 relative group">
                      <div className="absolute inset-0 bg-green-500 animate-ping opacity-20 rounded-full"></div>
                      <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-green-500 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 mb-4 relative z-10">
                      {paymentStatus === 'succeeded' ? '¡Pago Completado!' : '¡Referencia Generada!'}
                    </h2>
                    
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-10 max-w-md mx-auto text-sm md:text-base leading-relaxed relative z-10">
                      {paymentStatus === 'succeeded' 
                        ? 'Tus folios se acreditarán en unos momentos tras la confirmación de nuestro sistema seguro.'
                        : 'Tu orden ha sido registrada. Una vez que realices el pago en OXXO o vía Transferencia, tus timbres se activarán automáticamente mediante el sistema de Stripe.'
                      }
                    </p>
                    
                    <div className="w-full flex flex-col sm:flex-row items-stretch justify-center gap-4 mb-10 relative z-10">
                      <div className="bg-white dark:bg-zinc-950 w-full sm:w-auto px-6 md:px-10 py-5 md:py-8 rounded-[1.5rem] md:rounded-[2rem] border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center items-center shadow-sm">
                         <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Timbres Solicitados</span>
                         <span className="text-4xl md:text-5xl font-black text-primary tabular-nums">{(checkoutData?.timbres || 0).toLocaleString()}</span>
                      </div>
                      <div className="bg-white dark:bg-zinc-950 w-full sm:w-auto px-6 md:px-10 py-5 md:py-8 rounded-[1.5rem] md:rounded-[2rem] border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center items-center shadow-sm">
                         <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Saldo Actual</span>
                         <span className="text-4xl md:text-5xl font-black text-zinc-800 dark:text-zinc-100 tabular-nums">{(isLoadingBusiness ? '...' : (businessData?.timbresDisponibles ?? 0)).toLocaleString()}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleReturnToPackages}
                      className="w-full sm:w-auto px-10 h-14 md:h-16 text-base md:text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 bg-primary text-white relative z-10"
                    >
                      {paymentStatus === 'succeeded' ? 'Volver a Mi Cuenta' : 'Entendido, volver'}
                    </Button>
                  </div>
                </div>
              ) : showCheckout && checkoutData && stripePromise ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full mx-auto">
                  {/* Checkout Header style Image 2 */}
                  <div className="flex items-center gap-4 mb-8">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleReturnToPackages()}
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
                            <span className="font-bold text-zinc-800 dark:text-zinc-200">{packagesData?.find((p: any) => p.timbres === checkoutData.timbres)?.title}</span>
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
                    {isLoadingPackages ? (
                      <div className="col-span-full flex justify-center py-10 text-zinc-500">
                        Cargando paquetes...
                      </div>
                    ) : (
                      packagesData?.map((pkg: any, index: number) => (
                        <TimbresPackageCard
                          key={index}
                          {...pkg}
                          isLoading={mutation.isPending}
                          onSelect={handleSelectPackage}
                        />
                      ))
                    )}
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
