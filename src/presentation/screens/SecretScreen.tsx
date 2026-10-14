import { useTranslation } from 'react-i18next'
import type { Clip } from '@/application/audio/port'
import { Key } from '../components/Key'
import type { DeckControls } from '../hooks/useDeck'
import { RecordKey } from '../components/RecordKey'
import { Screen } from './Screen'

interface SecretScreenProps {
  controls: DeckControls
  secret: Clip | null
  onRecorded: (clip: Clip) => void
  onNext: () => void
}

export function SecretScreen({ controls, secret, onRecorded, onNext }: SecretScreenProps) {
  const { t } = useTranslation()
  const idle = controls.deck.status === 'idle'

  return (
    <Screen
      title={t('secret.title')}
      hint={t('secret.hint')}
      deck={controls.deck}
      problem={controls.problem}
      footer={
        <Key tone="brand" glyph="→" disabled={!secret || !idle} onClick={onNext}>
          {t('secret.next')}
        </Key>
      }
    >
      <RecordKey
        controls={controls}
        hasTake={secret !== null}
        onRecorded={onRecorded}
        primary={!secret}
      />
      {secret && idle && <p className="text-center text-sm text-muted">{t('secret.recorded')}</p>}
    </Screen>
  )
}
