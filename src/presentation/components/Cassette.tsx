import { useTranslation } from 'react-i18next'
import type { Direction } from '../audio/port'

interface CassetteProps {
  /** null while the tape is still. */
  motion: Direction | null
  /** Share of the tape already wound onto the right reel, 0..1. */
  progress: number
  recording?: boolean
}

const FULL = 34
const EMPTY = 13

export function Cassette({ motion, progress, recording = false }: CassetteProps) {
  const { t } = useTranslation()
  const side = motion === 'backward' ? 'B' : 'A'
  return (
    <div
      className="cassette-scene mx-auto w-full max-w-[20rem]"
      role="img"
      aria-label={t('cassette.label', { side })}
    >
      <div className={`cassette-card ${side === 'B' ? 'is-flipped' : ''}`}>
        <div className="cassette-face cassette-face-a">
          <Face side="A" motion={motion} progress={progress} recording={recording} />
        </div>
        <div className="cassette-face cassette-face-b">
          <Face side="B" motion={motion} progress={progress} recording={false} />
        </div>
      </div>
    </div>
  )
}

function Face({ side, motion, progress, recording }: CassetteProps & { side: 'A' | 'B' }) {
  // Backwards the tape winds back onto the left reel.
  const wound = motion === 'backward' ? 1 - progress : progress
  const left = FULL - (FULL - EMPTY) * wound
  const right = EMPTY + (FULL - EMPTY) * wound
  const reelClass = `reel ${motion ? 'is-spinning' : ''} ${motion === 'backward' ? 'is-backward' : ''}`
  const clipId = `window-${side}`
  return (
    <svg viewBox="0 0 300 190" className="block h-auto w-full" aria-hidden="true">
      <rect x="4" y="4" width="292" height="182" rx="14" fill="var(--color-tape-body)" />
      {[
        [18, 18],
        [282, 18],
        [18, 172],
        [282, 172],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="var(--color-tape-edge)" />
      ))}
      <rect x="26" y="16" width="248" height="112" rx="6" fill="var(--color-surface)" />
      <text
        x="40"
        y="40"
        fontFamily="var(--font-display)"
        fontSize="15"
        letterSpacing="1"
        fill="var(--color-ink)"
      >
        ALDERANTZIZ
      </text>
      <rect x="26" y="112" width="248" height="5" fill="var(--color-brand)" />
      <rect x="26" y="117" width="248" height="5" fill="var(--color-mustard)" />
      <rect x="26" y="122" width="248" height="6" rx="0" fill="var(--color-teal)" />
      <text x="40" y="100" fontFamily="var(--font-display)" fontSize="30" fill="var(--color-ink)">
        {side}
      </text>
      <text
        x="260"
        y="100"
        textAnchor="end"
        fontSize="11"
        fontWeight="700"
        letterSpacing="1"
        fill="var(--color-muted)"
      >
        C-10
      </text>
      {recording && <circle className="rec-dot" cx="256" cy="36" r="7" fill="var(--color-brand)" />}
      <clipPath id={clipId}>
        <rect x="80" y="52" width="140" height="58" rx="29" />
      </clipPath>
      <rect x="80" y="52" width="140" height="58" rx="29" fill="var(--color-ink)" />
      <g clipPath={`url(#${clipId})`}>
        <circle cx="112" cy="81" r={left} fill="var(--color-tape-ribbon)" />
        <circle cx="188" cy="81" r={right} fill="var(--color-tape-ribbon)" />
      </g>
      <Reel cx={112} className={reelClass} />
      <Reel cx={188} className={reelClass} />
      <path d="M72 186 L88 150 H212 L228 186 Z" fill="var(--color-tape-edge)" />
      <circle cx="120" cy="170" r="5" fill="var(--color-tape-body)" />
      <circle cx="180" cy="170" r="5" fill="var(--color-tape-body)" />
    </svg>
  )
}

function Reel({ cx, className }: { cx: number; className: string }) {
  return (
    <g className={className}>
      <circle cx={cx} cy="81" r="10" fill="var(--color-surface)" />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <rect
          key={angle}
          x={cx - 1.5}
          y="72"
          width="3"
          height="5"
          fill="var(--color-ink)"
          transform={`rotate(${angle} ${cx} 81)`}
        />
      ))}
      <circle cx={cx} cy="81" r="3" fill="var(--color-ink)" />
    </g>
  )
}
