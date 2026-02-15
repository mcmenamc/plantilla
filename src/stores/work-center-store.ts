import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WorkCenterStore {
    selectedWorkCenterId: string | null
    setSelectedWorkCenterId: (id: string | null) => void
}

export const useWorkCenterStore = create<WorkCenterStore>()(
    persist(
        (set) => ({
            selectedWorkCenterId: null,
            setSelectedWorkCenterId: (id) => set({ selectedWorkCenterId: id }),
        }),
        {
            name: 'work-center-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
