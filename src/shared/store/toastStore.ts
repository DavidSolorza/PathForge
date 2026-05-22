import { create } from 'zustand'
import type { ToastData, ToastType } from '@shared/components/ui/Toast'

interface ToastState {
  toasts: ToastData[]
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => void
  dismissToast: (id: string) => void
  clearToasts: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (type, title, message, duration) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const toast: ToastData = { id, type, title, message, duration }
    set((state) => ({ toasts: [...state.toasts, toast] }))
  },
  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
  clearToasts: () => set({ toasts: [] }),
}))
