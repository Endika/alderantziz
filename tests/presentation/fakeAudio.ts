import type { AudioPort, Clip, Direction, Playback, Take } from '@/presentation/audio/port'
import { MicFailure } from '@/presentation/audio/port'

export interface FakeClip extends Clip {
  name: string
}

export class FakeAudio implements AudioPort {
  readonly played: { clip: FakeClip; direction: Direction }[] = []
  failure: MicFailure | null = null
  /** How many recordings were started. */
  takes = 0
  private pending: (() => void)[] = []

  async record(): Promise<Take> {
    if (this.failure) throw this.failure
    const name = `take-${++this.takes}`
    return { stop: async () => ({ duration: 1, name }) as FakeClip, cancel: () => {} }
  }

  play(clip: Clip, direction: Direction): Playback {
    this.played.push({ clip: clip as FakeClip, direction })
    let finish = (): void => {}
    const ended = new Promise<void>((resolve) => (finish = resolve))
    this.pending.push(finish)
    return { stop: finish, ended }
  }

  /** Lets the oldest playing clip reach its end. */
  finishPlayback(): void {
    this.pending.shift()?.()
  }

  get playlist(): string[] {
    return this.played.map(({ clip, direction }) => `${clip.name} ${direction}`)
  }
}
