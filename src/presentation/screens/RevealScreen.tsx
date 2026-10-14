import { useTranslation } from 'react-i18next'
import type { Clip } from '@/application/audio/port'
import { revealTracks, type Track } from '@/application/deck/tapeDeck'
import { Key } from '../components/Key'
import type { DeckControls } from '../hooks/useDeck'
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
  const tracks = revealTracks(secret, imitation)
  const playing = deck.status === 'playing' ? deck.track : null

  const toggle = (track: Track): void => {
    if (playing === track.id) stop()
    else void play([track])
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
      <Key tone="brand" glyph="▶ ◀◀" onClick={() => void play(tracks)}>
        {t('reveal.both')}
      </Key>
      <div className="grid grid-cols-1 gap-3">
        {tracks.map((track) => (
          <Key
            key={track.id}
            glyph={playing === track.id ? '■' : track.direction === 'forward' ? '▶' : '◀◀'}
            aria-pressed={playing === track.id}
            onClick={() => toggle(track)}
          >
            {t(`reveal.${track.id}`)}
          </Key>
        ))}
      </div>
    </Screen>
  )
}
