import { useEffect, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { DeckDisplay } from '../components/DeckDisplay'
import type { Side } from '../components/Cassette'
import type { Deck, DeckProblem } from '@/application/deck/tapeDeck'

interface ScreenProps {
  title: string
  hint: string
  deck: Deck
  side: Side
  problem: DeckProblem | null
  /** The transport keys under the cassette. */
  children: ReactNode
  /** The step's primary action, pinned to the bottom. */
  footer: ReactNode
}

export function Screen({ title, hint, deck, side, problem, children, footer }: ScreenProps) {
  const { t } = useTranslation()
  const heading = useRef<HTMLHeadingElement>(null)

  // Each screen is a hand-over: move focus to its title so screen readers announce it.
  useEffect(() => heading.current?.focus(), [])

  return (
    <section className="flex flex-1 flex-col">
      <h1 ref={heading} tabIndex={-1} className="text-3xl leading-tight font-extrabold">
        {title}
      </h1>
      <p className="mt-2 text-muted">{hint}</p>
      {problem && (
        <p
          role="alert"
          className="mt-4 rounded-xl border-2 border-danger bg-danger-soft p-3 text-danger"
        >
          {t(`errors.${problem}`)}
        </p>
      )}
      <div className="mt-6">
        <DeckDisplay deck={deck} side={side} />
      </div>
      <div className="mt-2 flex flex-col gap-3">{children}</div>
      <div className="mt-auto flex flex-col gap-3 pt-6">{footer}</div>
    </section>
  )
}
