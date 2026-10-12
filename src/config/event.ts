function env(key: keyof ImportMetaEnv, fallback: string): string {
  const value = import.meta.env[key]
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

function envInt(key: keyof ImportMetaEnv, fallback: number): number {
  const raw = import.meta.env[key]
  const parsed = typeof raw === 'string' ? Number.parseInt(raw, 10) : Number.NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const eventConfig = {
  brideName: env('VITE_BRIDE_NAME', 'Stephanie'),
  eventTitle: env('VITE_EVENT_TITLE', "Stephanie's Bridal Shower"),
  eventDate: env('VITE_EVENT_DATE', '2026-10-12'),
  gardenTitle: env('VITE_GARDEN_TITLE', "Stephanie's Garden"),
  subtitle: env('VITE_SUBTITLE', 'A Little Garden of Love'),
  description: env(
    'VITE_DESCRIPTION',
    'Capturing the sweetest memories as Stephanie begins her next chapter.',
  ),
  primaryCta: env('VITE_PRIMARY_CTA', "Let's Take Photos"),
  completionMessage: env(
    'VITE_COMPLETION_MESSAGE',
    'A little piece of today, just for you.',
  ),
  defaultCaption: env(
    'VITE_DEFAULT_CAPTION',
    'Love, laughter, and flowers.',
  ),
  footerText: env('VITE_FOOTER_TEXT', "Stephanie's Bridal Shower"),
  countdownSeconds: envInt('VITE_COUNTDOWN_SECONDS', 3),
  idleTimeoutMs: envInt('VITE_IDLE_TIMEOUT_MS', 180_000),
  singleShotCount: 1,
  guestbookStorageKey: 'stephanies-garden-guestbook',
} as const
