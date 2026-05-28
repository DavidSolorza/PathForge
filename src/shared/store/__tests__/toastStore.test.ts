import { describe, it, expect, beforeEach } from 'vitest'
import { useToastStore } from '@shared/store/toastStore'

describe('toastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
  })

  it('starts with empty toasts', () => {
    expect(useToastStore.getState().toasts).toEqual([])
  })

  it('adds a toast', () => {
    useToastStore.getState().addToast('success', 'Hecho', 'Operación exitosa')
    const toasts = useToastStore.getState().toasts
    expect(toasts).toHaveLength(1)
    expect(toasts[0].type).toBe('success')
    expect(toasts[0].title).toBe('Hecho')
    expect(toasts[0].message).toBe('Operación exitosa')
    expect(toasts[0].id).toMatch(/^toast_/)
  })

  it('dismisses a toast by id', () => {
    useToastStore.getState().addToast('error', 'Error')
    const id = useToastStore.getState().toasts[0].id
    useToastStore.getState().dismissToast(id)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('clears all toasts', () => {
    useToastStore.getState().addToast('info', 'Uno')
    useToastStore.getState().addToast('warning', 'Dos')
    useToastStore.getState().clearToasts()
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('supports addToast without optional params', () => {
    useToastStore.getState().addToast('info', 'Solo título')
    const t = useToastStore.getState().toasts[0]
    expect(t.title).toBe('Solo título')
    expect(t.message).toBeUndefined()
    expect(t.duration).toBeUndefined()
  })
})
