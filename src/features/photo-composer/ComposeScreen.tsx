import { Sparkles } from 'lucide-react'
import { eventConfig } from '../../config/event'
import { FloralDecor } from '../../components/floral/FloralDecor'
import { Button } from '../../components/ui/Button'
import type { CapturedPhoto, CompositionSettings, LayoutType } from '../../types/photo'

interface ComposeScreenProps {
  photos: CapturedPhoto[]
  settings: CompositionSettings
  previewUrl: string | null
  composing: boolean
  onChange: (settings: CompositionSettings) => void
  onConfirm: () => void
  onRetakeAt: (index: number) => void
  onBack: () => void
}

export function ComposeScreen({
  photos,
  settings,
  previewUrl,
  composing,
  onChange,
  onConfirm,
  onRetakeAt,
  onBack,
}: ComposeScreenProps) {
  const setLayout = (layout: LayoutType) => {
    onChange({ ...settings, layout })
  }

  return (
    <section className="relative mx-auto flex min-h-svh w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
      <FloralDecor density="subtle" />

      <div className="relative z-10 mb-5">
        <p className="font-script text-2xl text-sage">Compose</p>
        <h2 className="font-serif text-3xl text-ink sm:text-4xl">
          Your classic keepsake
        </h2>
      </div>

      <div className="relative z-10 mb-5">
        <p className="mb-3 text-sm text-taupe">
          Happy with every shot? Tap <span className="font-medium text-ink">Retake</span> on
          any photo to redo just that one.
        </p>
        <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="w-[7.5rem] overflow-hidden rounded-xl border-2 border-[#E8A0B0] bg-ink sm:w-36"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={photo.objectUrl}
                  alt={`Shot ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => onRetakeAt(index)}
                className="block w-full bg-[#E8A0B0] py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#d98a9c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
              >
                Retake
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 grid flex-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex items-center justify-center rounded-[2rem] border border-blush/70 bg-ivory/80 p-4 shadow-soft sm:p-6">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Composition preview"
              className="max-h-[70vh] w-auto max-w-full rounded-xl shadow-soft"
            />
          ) : (
            <div className="flex h-72 w-full items-center justify-center text-taupe">
              {composing ? 'Composing your photo…' : 'Preview will appear here'}
            </div>
          )}
        </div>

        <div className="space-y-5 rounded-[2rem] border border-blush/70 bg-ivory/90 p-5 shadow-soft sm:p-6">
          <fieldset className="space-y-3">
            <legend className="font-serif text-2xl text-ink">Layout</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <OptionButton
                selected={settings.layout === 'strip2'}
                disabled={photos.length < 2}
                onClick={() => setLayout('strip2')}
                title="2 Strip"
                detail={photos.length < 2 ? 'Needs 2' : 'Classic'}
              />
              <OptionButton
                selected={settings.layout === 'strip3'}
                disabled={photos.length < 3}
                onClick={() => setLayout('strip3')}
                title="3 Strip"
                detail={photos.length < 3 ? 'Needs 3' : 'Classic'}
              />
              <OptionButton
                selected={settings.layout === 'single'}
                onClick={() => setLayout('single')}
                title="Single"
                detail="One photo"
              />
              <OptionButton
                selected={settings.layout === 'story3'}
                disabled={photos.length < 3}
                onClick={() => setLayout('story3')}
                title="IG Story"
                detail={photos.length < 3 ? 'Needs 3' : '1080×1920'}
              />
            </div>
          </fieldset>

          <p className="rounded-2xl border border-blush/70 bg-white/60 px-4 py-3 text-sm text-taupe">
            Simple white frame with{' '}
            <span className="font-medium text-ink">{eventConfig.footerText}</span> at
            the bottom. No date, no extra decorations.
          </p>

          <label className="block space-y-2">
            <span className="font-serif text-2xl text-ink">Small caption (optional)</span>
            <input
              value={settings.caption}
              onChange={(event) =>
                onChange({ ...settings, caption: event.target.value.slice(0, 80) })
              }
              maxLength={80}
              className="w-full rounded-2xl border border-blush/80 bg-white/70 px-4 py-3 text-taupe outline-none ring-sage/40 focus:ring-2"
              placeholder="Leave blank, or add a short line above the title"
            />
          </label>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={onConfirm} disabled={composing || !previewUrl}>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Finish photo
            </Button>
            <Button variant="ghost" onClick={onBack}>
              Retake all
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function OptionButton({
  selected,
  disabled,
  onClick,
  title,
  detail,
}: {
  selected: boolean
  disabled?: boolean
  onClick: () => void
  title: string
  detail: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        'rounded-2xl border px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 sm:px-4',
        selected ? 'border-sage bg-sage/10' : 'border-blush/80 hover:bg-blush/30',
      ].join(' ')}
    >
      <p className="font-serif text-lg text-ink sm:text-xl">{title}</p>
      <p className="text-xs text-taupe sm:text-sm">{detail}</p>
    </button>
  )
}
