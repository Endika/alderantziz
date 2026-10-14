import { useReducer } from 'react'
import type { AudioPort, Clip } from '@/application/audio/port'
import { revealTracks } from '@/application/deck/tapeDeck'
import { newRound, roundReducer } from '@/domain/round/round'
import { Layout } from './components/Layout'
import { useDeck } from './hooks/useDeck'
import { ImitateScreen } from './screens/ImitateScreen'
import { RevealScreen } from './screens/RevealScreen'
import { SecretScreen } from './screens/SecretScreen'

export default function App({ audio }: { audio: AudioPort }) {
  const [round, dispatch] = useReducer(roundReducer<Clip>, undefined, newRound<Clip>)
  const controls = useDeck(audio)
  const recorded = (clip: Clip): void => dispatch({ type: 'recorded', clip })
  const advanced = (): void => dispatch({ type: 'advanced' })

  return (
    <Layout phase={round.phase}>
      {round.phase === 'secret' && (
        <SecretScreen
          key="secret"
          controls={controls}
          secret={round.secret}
          onRecorded={recorded}
          onNext={advanced}
        />
      )}
      {round.phase === 'imitate' && round.secret && (
        <ImitateScreen
          key="imitate"
          controls={controls}
          secret={round.secret}
          imitation={round.imitation}
          onRecorded={recorded}
          onNext={() => {
            if (!round.secret || !round.imitation) return
            advanced()
            // Straight from the tap, so the reveal plays without waiting for another gesture.
            void controls.play(revealTracks(round.secret, round.imitation))
          }}
        />
      )}
      {round.phase === 'reveal' && round.secret && round.imitation && (
        <RevealScreen
          key="reveal"
          controls={controls}
          secret={round.secret}
          imitation={round.imitation}
          onRestart={() => dispatch({ type: 'restarted' })}
        />
      )}
    </Layout>
  )
}
