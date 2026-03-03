import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type SeriesRow } from './series-columns'

type SeriesDialogType = 'add' | 'edit' | 'delete'

type SeriesContextType = {
    open: SeriesDialogType | null
    setOpen: (str: SeriesDialogType | null) => void
    currentRow: SeriesRow | null
    setCurrentRow: React.Dispatch<React.SetStateAction<SeriesRow | null>>
}

const SeriesContext = React.createContext<SeriesContextType | null>(null)

export function SeriesProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useDialogState<SeriesDialogType>(null)
    const [currentRow, setCurrentRow] = useState<SeriesRow | null>(null)

    return (
        <SeriesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </SeriesContext>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSeries = () => {
    const seriesContext = React.useContext(SeriesContext)

    if (!seriesContext) {
        throw new Error('useSeries has to be used within <SeriesProvider>')
    }

    return seriesContext
}
