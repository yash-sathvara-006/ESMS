import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button component', () => {
  it('renders children correctly', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('triggers onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Submit</Button>)
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not trigger onClick when disabled', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    
    const btn = screen.getByRole('button', { name: /disabled/i })
    expect(btn).toBeDisabled()
    fireEvent.click(btn)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('displays loading spinner and disables button when isLoading is true', () => {
    const handleClick = vi.fn()
    render(<Button isLoading onClick={handleClick}>Saving</Button>)
    
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    fireEvent.click(btn)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders with left and right icons', () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon">L</span>}
        rightIcon={<span data-testid="right-icon">R</span>}
      >
        With Icons
      </Button>
    )

    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    expect(screen.getByText('With Icons')).toBeInTheDocument()
  })

  it('renders distinct variants properly', () => {
    const { rerender } = render(<Button variant="danger">Delete</Button>)
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()

    rerender(<Button variant="secondary">Cancel</Button>)
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button', { name: /outline/i })).toBeInTheDocument()
  })
})
