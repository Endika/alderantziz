import { useTranslation } from 'react-i18next'
import type { Clip } from '../audio/port'
import { Key } from '../components/Key'
import type { DeckControls } from '../hooks/useDeck'

interface RecordKeyProps {
  controls: DeckControls
  hasTake: boolean
  onRecorded: (clip: Clip) => void
  primary: boolean
}

export function RecordKey({ controls, hasTake, onRecorded, primary }: RecordKeyProps) {
  const { t } = useTranslation()
  const { deck } = controls

  if (deck.status === 'recording') {
    return (
      <Key tone="ink" glyph="■" onClick={controls.stop}>
        {t('keys.stop')}
      </Key>
    )
  }
  return (
    <Key
      tone={primary ? 'brand' : 'plain'}
      glyph="●"
      disabled={deck.status === 'arming' || deck.status === 'saving'}
      onClick={() => void controls.record(onRecorded)}
    >
      {hasTake ? t('keys.retake') : t('keys.rec')}
    </Key>
  )
}
