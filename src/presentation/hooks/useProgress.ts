import { useEffect, useState } from 'react'

/** Share of `duration` seconds elapsed since `startedAt` (performance.now), clamped to 0..1. */
export function useProgress(startedAt: number | null, duration: number): number {
  const [sample, setSample] = useState({ startedAt, share: 0 })

  useEffect(() => {
    if (startedAt === null || duration <= 0) return
    let frame = 0
    const tick = (): void => {
      const share = Math.min(1, (performance.now() - startedAt) / (duration * 1000))
      setSample({ startedAt, share })
      if (share < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [startedAt, duration])

  // A sample from a previous run must not leak into the next one.
  return startedAt !== null && sample.startedAt === startedAt ? sample.share : 0
}
