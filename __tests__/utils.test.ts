import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges multiple class names into a single string', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('applies conditional classes correctly', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('resolves Tailwind conflicts — last class wins', () => {
    expect(cn('text-white', 'text-black')).toBe('text-black')
  })
})
