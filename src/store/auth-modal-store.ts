// store/auth-modal-store.ts
import { create } from 'zustand';

type AuthModalView = 'login' | 'register';

interface AuthModalState {
    isOpen: boolean;
    view: AuthModalView;
    openModal: (view?: AuthModalView) => void;
    closeModal: () => void;
    switchView: (view: AuthModalView) => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
    isOpen: false,
    view: 'login',
    openModal: (view = 'login') => set({ isOpen: true, view: view }),
    closeModal: () => set({ isOpen: false }),
    switchView: (view) => set({ view: view }),
}));