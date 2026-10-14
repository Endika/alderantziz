import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Clip } from '../audio/port'
import { Key } from '../components/Key'
import type { DeckControls, Track } from '../hooks/useDeck'
import { Screen } from './Screen'

interface RevealScreenProps {
  controls: DeckControls
  secret: Clip
  imitation: Clip
  onRestart: () => void
}

export function RevealScreen({ controls, secret, imitation, onRestart }: RevealScreenProps) {
  const { t } = useTranslation()
  const { deck, play, stop } = controls
  const original: Track = { id: 'original', clip: secret, direction: 'forward' }
  const reversed: Track = { id: 'imitation', clip: imitation, direction: 'backward' }
  const playing = deck.status === 'playing' ? deck.track : null

  // The tap that opened this screen is the user gesture, so the reveal can start right away.
  useEffect(() => {
    void play([original, reversed])
    // Only on arrival; replays are explicit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = (tracks: Track[]): void => {
    if (playing && tracks.length === 1 && tracks[0]?.id === playing) stop()
    else void play(tracks)
  }

  return (
    <Screen
      title={t('reveal.title')}
      hint={t('reveal.hint')}
      deck={deck}
      problem={controls.problem}
      footer={
        <Key
          tone="plain"
          glyph="↺"
          onClick={() => {
            stop()
            onRestart()
          }}
        >
          {t('reveal.again')}
        </Key>
      }
    >
      <Key tone="brand" glyph="▶ ◀◀" onClick={() => void play([original, reversed])}>
        {t('reveal.both')}
      </Key>
      <div className="grid grid-cols-1 gap-3">
        <Key
          glyph={playing === 'original' ? '■' : '▶'}
          aria-pressed={playing === 'original'}
          onClick={() => toggle([original])}
        >
          {t('reveal.original')}
        </Key>
        <Key
          glyph={playing === 'imitation' ? '■' : '◀◀'}
          aria-pressed={playing === 'imitation'}
          onClick={() => toggle([reversed])}
        >
          {t('reveal.imitation')}
        </Key>
      </div>
    </Screen>
  )
}
