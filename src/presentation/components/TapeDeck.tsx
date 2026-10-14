import { useTranslation } from 'react-i18next'
import { Cassette } from './Cassette'
import { MAX_SECONDS, type Deck } from '../hooks/useDeck'
import { useProgress } from '../hooks/useProgress'

export function TapeDeck({ deck }: { deck: Deck }) {
  const { t } = useTranslation()
  const recording = deck.status === 'recording'
  const playing = deck.status === 'playing'
  const startedAt = recording || playing ? deck.startedAt : null
  const progress = useProgress(startedAt, playing ? deck.duration : MAX_SECONDS)
  const remaining = Math.max(0, Math.ceil(MAX_SECONDS * (1 - progress)))

  return (
    <div className="flex flex-col items-center gap-3">
      <Cassette
        motion={recording ? 'forward' : playing ? deck.direction : null}
        progress={progress}
        recording={recording}
      />
      <p className="h-7 font-display text-xl tabular-nums" aria-live="polite">
        {recording && (
          <span className="text-brand-press">
            <span aria-hidden="true">● </span>
            {t('seconds', { seconds: remaining })}
          </span>
        )}
        {deck.status === 'saving' && <span className="text-muted">{t('saving')}</span>}
      </p>
    </div>
  )
}
