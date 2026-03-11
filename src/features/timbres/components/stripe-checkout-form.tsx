import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, CreditCard } from 'lucide-react'

interface StripeCheckoutFormProps {
  onSuccess: () => void
  onCancel: () => void
  amount: number
  timbres: number
}

export function StripeCheckoutForm({ onSuccess, amount }: StripeCheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/timbres?success=true`,
      },
      redirect: 'if_required' 
    })

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setErrorMessage(error.message ?? 'Error en los datos de pago.')
      } else {
        setErrorMessage(error.message ?? 'Ocurrió un error inesperado al procesar el pago.')
      }
      setIsProcessing(false)
    } else if (paymentIntent) {
      if (paymentIntent.status === 'succeeded') {
        toast.success('¡Pago completado con éxito!')
        onSuccess()
      } else if (paymentIntent.status === 'requires_action') {
        toast.info('Se ha generado tu referencia de pago. Revisa tu correo.')
        onSuccess()
      } else {
        setIsProcessing(false)
      }
    } else {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="animate-in fade-in duration-500">
      <div className="space-y-5 md:space-y-6">
        {/* Payment Details Container */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2.5 mb-1 md:mb-2">
             <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                <CreditCard className="w-4 h-4 text-primary" />
             </div>
             <div>
                <h4 className="text-base md:text-lg font-bold text-zinc-800 dark:text-zinc-100 tracking-tight leading-none">Método de Pago</h4>
                <p className="text-[8px] md:text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Stripe Secure Payment</p>
             </div>
          </div>
          
          <div className="bg-transparent md:bg-muted/30 dark:md:bg-zinc-900/50 p-2 md:p-5 rounded-none md:rounded-xl border-none md:border md:border-border">
            <PaymentElement 
              options={{
                layout: 'tabs',
              }} 
            />

            {errorMessage && (
              <div className="mt-3 p-2.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-[10px] font-bold uppercase tracking-tight animate-in shake-in">
                {errorMessage}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button 
              type="submit" 
              disabled={!stripe || isProcessing} 
              className="w-full h-11 md:h-12 text-sm md:text-base font-bold shadow-lg shadow-primary/10 transition-all hover:brightness-105 active:scale-[0.99] rounded-lg md:rounded-xl bg-primary text-white"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Procesando...</span>
                </div>
              ) : (
                `Pagar $${(amount / 100).toLocaleString()} MXN`
              )}
            </Button>
            
            <p className="text-center text-[8px] md:text-[9px] text-zinc-400 font-medium px-4 leading-relaxed">
              Al confirmar, tus timbres se acreditarán de <span className="text-primary font-bold">forma inmediata</span>.
            </p>
          </div>
        </div>
      </div>
    </form>
  )
}
