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

    // Auth State
    currentUser: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            mode: 'UTILITY',
            setMode: (mode) => set({ mode }),
            isTransitioning: false,
            setIsTransitioning: (isTransitioning) => set({ isTransitioning }),

            // Auth Initial State
            currentUser: null,
            isAuthenticated: false,

            // Actions are just state updaters now, actual API calls happen in components
            // OR we can put thunks here if we use a middleware, but keeping it simple:
            // We will expose a setUser method for the Auth Listener to call.
            login: (user) => set({ currentUser: user, isAuthenticated: true }),
            logout: () => {
                set({ currentUser: null, isAuthenticated: false });
            },
        }),
        {
            name: 'coj-storage',
            partialize: (state) => ({
                currentUser: state.currentUser,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
