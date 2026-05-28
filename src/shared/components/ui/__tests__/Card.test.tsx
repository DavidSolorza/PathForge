import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardContent, CardFooter } from '@shared/components/ui/Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Contenido</Card>)
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  it('applies hover classes when hover is true', () => {
    const { rerender } = render(<Card hover>Hover card</Card>)
    expect(screen.getByText('Hover card').className).toContain('hover:shadow-lg')

    rerender(<Card>No hover</Card>)
    expect(screen.getByText('No hover').className).not.toContain('hover:shadow-lg')
  })
})

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header</CardHeader>)
    expect(screen.getByText('Header')).toBeInTheDocument()
  })
})

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Content</CardContent>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer</CardFooter>)
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })
})
