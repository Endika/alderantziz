import { useMemo, useReducer } from 'react'
import { newRound, roundReducer } from '@/domain/round/round'
import type { AudioPort, Clip } from './audio/port'
import { Layout } from './components/Layout'
import { useDeck } from './hooks/useDeck'
import { ImitateScreen } from './screens/ImitateScreen'
import { RevealScreen } from './screens/RevealScreen'
import { SecretScreen } from './screens/SecretScreen'

export default function App({ audio }: { audio: AudioPort }) {
  const [round, dispatch] = useReducer(roundReducer<Clip>, undefined, newRound<Clip>)
  const controls = useDeck(audio)
  const handlers = useMemo(
    () => ({
      recorded: (clip: Clip) => dispatch({ type: 'recorded', clip }),
      advanced: () => dispatch({ type: 'advanced' }),
      restarted: () => dispatch({ type: 'restarted' }),
    }),
    [],
  )

  return (
    <Layout phase={round.phase}>
      {round.phase === 'secret' && (
        <SecretScreen
          key="secret"
          controls={controls}
          secret={round.secret}
          onRecorded={handlers.recorded}
          onNext={handlers.advanced}
        />
      )}
      {round.phase === 'imitate' && round.secret && (
        <ImitateScreen
          key="imitate"
          controls={controls}
          secret={round.secret}
          imitation={round.imitation}
          onRecorded={handlers.recorded}
          onNext={handlers.advanced}
        />
      )}
      {round.phase === 'reveal' && round.secret && round.imitation && (
        <RevealScreen
          key="reveal"
          controls={controls}
          secret={round.secret}
          imitation={round.imitation}
          onRestart={handlers.restarted}
        />
      )}
    </Layout>
  )
}
