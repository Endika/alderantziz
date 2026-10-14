import { newRound, roundReducer, type Round } from '@/domain/round/round'

type Clip = string
const start = (): Round<Clip> => newRound<Clip>()

describe('roundReducer', () => {
  it('plays a full round from secret to reveal', () => {
    let round = start()
    round = roundReducer(round, { type: 'recorded', clip: 'secret' })
    round = roundReducer(round, { type: 'advanced' })
    round = roundReducer(round, { type: 'recorded', clip: 'imitation' })
    round = roundReducer(round, { type: 'advanced' })

    expect(round).toEqual({ phase: 'reveal', secret: 'secret', imitation: 'imitation' })
  })

  it('does not hand over the phone before the secret is recorded', () => {
    expect(roundReducer(start(), { type: 'advanced' }).phase).toBe('secret')
  })

  it('does not reveal before the imitation is recorded', () => {
    const imitating: Round<Clip> = { phase: 'imitate', secret: 'secret', imitation: null }

    expect(roundReducer(imitating, { type: 'advanced' }).phase).toBe('imitate')
  })

  it('replaces the take when re-recording', () => {
    let round = roundReducer(start(), { type: 'recorded', clip: 'first' })
    round = roundReducer(round, { type: 'recorded', clip: 'second' })

    expect(round.secret).toBe('second')
  })

  it('clears only the clip of the current phase', () => {
    const imitating: Round<Clip> = { phase: 'imitate', secret: 'secret', imitation: 'take' }

    expect(roundReducer(imitating, { type: 'cleared' })).toEqual({
      phase: 'imitate',
      secret: 'secret',
      imitation: null,
    })
  })

  it('ignores recordings and clears once revealed', () => {
    const revealed: Round<Clip> = { phase: 'reveal', secret: 'secret', imitation: 'take' }

    expect(roundReducer(revealed, { type: 'recorded', clip: 'late' })).toBe(revealed)
    expect(roundReducer(revealed, { type: 'cleared' })).toBe(revealed)
    expect(roundReducer(revealed, { type: 'advanced' })).toBe(revealed)
  })

  it('drops every clip on a new round', () => {
    const revealed: Round<Clip> = { phase: 'reveal', secret: 'secret', imitation: 'take' }

    expect(roundReducer(revealed, { type: 'restarted' })).toEqual(start())
  })
})
