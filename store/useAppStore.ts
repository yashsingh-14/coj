import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AppMode = 'EXPERIENCE' | 'UTILITY';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
}

interface AppState {
    mode: AppMode;
    setMode: (mode: AppMode) => void;
    isTransitioning: boolean;
    setIsTransitioning: (state: boolean) => void;

    // Preferences
    preferences: {
        dataSaver: boolean;
        notifications: boolean;
        audioQuality: boolean; // true = high
    };
    setPreferences: (prefs: Partial<AppState['preferences']>) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            mode: 'EXPERIENCE',
            setMode: (mode) => set({ mode }),
            isTransitioning: false,
            setIsTransitioning: (isTransitioning) => set({ isTransitioning }),

            // Auth Initial State
            currentUser: null,
            isAuthenticated: false,

            // Preferences Initial State
            preferences: {
                dataSaver: false,
                notifications: true,
                audioQuality: false
            },
            setPreferences: (prefs) => set((state) => ({ preferences: { ...state.preferences, ...prefs } })),

            // Actions
            login: (user) => set({ currentUser: user, isAuthenticated: true }),
            logout: () => {
                set({ currentUser: null, isAuthenticated: false });
            },
        }),
        {
            name: 'coj-storage',
            partialize: (state) => ({
                currentUser: state.currentUser,
                isAuthenticated: state.isAuthenticated,
                preferences: state.preferences
            }),
        }
    )
);
