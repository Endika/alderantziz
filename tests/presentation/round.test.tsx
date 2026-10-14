import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/presentation/App'
import i18n from '@/presentation/i18n'
import { MicFailure } from '@/presentation/audio/port'
import { FakeAudio } from './fakeAudio'

beforeAll(async () => {
  await i18n.changeLanguage('es')
})

const key = (name: RegExp): HTMLElement => screen.getByRole('button', { name })

async function recordTake(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(key(/grabar|repetir/i))
  await user.click(key(/parar/i))
}

describe('a round', () => {
  it('reverses the secret, records the imitation and reveals both', async () => {
    const audio = new FakeAudio()
    const user = userEvent.setup()
    render(<App audio={audio} />)

    expect(key(/pasa el móvil/i)).toBeDisabled()
    await recordTake(user)
    await user.click(key(/pasa el móvil/i))

    expect(screen.getByRole('heading', { name: /escucha e imita/i })).toBeInTheDocument()
    await user.click(key(/al revés/i))
    await act(async () => audio.finishPlayback())
    await recordTake(user)
    await user.click(key(/qué has dicho/i))

    expect(screen.getByRole('heading', { name: /qué has dicho/i })).toBeInTheDocument()
    await act(async () => audio.finishPlayback())
    await act(async () => audio.finishPlayback())
    expect(audio.playlist).toEqual(['take-1 backward', 'take-1 forward', 'take-2 backward'])
  })

  it('starts over without any recording', async () => {
    const audio = new FakeAudio()
    const user = userEvent.setup()
    render(<App audio={audio} />)
    await recordTake(user)
    await user.click(key(/pasa el móvil/i))
    await recordTake(user)
    await user.click(key(/qué has dicho/i))

    await user.click(key(/nueva ronda/i))

    expect(screen.getByRole('heading', { name: /frase secreta/i })).toBeInTheDocument()
    expect(key(/^grabar$/i)).toBeEnabled()
    expect(key(/pasa el móvil/i)).toBeDisabled()
  })

  it('does not reveal before the imitation is recorded', async () => {
    const user = userEvent.setup()
    render(<App audio={new FakeAudio()} />)
    await recordTake(user)
    await user.click(key(/pasa el móvil/i))

    expect(key(/qué has dicho/i)).toBeDisabled()
  })

  it('explains how to unblock a denied microphone', async () => {
    const audio = new FakeAudio()
    audio.failure = new MicFailure('denied')
    const user = userEvent.setup()
    render(<App audio={audio} />)

    await user.click(key(/grabar/i))

    expect(screen.getByRole('alert')).toHaveTextContent(/micrófono está bloqueado/i)
    expect(key(/grabar/i)).toBeEnabled()
  })
})
