import { pickMimeType, toMicFailure } from '@/infrastructure/audio/browserAudio'
import { MicFailure } from '@/application/audio/port'

describe('pickMimeType', () => {
  it('prefers webm/opus where it is supported', () => {
    expect(pickMimeType(() => true)).toBe('audio/webm;codecs=opus')
  })

  it('falls back to mp4 on Safari', () => {
    expect(pickMimeType((type) => type === 'audio/mp4')).toBe('audio/mp4')
  })

  it('leaves the choice to the browser when none is supported', () => {
    expect(pickMimeType(() => false)).toBeUndefined()
  })
})

describe('toMicFailure', () => {
  const domError = (name: string): Error => Object.assign(new Error(name), { name })

  it.each(['NotAllowedError', 'SecurityError'])('reads %s as a denied permission', (name) => {
    expect(toMicFailure(domError(name)).problem).toBe('denied')
  })

  it.each(['NotFoundError', 'NotReadableError', 'OverconstrainedError'])(
    'reads %s as an unavailable microphone',
    (name) => {
      expect(toMicFailure(domError(name)).problem).toBe('unavailable')
    },
  )

  it('keeps a failure that was already classified', () => {
    const failure = new MicFailure('unsupported')

    expect(toMicFailure(failure)).toBe(failure)
  })
})
