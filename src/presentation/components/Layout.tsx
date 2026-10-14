import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../i18n'
import type { Phase } from '@/domain/round/round'

// Vite replaces __APP_VERSION__ at build time; under vitest the define isn't applied.
const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'

const PHASES: Phase[] = ['secret', 'imitate', 'reveal']

export function Layout({ phase, children }: { phase: Phase; children: ReactNode }) {
  const { t, i18n } = useTranslation()
  const current = PHASES.indexOf(phase)

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl leading-none tracking-wide">ALDERANTZIZ</p>
          <p className="mt-1 text-sm text-muted">{t('tagline')}</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">{t('language')}</span>
          <select
            value={i18n.resolvedLanguage}
            onChange={(event) => void i18n.changeLanguage(event.target.value)}
            className="key min-h-11 bg-surface px-2 font-bold uppercase"
          >
            {LANGUAGES.map((code) => (
              <option key={code} value={code}>
                {code.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
      </header>

      <ol
        className="mt-6 grid grid-cols-3 gap-2"
        aria-label={t('steps.label', { step: current + 1 })}
      >
        {PHASES.map((step, index) => (
          <li
            key={step}
            aria-current={index === current ? 'step' : undefined}
            className={`flex min-w-0 items-center gap-1.5 rounded-lg border-2 border-ink px-2 py-1 text-xs font-bold ${
              index === current
                ? 'bg-ink text-surface'
                : index < current
                  ? 'bg-surface'
                  : 'opacity-50'
            }`}
          >
            <span className="font-display">{index + 1}</span>
            <span className="truncate">{t(`steps.${step}`)}</span>
          </li>
        ))}
      </ol>

      <main className="flex flex-1 flex-col py-6">{children}</main>

      <footer className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t-2 border-line pt-3 text-xs text-muted">
        <span>{t('privacy')}</span>
        <span className="tabular-nums">{t('version', { version: appVersion })}</span>
      </footer>
    </div>
  )
}
