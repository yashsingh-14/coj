import { create } from 'zustand';

type AppMode = 'EXPERIENCE' | 'UTILITY';

interface AppState {
    mode: AppMode;
    setMode: (mode: AppMode) => void;
    isTransitioning: boolean;
    setIsTransitioning: (state: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    mode: 'EXPERIENCE', // Default valid state, but logic will control this
    setMode: (mode) => set({ mode }),
    isTransitioning: false,
    setIsTransitioning: (isTransitioning) => set({ isTransitioning }),
}));
