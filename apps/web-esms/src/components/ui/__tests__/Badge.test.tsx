import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../Badge'

describe('Badge component', () => {
  it('renders string label properly', () => {
    render(<Badge label="Active" variant="success" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders children properly when label is omitted', () => {
    render(<Badge variant="warning">Pending Review</Badge>)
    expect(screen.getByText('Pending Review')).toBeInTheDocument()
  })

  it('supports various variant styles', () => {
    const { rerender } = render(<Badge variant="emerald" label="Success Badge" />)
    expect(screen.getByText('Success Badge')).toBeInTheDocument()

    rerender(<Badge variant="purple" label="Executive Level" />)
    expect(screen.getByText('Executive Level')).toBeInTheDocument()

    rerender(<Badge variant="rose" label="High Risk" />)
    expect(screen.getByText('High Risk')).toBeInTheDocument()
  })
})
