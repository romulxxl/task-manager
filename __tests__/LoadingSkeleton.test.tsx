import { render, container } from '@testing-library/react'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'

describe('LoadingSkeleton', () => {
  it('renders 5 skeleton items', () => {
    const { container } = render(<LoadingSkeleton />)
    const items = container.firstChild?.childNodes
    expect(items).toHaveLength(5)
  })
})
