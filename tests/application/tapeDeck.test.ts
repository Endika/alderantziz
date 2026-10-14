import type { Clip, Take } from '@/application/audio/port'
import { MicFailure } from '@/application/audio/port'
import { MAX_SECONDS, TapeDeck, revealTracks } from '@/application/deck/tapeDeck'
import { FakeAudio, type FakeClip } from '../fakes/fakeAudio'

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

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0))
const names = (clips: Clip[]): string[] => clips.map((clip) => (clip as FakeClip).name)

describe('TapeDeck', () => {
  afterEach(() => vi.useRealTimers())

  it(`stops recording on its own after ${MAX_SECONDS} seconds`, async () => {
    vi.useFakeTimers()
    const deck = new TapeDeck(new FakeAudio())
    const clips: Clip[] = []

    await deck.record((clip) => clips.push(clip))
    expect(deck.getSnapshot().deck.status).toBe('recording')
    await vi.advanceTimersByTimeAsync(MAX_SECONDS * 1000)

    expect(deck.getSnapshot().deck.status).toBe('idle')
    expect(clips).toHaveLength(1)
  })

  it('stays saving when Stop is tapped again before the take is saved', async () => {
    const deck = new TapeDeck(new SlowSaveAudio())
    await deck.record(() => {})

    deck.stop()
    deck.stop()

    expect(deck.getSnapshot().deck.status).toBe('saving')
  })

  it('ignores a new recording while the previous take is still saving', async () => {
    const audio = new SlowSaveAudio()
    const deck = new TapeDeck(audio)
    const clips: Clip[] = []
    await deck.record((clip) => clips.push(clip))
    deck.stop()

    await deck.record((clip) => clips.push(clip))
    audio.saves.shift()?.()
    await flush()

    expect(audio.takes).toBe(1)
    expect(deck.getSnapshot().deck.status).toBe('idle')
    expect(names(clips)).toEqual(['take-1'])
  })

  it('records again once the previous take is saved', async () => {
    const deck = new TapeDeck(new FakeAudio())
    const clips: Clip[] = []

    for (let i = 0; i < 2; i++) {
      await deck.record((clip) => clips.push(clip))
      deck.stop()
      await flush()
    }

    expect(names(clips)).toEqual(['take-1', 'take-2'])
  })

  it('reports a denied microphone and stays usable', async () => {
    const audio = new FakeAudio()
    audio.failure = new MicFailure('denied')
    const deck = new TapeDeck(audio)

    await deck.record(() => {})

    expect(deck.getSnapshot()).toEqual({ deck: { status: 'idle' }, problem: 'denied' })
  })

  it('plays a playlist in order and returns to idle', async () => {
    const audio = new FakeAudio()
    const deck = new TapeDeck(audio)
    const secret = { duration: 1, name: 'secret' }
    const imitation = { duration: 1, name: 'imitation' }

    const done = deck.play(revealTracks(secret, imitation))
    audio.finishPlayback()
    await flush()
    audio.finishPlayback()
    await done

    expect(audio.playlist).toEqual(['secret forward', 'imitation backward'])
    expect(deck.getSnapshot().deck.status).toBe('idle')
  })

  it('does not start the next track once the playlist is stopped', async () => {
    const audio = new FakeAudio()
    const deck = new TapeDeck(audio)
    const clip = { duration: 1, name: 'clip' }

    const done = deck.play(revealTracks(clip, clip))
    deck.stop()
    await done

    expect(audio.playlist).toEqual(['clip forward'])
    expect(deck.getSnapshot().deck.status).toBe('idle')
  })

  it('cancels the open take on release', async () => {
    let cancelled = false
    const audio = new FakeAudio()
    const record = audio.record.bind(audio)
    audio.record = async () => ({ ...(await record()), cancel: () => (cancelled = true) })
    const deck = new TapeDeck(audio)
    await deck.record(() => {})

    deck.release()

    expect(cancelled).toBe(true)
    expect(deck.getSnapshot().deck.status).toBe('idle')
  })
})
