export type Phase = 'secret' | 'imitate' | 'reveal'

export interface Round<Clip> {
  phase: Phase
  secret: Clip | null
  imitation: Clip | null
}

export type RoundAction<Clip> =
  | { type: 'recorded'; clip: Clip }
  | { type: 'cleared' }
  | { type: 'advanced' }
  | { type: 'restarted' }

export function newRound<Clip>(): Round<Clip> {
  return { phase: 'secret', secret: null, imitation: null }
}

export function roundReducer<Clip>(round: Round<Clip>, action: RoundAction<Clip>): Round<Clip> {
  switch (action.type) {
    case 'recorded':
      if (round.phase === 'secret') return { ...round, secret: action.clip }
      if (round.phase === 'imitate') return { ...round, imitation: action.clip }
      return round
    case 'cleared':
      if (round.phase === 'secret') return { ...round, secret: null }
      if (round.phase === 'imitate') return { ...round, imitation: null }
      return round
    case 'advanced':
      if (round.phase === 'secret' && round.secret) return { ...round, phase: 'imitate' }
      if (round.phase === 'imitate' && round.imitation) return { ...round, phase: 'reveal' }
      return round
    case 'restarted':
      return newRound()
  }
}
