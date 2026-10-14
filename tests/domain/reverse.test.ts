import { reverseChannels } from '@/domain/audio/reverse'

describe('reverseChannels', () => {
  it('reverses every channel independently', () => {
    const [left, right] = reverseChannels([Float32Array.of(1, 2, 3), Float32Array.of(4, 5, 6, 7)])

    expect(Array.from(left!)).toEqual([3, 2, 1])
    expect(Array.from(right!)).toEqual([7, 6, 5, 4])
  })

  it('leaves the input untouched so the original can still play forwards', () => {
    const original = Float32Array.of(0.1, 0.2, 0.3)

    reverseChannels([original])

    expect(Array.from(original)).toEqual([0.1, 0.2, 0.3].map(Math.fround))
  })

  it('restores the original when applied twice', () => {
    const original = Float32Array.of(0.5, -0.25, 0, 1)

    const [twice] = reverseChannels(reverseChannels([original]))

    expect(twice).toEqual(original)
  })

  it('handles empty channels', () => {
    expect(reverseChannels([new Float32Array(0)])).toEqual([new Float32Array(0)])
  })
})
