import {
  MicFailure,
  type AudioPort,
  type Clip,
  type Direction,
  type MicProblem,
  type Playback,
  type Take,
} from '../audio/port'

export const MAX_SECONDS = 10

export type DeckProblem = MicProblem | 'saving'

export type Deck =
  | { status: 'idle' }
  | { status: 'arming' }
  | { status: 'recording'; startedAt: number }
  | { status: 'saving' }
  | { status: 'playing'; track: string; direction: Direction; startedAt: number; duration: number }

export interface DeckState {
  deck: Deck
  problem: DeckProblem | null
}

export interface Track {
  id: string
  clip: Clip
  direction: Direction
}

interface OpenTake {
  take: Take
  onClip: (clip: Clip) => void
  timer: ReturnType<typeof setTimeout>
}

const IDLE: Deck = { status: 'idle' }

/**
 * The tape recorder: one take or one playlist at a time, a hard cap on recording length,
 * and playback that a new action always interrupts. Taps that arrive while the deck is
 * arming, recording or saving are ignored.
 */
export class TapeDeck {
  private state: DeckState = { deck: IDLE, problem: null }
  private readonly listeners = new Set<() => void>()
  private take: OpenTake | null = null
  private playback: Playback | null = null
  // Bumped on every interruption so a stopped playlist does not start its next track.
  private session = 0

  constructor(private readonly audio: AudioPort) {}

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot = (): DeckState => this.state

  record = async (onClip: (clip: Clip) => void): Promise<void> => {
    if (this.busy) return
    this.interruptPlayback()
    this.update({ deck: { status: 'arming' }, problem: null })
    try {
      const take = await this.audio.record()
      const timer = setTimeout(() => void this.finishTake(), MAX_SECONDS * 1000)
      this.take = { take, onClip, timer }
      this.update({ deck: { status: 'recording', startedAt: performance.now() } })
    } catch (error) {
      this.update({
        deck: IDLE,
        problem: error instanceof MicFailure ? error.problem : 'unavailable',
      })
    }
  }

  /** Resolves once every track has played, or as soon as playback is interrupted. */
  play = async (tracks: readonly Track[]): Promise<void> => {
    if (this.busy) return
    this.interruptPlayback()
    const session = this.session
    for (const { id, clip, direction } of tracks) {
      if (this.session !== session) return
      this.playback = this.audio.play(clip, direction)
      this.update({
        deck: {
          status: 'playing',
          track: id,
          direction,
          startedAt: performance.now(),
          duration: clip.duration,
        },
      })
      await this.playback.ended
    }
    if (this.session === session) {
      this.playback = null
      this.update({ deck: IDLE })
    }
  }

  stop = (): void => {
    if (this.take) {
      void this.finishTake()
      return
    }
    if (this.busy) return
    this.interruptPlayback()
    this.update({ deck: IDLE })
  }

  /** Drops the open take and silences playback, e.g. when the UI goes away. */
  release = (): void => {
    if (this.take) {
      clearTimeout(this.take.timer)
      this.take.take.cancel()
      this.take = null
    }
    this.interruptPlayback()
    this.update({ deck: IDLE })
  }

  private get busy(): boolean {
    const { status } = this.state.deck
    return status === 'arming' || status === 'recording' || status === 'saving'
  }

  private async finishTake(): Promise<void> {
    const open = this.take
    if (!open) return
    this.take = null
    clearTimeout(open.timer)
    this.update({ deck: { status: 'saving' } })
    try {
      open.onClip(await open.take.stop())
    } catch {
      this.update({ problem: 'saving' })
    }
    this.update({ deck: IDLE })
  }

  private interruptPlayback(): void {
    this.session += 1
    this.playback?.stop()
    this.playback = null
  }

  private update(change: Partial<DeckState>): void {
    this.state = { ...this.state, ...change }
    this.listeners.forEach((listener) => listener())
  }
}

/** The reveal: the real phrase first, then the imitation turned around. */
export function revealTracks(secret: Clip, imitation: Clip): Track[] {
  return [
    { id: 'original', clip: secret, direction: 'forward' },
    { id: 'imitation', clip: imitation, direction: 'backward' },
  ]
}
