import { useTranslation } from 'react-i18next'
import type { Clip } from '@/application/audio/port'
import { Key } from '../components/Key'
import type { DeckControls } from '../hooks/useDeck'
import { RecordKey } from '../components/RecordKey'
import { Screen } from './Screen'

interface ImitateScreenProps {
  controls: DeckControls
  secret: Clip
  imitation: Clip | null
  onRecorded: (clip: Clip) => void
  onNext: () => void
}

export function ImitateScreen({
  controls,
  secret,
  imitation,
  onRecorded,
  onNext,
}: ImitateScreenProps) {
  const { t } = useTranslation()
  const { deck } = controls
  const playingSecret = deck.status === 'playing'
  const idle = deck.status === 'idle'

  return (
    <Screen
      title={t('imitate.title')}
      hint={t('imitate.hint')}
      deck={deck}
      problem={controls.problem}
      footer={
        <Key tone="brand" glyph="→" disabled={!imitation || !idle} onClick={onNext}>
          {t('imitate.next')}
        </Key>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        {playingSecret ? (
          <Key tone="ink" glyph="■" onClick={controls.stop}>
            {t('keys.stop')}
          </Key>
        ) : (
          <Key
            glyph="◀◀"
            disabled={!idle}
            onClick={() =>
              void controls.play([{ id: 'secret', clip: secret, direction: 'backward' }])
            }
          >
            {t('keys.reverse')}
          </Key>
        )}
        <RecordKey
          controls={controls}
          hasTake={imitation !== null}
          onRecorded={onRecorded}
          primary={!imitation}
        />
      </div>
      {imitation && idle && (
        <p className="text-center text-sm text-muted">{t('imitate.recorded')}</p>
      )}
    </Screen>
  )
}
