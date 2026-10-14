import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Tone = 'brand' | 'plain' | 'ink'

const TONES: Record<Tone, string> = {
  brand: 'bg-brand text-ink hover:bg-brand-hover',
  plain: 'bg-surface text-ink hover:bg-ground',
  ink: 'bg-ink text-surface',
}

interface KeyProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone
  glyph?: ReactNode
}

export function Key({ tone = 'plain', glyph, children, className = '', ...rest }: KeyProps) {
  return (
    <button
      type="button"
      className={`key inline-flex min-h-14 items-center justify-center gap-2 px-4 text-base font-bold ${TONES[tone]} ${className}`}
      {...rest}
    >
      {glyph && (
        <span aria-hidden="true" className="text-lg leading-none">
          {glyph}
        </span>
      )}
      <span>{children}</span>
    </button>
  )
}
