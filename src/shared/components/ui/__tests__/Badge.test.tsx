import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '@shared/components/ui/Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Nuevo</Badge>)
    expect(screen.getByText('Nuevo')).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    const { rerender } = render(<Badge variant="success">Success</Badge>)
    expect(screen.getByText('Success').className).toContain('bg-green-100')

    rerender(<Badge variant="danger">Danger</Badge>)
    expect(screen.getByText('Danger').className).toContain('bg-red-100')

    rerender(<Badge variant="warning">Warning</Badge>)
    expect(screen.getByText('Warning').className).toContain('bg-amber-100')
  })

  it('applies size classes', () => {
    render(<Badge size="sm">Small</Badge>)
    expect(screen.getByText('Small').className).toContain('text-[10px]')
  })
})
