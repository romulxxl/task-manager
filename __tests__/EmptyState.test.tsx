import { render, screen } from '@testing-library/react'
import EmptyState from '@/components/ui/EmptyState'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No tasks" description="Add one to get started." />)
    expect(screen.getByText('No tasks')).toBeInTheDocument()
    expect(screen.getByText('Add one to get started.')).toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    render(
      <EmptyState
        title="Empty"
        description="Nothing here"
        action={{ label: 'Create', onClick: () => {} }}
      />
    )
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('does not render button when action is not provided', () => {
    render(<EmptyState title="Empty" description="Nothing here" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
