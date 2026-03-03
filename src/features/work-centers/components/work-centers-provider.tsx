import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type WorkCenter } from '../data/schema'

type WorkCentersDialogType = 'add' | 'edit' | 'delete' | 'upload-cert' | 'confirm-upload' | 'upload-logo' | 'preview-logo' | 'upload-opinion'

type WorkCentersContextType = {
    open: WorkCentersDialogType | null
    setOpen: (str: WorkCentersDialogType | null) => void
    currentRow: WorkCenter | null
    setCurrentRow: React.Dispatch<React.SetStateAction<WorkCenter | null>>
}

const WorkCentersContext = React.createContext<WorkCentersContextType | null>(null)

export function WorkCentersProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useDialogState<WorkCentersDialogType>(null)
    const [currentRow, setCurrentRow] = useState<WorkCenter | null>(null)

    return (
        <WorkCentersContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </WorkCentersContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWorkCenters = () => {
    const context = React.useContext(WorkCentersContext)

    if (!context) {
        throw new Error('useWorkCenters has to be used within <WorkCentersProvider>')
    }

    return context
}
