import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from '../Card'

describe('Card component', () => {
  it('renders children content', () => {
    render(<Card><div>Inner Content</div></Card>)
    expect(screen.getByText('Inner Content')).toBeInTheDocument()
  })

  it('renders title and subtitle when provided', () => {
    render(
      <Card title="Department Salary Overview" subtitle="Updated 5 mins ago">
        <div>Analytics Data</div>
      </Card>
    )

    expect(screen.getByText('Department Salary Overview')).toBeInTheDocument()
    expect(screen.getByText('Updated 5 mins ago')).toBeInTheDocument()
  })

  it('renders headerRight slot', () => {
    render(
      <Card
        title="Card With Action"
        headerRight={<button data-testid="card-action-btn">Export</button>}
      >
        <div>Content</div>
      </Card>
    )

    expect(screen.getByTestId('card-action-btn')).toBeInTheDocument()
    expect(screen.getByText('Export')).toBeInTheDocument()
  })
})
