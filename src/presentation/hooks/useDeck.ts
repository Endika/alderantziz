import { useCallback, useEffect, useRef, useState } from 'react'
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

export interface Track {
  id: string
  clip: Clip
  direction: Direction
}

export interface DeckControls {
  deck: Deck
  problem: DeckProblem | null
  record(onClip: (clip: Clip) => void): Promise<void>
  /** Resolves once every track has played, or as soon as playback is stopped. */
  play(tracks: Track[]): Promise<void>
  stop(): void
}

export function useDeck(audio: AudioPort): DeckControls {
  const [deck, setDeck] = useState<Deck>({ status: 'idle' })
  const [problem, setProblem] = useState<DeckProblem | null>(null)
  const take = useRef<{ take: Take; onClip: (clip: Clip) => void; timer: number } | null>(null)
  const playback = useRef<Playback | null>(null)
  // Bumped on every stop so an interrupted sequence does not start its next track.
  const session = useRef(0)
  // Mirrors the deck synchronously: a tap can land before React re-renders the disabled key.
  const busy = useRef(false)

  const stopPlayback = useCallback(() => {
    session.current += 1
    playback.current?.stop()
    playback.current = null
  }, [])

  const finishTake = useCallback(async () => {
    const current = take.current
    if (!current) return
    take.current = null
    window.clearTimeout(current.timer)
    setDeck({ status: 'saving' })
    try {
      current.onClip(await current.take.stop())
    } catch {
      setProblem('saving')
    }
    busy.current = false
    setDeck({ status: 'idle' })
  }, [])

  const record = useCallback(
    async (onClip: (clip: Clip) => void) => {
      if (busy.current) return
      busy.current = true
      stopPlayback()
      setProblem(null)
      setDeck({ status: 'arming' })
      try {
        const started = await audio.record()
        const timer = window.setTimeout(() => void finishTake(), MAX_SECONDS * 1000)
        take.current = { take: started, onClip, timer }
        setDeck({ status: 'recording', startedAt: performance.now() })
      } catch (error) {
        setProblem(error instanceof MicFailure ? error.problem : 'unavailable')
        busy.current = false
        setDeck({ status: 'idle' })
      }
    },
    [audio, finishTake, stopPlayback],
  )

  const play = useCallback<DeckControls['play']>(
    async (tracks) => {
      if (busy.current) return
      stopPlayback()
      const mine = session.current
      for (const { id, clip, direction } of tracks) {
        if (session.current !== mine) return
        const current = audio.play(clip, direction)
        playback.current = current
        setDeck({
          status: 'playing',
          track: id,
          direction,
          startedAt: performance.now(),
          duration: clip.duration,
        })
        await current.ended
      }
      if (session.current === mine) {
        playback.current = null
        setDeck({ status: 'idle' })
      }
    },
    [audio, stopPlayback],
  )

  const stop = useCallback(() => {
    if (take.current) {
      void finishTake()
      return
    }
    if (busy.current) return
    stopPlayback()
    setDeck({ status: 'idle' })
  }, [finishTake, stopPlayback])

  useEffect(
    () => () => {
      if (take.current) {
        window.clearTimeout(take.current.timer)
        take.current.take.cancel()
      }
      session.current += 1
      playback.current?.stop()
    },
    [],
  )

  return { deck, problem, record, play, stop }
}
