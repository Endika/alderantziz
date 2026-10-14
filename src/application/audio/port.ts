export type Direction = 'forward' | 'backward'

export type MicProblem = 'denied' | 'unavailable' | 'unsupported'

export class MicFailure extends Error {
  constructor(readonly problem: MicProblem) {
    super(`microphone ${problem}`)
  }
}

export interface Clip {
  readonly duration: number
}

export interface Take {
  stop(): Promise<Clip>
  cancel(): void
}

export interface Playback {
  stop(): void
  readonly ended: Promise<void>
}

export interface AudioPort {
  /** Rejects with MicFailure when the microphone cannot be used. */
  record(): Promise<Take>
  play(clip: Clip, direction: Direction): Playback
}
