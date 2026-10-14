import { useEffect, useState, useSyncExternalStore } from 'react'
import type { AudioPort } from '@/application/audio/port'
import { TapeDeck, type DeckState } from '@/application/deck/tapeDeck'

export interface DeckControls extends DeckState {
  record: TapeDeck['record']
  play: TapeDeck['play']
  stop: TapeDeck['stop']
}

export function useDeck(audio: AudioPort): DeckControls {
  const [tapeDeck] = useState(() => new TapeDeck(audio))
  const state = useSyncExternalStore(tapeDeck.subscribe, tapeDeck.getSnapshot)

  useEffect(() => tapeDeck.release, [tapeDeck])

  return { ...state, record: tapeDeck.record, play: tapeDeck.play, stop: tapeDeck.stop }
}
