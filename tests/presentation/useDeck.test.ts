import { act, renderHook } from '@testing-library/react'
import type { Clip, Take } from '@/presentation/audio/port'
import { MAX_SECONDS, useDeck } from '@/presentation/hooks/useDeck'
import { FakeAudio, type FakeClip } from './fakeAudio'

/** A take whose save only finishes when the test says so. */
class SlowSaveAudio extends FakeAudio {
  saves: (() => void)[] = []
  override async record(): Promise<Take> {
    const take = await super.record()
    return {
      cancel: take.cancel,
      stop: async () => {
        await new Promise<void>((resolve) => this.saves.push(resolve))
        return take.stop()
      },
    }
  }
}

describe('useDeck', () => {
  afterEach(() => vi.useRealTimers())

  it(`stops recording on its own after ${MAX_SECONDS} seconds`, async () => {
    vi.useFakeTimers()
    const audio = new FakeAudio()
    const clips: Clip[] = []
    const { result } = renderHook(() => useDeck(audio))

    await act(() => result.current.record((clip) => clips.push(clip)))
    expect(result.current.deck.status).toBe('recording')
    await act(async () => vi.advanceTimersByTime(MAX_SECONDS * 1000))

    expect(result.current.deck.status).toBe('idle')
    expect(clips).toHaveLength(1)
  })

  it('stays saving when Stop is tapped again before the take is saved', async () => {
    const audio = new SlowSaveAudio()
    const clips: Clip[] = []
    const { result } = renderHook(() => useDeck(audio))
    await act(() => result.current.record((clip) => clips.push(clip)))

    act(() => {
      result.current.stop()
      result.current.stop()
    })

    expect(result.current.deck.status).toBe('saving')
  })

  it('ignores a new recording while the previous take is still saving', async () => {
    const audio = new SlowSaveAudio()
    const clips: FakeClip[] = []
    const { result } = renderHook(() => useDeck(audio))
    await act(() => result.current.record((clip) => clips.push(clip as FakeClip)))
    act(() => result.current.stop())

    await act(() => result.current.record((clip) => clips.push(clip as FakeClip)))
    await act(async () => audio.saves.shift()?.())

    expect(audio.takes).toBe(1)
    expect(result.current.deck.status).toBe('idle')
    expect(clips.map((clip) => clip.name)).toEqual(['take-1'])
  })

  it('records again once the previous take is saved', async () => {
    const audio = new FakeAudio()
    const clips: FakeClip[] = []
    const { result } = renderHook(() => useDeck(audio))

    for (let i = 0; i < 2; i++) {
      await act(() => result.current.record((clip) => clips.push(clip as FakeClip)))
      await act(async () => result.current.stop())
    }

    expect(clips.map((clip) => clip.name)).toEqual(['take-1', 'take-2'])
  })
})
