import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, LoaderCircle, Sparkles } from 'lucide-react'
import {
  FRAME_BACKGROUNDS,
  PHOTO_FILTERS,
  STICKER_OPTIONS,
  defaultPlacedSticker,
  stickerSrc,
} from '../../config/compose'
import { FloralDecor } from '../../components/floral/FloralDecor'
import { Button } from '../../components/ui/Button'
import { composePhoto } from '../../services/imageExport'
import type {
  CapturedPhoto,
  CompositionSettings,
  FrameBackground,
  LayoutType,
  PhotoFilter,
  SaveStatus,
  StickerId,
} from '../../types/photo'

interface ReviewScreenProps {
  photos: CapturedPhoto[]
  settings: CompositionSettings
  generating: boolean
  saveStatus: SaveStatus
  onChange: (settings: CompositionSettings) => void
  onDownload: () => void
  onNewSession: () => void
  onRetakeAt: (index: number) => void
  onRetakeAll: () => void
}

export function ReviewScreen({
  photos,
  settings,
  generating,
  saveStatus,
  onChange,
  onDownload,
  onNewSession,
  onRetakeAt,
  onRetakeAll,
}: ReviewScreenProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const previewUrlRef = useRef<string | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    id: StickerId
    pointerId: number
  } | null>(null)

  const baseSettings = useMemo(
    () => ({
      layout: settings.layout,
      caption: settings.caption,
      background: settings.background,
      filter: settings.filter,
    }),
    [settings.layout, settings.caption, settings.background, settings.filter],
  )

  useEffect(() => {
    if (photos.length === 0) {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
        previewUrlRef.current = null
      }
      setPreviewUrl(null)
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      setPreviewing(true)
      void composePhoto(
        photos,
        {
          layout: baseSettings.layout,
          caption: baseSettings.caption,
          background: baseSettings.background,
          filter: baseSettings.filter,
          stickers: [],
        },
        { omitStickers: true },
      )
        .then((blob) => {
          if (cancelled) return
          const url = URL.createObjectURL(blob)
          if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
          previewUrlRef.current = url
          setPreviewUrl(url)
        })
        .catch(() => {
          // Keep the last good preview if a compose attempt fails.
        })
        .finally(() => {
          if (!cancelled) setPreviewing(false)
        })
    }, 160)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [photos, baseSettings])

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
        previewUrlRef.current = null
      }
    }
  }, [])

  const setLayout = (layout: LayoutType) => {
    onChange({ ...settings, layout })
  }

  const setBackground = (background: FrameBackground) => {
    onChange({ ...settings, background })
  }

  const setFilter = (filter: PhotoFilter) => {
    onChange({ ...settings, filter })
  }

  const toggleSticker = (id: StickerId) => {
    const exists = settings.stickers.some((item) => item.id === id)
    if (exists) {
      onChange({
        ...settings,
        stickers: settings.stickers.filter((item) => item.id !== id),
      })
      return
    }
    onChange({
      ...settings,
      stickers: [
        ...settings.stickers,
        defaultPlacedSticker(id, settings.stickers.length),
      ],
    })
  }

  const moveSticker = (id: StickerId, clientX: number, clientY: number) => {
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    const x = clamp((clientX - rect.left) / rect.width, 0.06, 0.94)
    const y = clamp((clientY - rect.top) / rect.height, 0.05, 0.95)
    onChange({
      ...settings,
      stickers: settings.stickers.map((item) =>
        item.id === id ? { ...item, x, y } : item,
      ),
    })
  }

  const flowerStickers = STICKER_OPTIONS.filter((item) => item.group === 'flower')
  const stephStickers = STICKER_OPTIONS.filter((item) => item.group === 'steph')

  return (
    <section className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-3 py-4 sm:px-5 sm:py-5">
      <FloralDecor density="subtle" />

      <div className="relative z-10 mb-3 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0 text-left">
          <p className="font-script text-xl leading-none text-sage sm:text-2xl">Looking good!</p>
          <h2 className="mt-0.5 font-serif text-xl text-ink sm:text-2xl">
            Customize your strip
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="w-[5.75rem] overflow-hidden rounded-lg border-2 border-[#E8A0B0] bg-ink sm:w-28"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={photo.objectUrl}
                  alt={`Shot ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => onRetakeAt(index)}
                disabled={generating}
                className="block w-full bg-[#E8A0B0] py-1 text-center text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#d98a9c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 disabled:opacity-50"
              >
                Retake
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="flex items-center justify-center rounded-[1.25rem] border border-blush/70 bg-ivory/85 p-3 shadow-soft sm:p-4 lg:sticky lg:top-4 lg:min-h-[70vh]">
          {previewUrl ? (
            <div className="relative flex w-full items-center justify-center">
              <div ref={stageRef} className="relative max-w-full">
                <img
                  src={previewUrl}
                  alt="Live strip preview"
                  className="pointer-events-none max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-soft select-none"
                  draggable={false}
                />
                {settings.stickers.map((sticker) => (
                  <button
                    key={sticker.id}
                    type="button"
                    aria-label={`Move ${sticker.id} sticker`}
                    disabled={generating}
                    className="absolute touch-none cursor-grab active:cursor-grabbing"
                    style={{
                      left: `${sticker.x * 100}%`,
                      top: `${sticker.y * 100}%`,
                      width: `${sticker.size * 100}%`,
                      transform: `translate(-50%, -50%) rotate(${sticker.rotate}deg)`,
                    }}
                    onPointerDown={(event) => {
                      event.preventDefault()
                      event.currentTarget.setPointerCapture(event.pointerId)
                      dragRef.current = {
                        id: sticker.id,
                        pointerId: event.pointerId,
                      }
                      moveSticker(sticker.id, event.clientX, event.clientY)
                    }}
                    onPointerMove={(event) => {
                      if (
                        !dragRef.current ||
                        dragRef.current.id !== sticker.id ||
                        dragRef.current.pointerId !== event.pointerId
                      ) {
                        return
                      }
                      moveSticker(sticker.id, event.clientX, event.clientY)
                    }}
                    onPointerUp={(event) => {
                      if (dragRef.current?.pointerId === event.pointerId) {
                        dragRef.current = null
                      }
                    }}
                    onPointerCancel={() => {
                      dragRef.current = null
                    }}
                  >
                    <img
                      src={stickerSrc(sticker.id)}
                      alt=""
                      className="pointer-events-none h-auto w-full select-none drop-shadow-md"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
              {previewing ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory/90 px-2.5 py-1 text-[0.65rem] text-taupe shadow-soft">
                    <LoaderCircle className="h-3 w-3 animate-spin" aria-hidden="true" />
                    Updating…
                  </span>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-taupe">
              <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
              <p className="text-xs">Building preview…</p>
            </div>
          )}
        </div>

        <div className="rounded-[1.25rem] border border-blush/70 bg-ivory/90 shadow-soft">
          <div className="space-y-3 p-3 sm:p-4">
            <fieldset className="space-y-2">
              <legend className="font-serif text-lg text-ink">Layout</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <OptionButton
                  selected={settings.layout === 'strip2'}
                  disabled={photos.length < 2 || generating}
                  onClick={() => setLayout('strip2')}
                  title="2 Strip"
                  detail={photos.length < 2 ? 'Needs 2' : 'Classic'}
                />
                <OptionButton
                  selected={settings.layout === 'strip3'}
                  disabled={photos.length < 3 || generating}
                  onClick={() => setLayout('strip3')}
                  title="3 Strip"
                  detail={photos.length < 3 ? 'Needs 3' : 'Classic'}
                />
                <OptionButton
                  selected={settings.layout === 'single'}
                  disabled={generating}
                  onClick={() => setLayout('single')}
                  title="Single"
                  detail="One photo"
                />
                <OptionButton
                  selected={settings.layout === 'story3'}
                  disabled={photos.length < 3 || generating}
                  onClick={() => setLayout('story3')}
                  title="IG Story"
                  detail={photos.length < 3 ? 'Needs 3' : '1080×1920'}
                />
                <OptionButton
                  selected={settings.layout === 'portrait2'}
                  disabled={photos.length < 2 || generating}
                  onClick={() => setLayout('portrait2')}
                  title="IG Portrait"
                  detail={photos.length < 2 ? 'Needs 2' : '1080×1920'}
                />
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="font-serif text-lg text-ink">Frame</legend>
              <div className="grid grid-cols-5 gap-1.5">
                {FRAME_BACKGROUNDS.map((frame) => {
                  const selected = settings.background === frame.id
                  return (
                    <button
                      key={frame.id}
                      type="button"
                      disabled={generating}
                      onClick={() => setBackground(frame.id)}
                      aria-pressed={selected}
                      className={[
                        'flex flex-col items-center gap-1 rounded-xl border px-1 py-1.5 transition disabled:opacity-50',
                        selected
                          ? 'border-sage bg-sage/10'
                          : 'border-blush/70 hover:bg-blush/25',
                      ].join(' ')}
                    >
                      <span
                        className="h-6 w-6 rounded-full border border-ink/10 shadow-sm"
                        style={{ backgroundColor: frame.color }}
                        aria-hidden="true"
                      />
                      <span className="text-center text-[0.58rem] leading-tight text-taupe">
                        {frame.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="font-serif text-lg text-ink">Filter</legend>
              <div className="grid grid-cols-4 gap-1.5">
                {PHOTO_FILTERS.map((filter) => (
                  <OptionButton
                    key={filter.id}
                    selected={settings.filter === filter.id}
                    disabled={generating}
                    onClick={() => setFilter(filter.id)}
                    title={filter.label}
                    detail={filter.detail}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="font-serif text-lg text-ink">Flowers</legend>
              <div className="grid grid-cols-3 gap-1.5">
                {flowerStickers.map((sticker) => (
                  <StickerToggle
                    key={sticker.id}
                    src={sticker.src}
                    label={sticker.label}
                    selected={settings.stickers.some((item) => item.id === sticker.id)}
                    disabled={generating}
                    onClick={() => toggleSticker(sticker.id)}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="font-serif text-lg text-ink">Silly Steph</legend>
              <div className="grid grid-cols-4 gap-1.5">
                {stephStickers.map((sticker) => (
                  <StickerToggle
                    key={sticker.id}
                    src={sticker.src}
                    label={sticker.label}
                    selected={settings.stickers.some((item) => item.id === sticker.id)}
                    disabled={generating}
                    onClick={() => toggleSticker(sticker.id)}
                  />
                ))}
              </div>
              <p className="text-[0.65rem] text-taupe">
                Drag stickers on the preview to place them.
              </p>
            </fieldset>

            <label className="block space-y-1.5">
              <span className="font-serif text-lg text-ink">Caption (optional)</span>
              <input
                value={settings.caption}
                onChange={(event) =>
                  onChange({ ...settings, caption: event.target.value.slice(0, 80) })
                }
                disabled={generating}
                maxLength={80}
                className="w-full rounded-xl border border-blush/80 bg-white/70 px-3 py-2 text-sm text-taupe outline-none ring-sage/40 focus:ring-2 disabled:opacity-60"
                placeholder="Short line above the title"
              />
            </label>
          </div>

          <div className="space-y-2 border-t border-blush/50 p-3">
            {saveStatus === 'saved' || saveStatus === 'shared' ? (
              <p className="text-xs text-sage" role="status">
                Photo downloaded. Start a new session when you&apos;re ready for the next guest.
              </p>
            ) : null}
            {saveStatus === 'failed' || saveStatus === 'manual' ? (
              <p className="text-xs text-[#9B5B5B]" role="status">
                If download didn&apos;t start, long-press the preview and choose Save Image.
              </p>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                onClick={onDownload}
                disabled={generating || photos.length === 0 || !previewUrl}
                className="w-full py-3 text-sm sm:flex-1"
              >
                {generating || saveStatus === 'preparing' ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}
                {generating || saveStatus === 'preparing' ? 'Preparing…' : 'Download'}
              </Button>
              <Button
                variant="secondary"
                onClick={onNewSession}
                disabled={generating}
                className="w-full py-2.5 text-sm sm:flex-1"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                New session
              </Button>
              <Button
                variant="ghost"
                onClick={onRetakeAll}
                disabled={generating}
                className="w-full py-2.5 text-sm sm:w-auto"
              >
                Retake all
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StickerToggle({
  src,
  label,
  selected,
  disabled,
  onClick,
}: {
  src: string
  label: string
  selected: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'flex flex-col items-center gap-1 rounded-xl border px-1.5 py-2 transition disabled:opacity-50',
        selected ? 'border-sage bg-sage/10' : 'border-blush/70 hover:bg-blush/25',
      ].join(' ')}
    >
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white/70">
        <img src={src} alt="" className="max-h-9 max-w-9 object-contain" />
      </span>
      <span className="text-center text-[0.58rem] leading-tight text-taupe">{label}</span>
    </button>
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
        'rounded-xl border px-2 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-50',
        selected ? 'border-sage bg-sage/10' : 'border-blush/80 hover:bg-blush/30',
      ].join(' ')}
    >
      <p className="font-serif text-sm text-ink sm:text-base">{title}</p>
      <p className="text-[0.65rem] text-taupe">{detail}</p>
    </button>
  )
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
