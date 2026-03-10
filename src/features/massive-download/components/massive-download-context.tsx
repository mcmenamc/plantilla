import { createContext, useContext, useState, ReactNode } from 'react'
import { MassiveDownload } from '../data/massive-download-api'

type MassiveDownloadContextType = {
    open: boolean
    setOpen: (open: boolean) => void
    currentRow: MassiveDownload | null
    setCurrentRow: (row: MassiveDownload | null) => void
}

const MassiveDownloadContext = createContext<MassiveDownloadContextType | undefined>(undefined)

export function MassiveDownloadProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false)
    const [currentRow, setCurrentRow] = useState<MassiveDownload | null>(null)

    return (
        <MassiveDownloadContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </MassiveDownloadContext.Provider>
    )
}

export function useMassiveDownload() {
    const context = useContext(MassiveDownloadContext)
    if (!context) {
        throw new Error('useMassiveDownload must be used within a MassiveDownloadProvider')
    }
    return context
}
