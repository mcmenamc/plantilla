import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Quote } from '../data/schema'

type QuotesDialogType = 'add' | 'edit' | 'delete'

type QuotesContextType = {
    open: QuotesDialogType | null
    setOpen: (str: QuotesDialogType | null) => void
    currentRow: Quote | null
    setCurrentRow: React.Dispatch<React.SetStateAction<Quote | null>>
}

const QuotesContext = React.createContext<QuotesContextType | null>(null)

export function QuotesProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useDialogState<QuotesDialogType>(null)
    const [currentRow, setCurrentRow] = useState<Quote | null>(null)

    return (
        <QuotesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </QuotesContext>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useQuotes = () => {
    const quotesContext = React.useContext(QuotesContext)

    if (!quotesContext) {
        throw new Error('useQuotes has to be used within <QuotesContext>')
    }

    return quotesContext
}
