import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@shared/components/ui/Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Correo" />)
    expect(screen.getByLabelText('Correo')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<Input label="Email" error="Campo requerido" />)
    expect(screen.getByText('Campo requerido')).toBeInTheDocument()
  })

  it('calls onChange handler', () => {
    const onChange = vi.fn()
    render(<Input label="Name" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ana' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('can be disabled', () => {
    render(<Input label="Disabled" disabled />)
    expect(screen.getByLabelText('Disabled')).toBeDisabled()
  })

  it('renders icon', () => {
    render(<Input label="Search" icon={<span data-testid="search-icon">🔍</span>} />)
    expect(screen.getByTestId('search-icon')).toBeInTheDocument()
  })

  it('generates id from label', () => {
    render(<Input label="Mi Campo" />)
    expect(screen.getByLabelText('Mi Campo').id).toBe('mi-campo')
  })
})
