import { Button } from "@/components/ui/button"

interface TimbresPackageCardProps {
  title: string
  timbres: number
  price: number
  isLoading?: boolean
  onSelect: (timbres: number) => void
  highlighted?: boolean
  discountLabel?: string
}

export function TimbresPackageCard({
  title,
  timbres,
  price,
  isLoading,
  onSelect,
  highlighted = false,
  discountLabel
}: TimbresPackageCardProps) {
  const pricePerTimbre = (price / timbres).toFixed(2);
  const originalPrice = timbres * 10;
  const hasDiscount = price < originalPrice;

  return (
    <div 
      onClick={() => !isLoading && onSelect(timbres)}
      className={`
        relative group cursor-pointer flex flex-col p-3.5 md:p-6 rounded-2xl md:rounded-3xl transition-all duration-500
        ${highlighted 
          ? 'bg-primary/[0.03] dark:bg-primary/[0.08] lg:scale-105 z-10 border-2 border-primary shadow-xl shadow-primary/10' 
          : 'bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-primary/30 transition-shadow hover:shadow-lg'
        }
      `}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-green-500/10 whitespace-nowrap z-20">
          {discountLabel}
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-0.5 md:space-y-1 mb-3 md:mb-5">
        <h3 className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest ${highlighted ? 'text-primary' : 'text-zinc-500'}`}>
          {title}
        </h3>
        <div className="flex flex-col items-center">
          <span className="text-3xl md:text-4xl font-black tracking-tight tabular-nums text-zinc-900 dark:text-zinc-100 leading-none">
            {timbres}
          </span>
          <span className="text-[8px] md:text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
            Timbres
          </span>
        </div>
      </div>

      {/* Pricing Block */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-2 md:space-y-4 py-3 md:py-4 border-y border-zinc-100 dark:border-zinc-800/50">
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-0.5 md:gap-1 leading-none">
            <span className="text-xl md:text-2xl font-black tabular-nums text-zinc-900 dark:text-zinc-100">${price.toLocaleString()}</span>
            <span className="text-[8px] md:text-[10px] font-bold text-zinc-500 uppercase ml-0.5">mxn</span>
          </div>
          <p className="text-[8px] md:text-[9px] font-bold text-primary mt-1 uppercase tracking-tight">
            ${pricePerTimbre} x folio
          </p>
        </div>

        {hasDiscount && (
          <div className="flex flex-col items-center">
            <span className="text-[8px] md:text-[10px] text-zinc-300 dark:text-zinc-600 line-through decoration-1 font-bold leading-none">
              ${originalPrice.toLocaleString()}
            </span>
            <p className="text-[8px] md:text-[10px] font-black text-green-600 dark:text-green-500 uppercase mt-1">
              -{Math.round((1 - price/originalPrice)*100)}%
            </p>
          </div>
        )}
      </div>

      {/* Cta */}
      <div className="mt-4 md:mt-6">
        <Button 
          className={`
            w-full h-8 md:h-10 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-bold uppercase transition-all
            ${highlighted 
              ? 'bg-primary text-white shadow-lg shadow-primary/20 group-hover:bg-primary/90' 
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }
          `}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-3 h-3 md:w-3.5 md:h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Elegir'
          )}
        </Button>
      </div>
      
      {/* Decorative Glow */}
      <div className={`
        absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none
        ${highlighted 
          ? 'shadow-[inset_0_0_20px_rgba(249,115,22,0.02)]' 
          : 'shadow-[inset_0_0_20px_rgba(0,0,0,0.01)]'
        }
      `}></div>
    </div>
  )
}
