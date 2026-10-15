import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { SearchInput } from '../SearchInput'

describe('SearchInput component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders input with placeholder', () => {
    render(<SearchInput placeholder="Search employee..." />)
    expect(screen.getByPlaceholderText('Search employee...')).toBeInTheDocument()
  })

  it('calls onChange immediately when user types', () => {
    const handleChange = vi.fn()
    render(<SearchInput onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'John' } })

    expect(handleChange).toHaveBeenCalledWith('John')
  })

  it('triggers onDebouncedChange after debounce period', () => {
    const handleDebounced = vi.fn()
    render(<SearchInput onDebouncedChange={handleDebounced} debounceMs={300} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Engineering' } })

    expect(handleDebounced).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(handleDebounced).toHaveBeenCalledWith('Engineering')
  })
})
