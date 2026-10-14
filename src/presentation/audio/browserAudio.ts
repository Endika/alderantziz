import { reverseChannels } from '@/domain/audio/reverse'
import {
  MicFailure,
  type AudioPort,
  type Clip,
  type Direction,
  type Playback,
  type Take,
} from './port'

// Safari records only mp4; Chrome and Firefox prefer webm/opus.
const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm']

export function pickMimeType(isSupported: (type: string) => boolean): string | undefined {
  return MIME_CANDIDATES.find(isSupported)
}

export function toMicFailure(error: unknown): MicFailure {
  if (error instanceof MicFailure) return error
  const name = error instanceof Error ? error.name : ''
  if (name === 'NotAllowedError' || name === 'SecurityError') return new MicFailure('denied')
  return new MicFailure('unavailable')
}

class BrowserClip implements Clip {
  constructor(
    readonly forward: AudioBuffer,
    readonly backward: AudioBuffer,
  ) {}

  get duration(): number {
    return this.forward.duration
  }
}

export class BrowserAudio implements AudioPort {
  private context: AudioContext | null = null

  // Created on the first tap: browsers keep an AudioContext made outside a gesture suspended.
  private audioContext(): AudioContext {
    this.context ??= new AudioContext()
    void this.context.resume()
    return this.context
  }

  async record(): Promise<Take> {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      throw new MicFailure('unsupported')
    }
    const context = this.audioContext()
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (error) {
      throw toMicFailure(error)
    }
    const release = (): void => stream.getTracks().forEach((track) => track.stop())
    const chunks: Blob[] = []
    let recorder: MediaRecorder
    let stopped: Promise<void>
    try {
      const mimeType = pickMimeType((type) => MediaRecorder.isTypeSupported(type))
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      recorder.addEventListener('dataavailable', (event) => chunks.push(event.data))
      stopped = new Promise<void>((resolve) =>
        recorder.addEventListener('stop', () => resolve(), { once: true }),
      )
      recorder.start()
    } catch {
      release()
      throw new MicFailure('unsupported')
    }

    return {
      stop: async () => {
        // iOS stops the recorder on its own on a call or Siri; the chunks are still there.
        try {
          if (recorder.state !== 'inactive') recorder.stop()
          await stopped
        } finally {
          release()
        }
        const blob = new Blob(chunks, { type: recorder.mimeType })
        const forward = await context.decodeAudioData(await blob.arrayBuffer())
        return new BrowserClip(forward, reversed(context, forward))
      },
      cancel: () => {
        if (recorder.state !== 'inactive') recorder.stop()
        release()
      },
    }
  }

  play(clip: Clip, direction: Direction): Playback {
    const { forward, backward } = clip as BrowserClip
    const context = this.audioContext()
    const source = context.createBufferSource()
    source.buffer = direction === 'forward' ? forward : backward
    source.connect(context.destination)
    const ended = new Promise<void>((resolve) =>
      source.addEventListener('ended', () => resolve(), { once: true }),
    )
    source.start()
    return { stop: () => source.stop(), ended }
  }
}

function reversed(context: AudioContext, buffer: AudioBuffer): AudioBuffer {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) =>
    buffer.getChannelData(i),
  )
  const result = context.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate)
  reverseChannels(channels).forEach((channel, i) => result.copyToChannel(channel, i))
  return result
}
