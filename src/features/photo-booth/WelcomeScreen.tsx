import { Camera } from 'lucide-react'
import { eventConfig } from '../../config/event'
import { FloralDecor } from '../../components/floral/FloralDecor'
import { Button } from '../../components/ui/Button'
import type { LayoutType } from '../../types/photo'

interface WelcomeScreenProps {
  layout: LayoutType
  onLayoutChange: (layout: LayoutType) => void
  onStart: () => void
}

export function WelcomeScreen({
  layout,
  onLayoutChange,
  onStart,
}: WelcomeScreenProps) {
  return (
    <section className="relative flex min-h-dvh w-full flex-col items-center justify-center px-5 py-8 text-center sm:px-8 sm:py-12">
      {/* Full-viewport decor — stays behind the copy */}
      <FloralDecor density="welcome" />

      <div className="relative z-20 mx-auto flex w-[calc(100%-4.5rem)] max-w-3xl flex-col items-center px-1 py-6 bloom-in sm:w-full sm:px-6 sm:py-8">
        <p className="font-script text-[2.35rem] leading-none text-sage sm:text-5xl">
          {eventConfig.subtitle}
        </p>

        <div className="mt-4 mb-2 flex items-center gap-3 text-sage/70" aria-hidden="true">
          <span className="h-px w-10 bg-sage/40 sm:w-16" />
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M12 2c.4 3.2 2.2 5.8 5 7.2-2.8 1.4-4.6 4-5 7.2-.4-3.2-2.2-5.8-5-7.2C9.8 7.8 11.6 5.2 12 2zm0 11c.3 2.1 1.4 3.8 3.2 4.7-1.8.9-2.9 2.6-3.2 4.7-.3-2.1-1.4-3.8-3.2-4.7 1.8-.9 2.9-2.6 3.2-4.7z" />
          </svg>
          <span className="h-px w-10 bg-sage/40 sm:w-16" />
        </div>

        <h1 className="title-shine font-serif text-[3.4rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-7xl lg:text-8xl">
          {eventConfig.gardenTitle}
        </h1>

        <p className="mt-5 max-w-xl text-base font-light leading-relaxed text-taupe sm:text-lg">
          {eventConfig.description}
        </p>

        <div className="mt-10 w-full max-w-xl">
          <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-taupe/65">
            Choose your template
          </p>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            <LayoutChoice
              selected={layout === 'strip2'}
              label="2"
              detail="strip"
              bars={2}
              onClick={() => onLayoutChange('strip2')}
            />
            <LayoutChoice
              selected={layout === 'strip3'}
              label="3"
              detail="strip"
              bars={3}
              onClick={() => onLayoutChange('strip3')}
            />
            <LayoutChoice
              selected={layout === 'single'}
              label="1"
              detail="photo"
              bars={1}
              onClick={() => onLayoutChange('single')}
            />
            <LayoutChoice
              selected={layout === 'story3'}
              label="Story"
              detail="3 · IG ready"
              bars={3}
              tall
              onClick={() => onLayoutChange('story3')}
            />
          </div>
        </div>

        <Button
          className="mt-8 min-w-[240px] px-10 py-4 text-base tracking-wide"
          onClick={onStart}
        >
          <Camera className="h-5 w-5" aria-hidden="true" />
          {eventConfig.primaryCta}
        </Button>

        <p className="mt-6 max-w-md text-xs leading-relaxed text-taupe/70">
          Photos stay on this device and are never uploaded. Camera access is asked
          when you begin.
        </p>
      </div>
    </section>
  )
}

function LayoutChoice({
  selected,
  label,
  detail,
  bars,
  tall = false,
  onClick,
}: {
  selected: boolean
  label: string
  detail: string
  bars: number
  tall?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'group flex flex-col items-center gap-2 rounded-2xl border px-2 py-4 transition',
        selected
          ? 'border-sage/70 bg-white/80 shadow-soft'
          : 'border-transparent bg-white/35 hover:border-blush hover:bg-white/60',
      ].join(' ')}
    >
      <span
        className={[
          'flex flex-col justify-center gap-1 rounded-sm border bg-white px-1.5 py-2',
          tall ? 'h-14 w-7' : 'w-9',
          selected ? 'border-ink/15' : 'border-taupe/15',
        ].join(' ')}
        aria-hidden="true"
      >
        {Array.from({ length: bars }).map((_, index) => (
          <span
            key={index}
            className={[
              'w-full rounded-[1px]',
              tall ? 'h-3 flex-1' : 'h-2.5',
              selected ? 'bg-blush' : 'bg-taupe/20 group-hover:bg-blush/70',
            ].join(' ')}
          />
        ))}
      </span>
      <span className="font-serif text-xl text-ink sm:text-2xl">{label}</span>
      <span className="text-[0.65rem] uppercase tracking-[0.18em] text-taupe/70">
        {detail}
      </span>
    </button>
  )
}
