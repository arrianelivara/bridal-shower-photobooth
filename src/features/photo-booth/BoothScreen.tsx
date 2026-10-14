import {
  AlertCircle,
  Camera,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  SwitchCamera,
} from 'lucide-react'
import type { RefObject } from 'react'
import { FloralDecor } from '../../components/floral/FloralDecor'
import { Button } from '../../components/ui/Button'
import type { CameraError } from '../../services/camera'
import type { CapturePhase, CapturedPhoto, LayoutType } from '../../types/photo'

interface BoothScreenProps {
  layout: LayoutType
  phase: CapturePhase
  countdown: number | null
  currentIndex: number
  totalShots: number
  photos: CapturedPhoto[]
  reviewUrl: string | null
  deviceCount: number
  busy: boolean
  cameraStatus: 'loading' | 'ready' | 'error'
  cameraError: CameraError | null
  isRetaking?: boolean
  videoRef: RefObject<HTMLVideoElement | null>
  onCapture: () => void
  onRetake: () => void
  onSwitchCamera: () => void
  onStartOver: () => void
  onRetryCamera: () => void
  onBack: () => void
}

export function BoothScreen({
  layout,
  phase,
  countdown,
  currentIndex,
  totalShots,
  photos,
  reviewUrl,
  deviceCount,
  busy,
  cameraStatus,
  cameraError,
  isRetaking = false,
  videoRef,
  onCapture,
  onRetake,
  onSwitchCamera,
  onStartOver,
  onRetryCamera,
  onBack,
}: BoothScreenProps) {
  const shotLabel = Math.min(currentIndex + 1, totalShots)
  const showingReview = phase === 'review' && Boolean(reviewUrl)
  const sequenceRunning =
    phase === 'countdown' ||
    phase === 'flash' ||
    showingReview ||
    (photos.length > 0 && !isRetaking)
  const canStart =
    cameraStatus === 'ready' &&
    phase === 'ready' &&
    !busy &&
    (photos.length === 0 || isRetaking)

  return (
    <section className="relative mx-auto flex min-h-dvh w-full max-w-[1400px] flex-col px-3 py-3 sm:px-5 sm:py-4 lg:px-6">
      <FloralDecor density="subtle" />

      <div className="relative z-10 mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-script text-lg leading-none text-sage sm:text-xl">Photo booth</p>
          <h2 className="font-serif text-lg leading-tight text-ink sm:text-2xl">
            {layout === 'strip2'
              ? 'Two-frame strip'
              : layout === 'strip3'
                ? 'Three-frame strip'
                : layout === 'story3'
                  ? 'IG Story · 3 photos'
                  : layout === 'portrait2'
                    ? 'IG Portrait · 2 photos'
                    : 'One lovely portrait'}
          </h2>
        </div>
        <p className="rounded-full border border-blush bg-ivory/90 px-3 py-1 text-xs text-taupe">
          Shot {shotLabel} of {totalShots}
        </p>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3">
        <div className="relative min-h-[58vh] flex-1 overflow-hidden rounded-[1.5rem] border-2 border-blush/90 bg-[#2c2823] shadow-soft ring-4 ring-ivory/70 sm:min-h-[64vh]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={[
              'absolute inset-0 h-full w-full -scale-x-100 object-cover',
              showingReview ? 'invisible' : 'visible',
            ].join(' ')}
          />

          {showingReview && reviewUrl ? (
            <img
              src={reviewUrl}
              alt={`Captured shot ${shotLabel}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}

          {cameraStatus === 'loading' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/40 text-ivory">
              <LoaderCircle className="h-8 w-8 animate-spin" aria-hidden="true" />
              <p>Opening the garden camera…</p>
            </div>
          ) : null}

          {cameraStatus === 'error' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/50 px-6 text-center text-ivory">
              <AlertCircle className="h-8 w-8" aria-hidden="true" />
              <p className="max-w-md text-sm sm:text-base">
                {cameraError?.message ?? 'Camera could not be started.'}
              </p>
            </div>
          ) : null}

          {phase === 'countdown' && countdown !== null ? (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/35">
              <span
                key={countdown}
                className="countdown-pop font-serif text-8xl text-ivory drop-shadow-lg sm:text-9xl"
                aria-live="assertive"
              >
                {countdown}
              </span>
            </div>
          ) : null}

          {phase === 'flash' ? (
            <div className="absolute inset-0 bg-ivory/80" aria-hidden="true" />
          ) : null}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/45 to-transparent px-5 pb-3 pt-12">
            <p className="text-center text-xs text-ivory/95 sm:text-sm">
              {cameraStatus === 'error'
                ? 'Allow camera access, then try again.'
                : showingReview
                  ? totalShots > 1 && photos.length + 1 < totalShots
                    ? 'Cute! Next shot coming right up…'
                    : 'Got it — finishing your session…'
                  : phase === 'countdown'
                    ? 'Smile — capturing in a moment.'
                    : photos.length > 0
                      ? 'Hang tight — the next countdown starts automatically.'
                      : isRetaking
                        ? `Retaking shot ${shotLabel} — smile!`
                        : totalShots > 1
                          ? 'Press Start once — we will capture all shots for you.'
                          : 'Press Start when everyone is ready.'}
            </p>
          </div>
        </div>

        {/* Compact control strip — stacks on mobile, single row on larger screens */}
        <aside className="mx-auto flex w-full max-w-xl flex-col items-stretch gap-2 rounded-2xl border border-blush/60 bg-ivory/90 px-2.5 py-2 shadow-soft sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:px-4">
          {cameraStatus === 'error' ? (
            <div className="flex flex-wrap items-center justify-center gap-2 py-1">
              <p className="max-w-xs text-center text-xs text-[#7A4545]">
                {cameraError?.code === 'permission-denied'
                  ? 'Allow camera in the address bar, then retry.'
                  : 'Camera busy — close other apps, then retry.'}
              </p>
              <Button onClick={onRetryCamera} className="px-3 py-2 text-xs">
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Retry
              </Button>
              <Button variant="ghost" onClick={onBack} className="px-3 py-2 text-xs">
                Back
              </Button>
            </div>
          ) : (
            <>
              <div
                className="flex shrink-0 justify-center gap-1 sm:gap-1.5"
                aria-label={`Strip preview, ${photos.length} of ${totalShots} taken`}
              >
                {Array.from({ length: totalShots }).map((_, index) => {
                  const photo = photos[index]
                  const isCurrent =
                    index === currentIndex &&
                    cameraStatus === 'ready' &&
                    (phase === 'ready' ||
                      phase === 'countdown' ||
                      phase === 'flash' ||
                      showingReview)
                  return (
                    <div
                      key={`slot-${index}`}
                      className={[
                        'h-7 w-11 overflow-hidden rounded-md border sm:h-10 sm:w-16',
                        isCurrent ? 'border-sage' : 'border-blush/80 bg-blush/25',
                      ].join(' ')}
                    >
                      {photo ? (
                        <img
                          src={photo.objectUrl}
                          alt={`Shot ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-taupe/55">
                          {index + 1}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                {showingReview ? (
                  <Button
                    variant="secondary"
                    onClick={onRetake}
                    className="min-h-9 px-3 py-2 text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Retake
                  </Button>
                ) : (
                  <Button
                    onClick={onCapture}
                    disabled={!canStart}
                    className="min-h-9 min-w-[5.5rem] px-3 py-2 text-xs sm:min-w-0 sm:px-4 sm:text-sm"
                  >
                    <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                    {sequenceRunning && !isRetaking
                      ? '…'
                      : isRetaking
                        ? 'Retake'
                        : 'Start'}
                  </Button>
                )}

                {deviceCount > 1 &&
                cameraStatus === 'ready' &&
                phase === 'ready' &&
                (photos.length === 0 || isRetaking) ? (
                  <Button
                    variant="ghost"
                    onClick={onSwitchCamera}
                    disabled={busy}
                    className="min-h-9 px-2 py-2 text-xs"
                    aria-label="Switch camera"
                  >
                    <SwitchCamera className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                ) : null}

                <Button
                  variant="danger"
                  onClick={onStartOver}
                  disabled={photos.length === 0 && !showingReview && phase === 'ready'}
                  className="min-h-9 px-2.5 py-2 text-xs"
                >
                  Reset
                </Button>

                {cameraStatus === 'ready' && photos.length === 0 && phase === 'ready' ? (
                  <Button
                    variant="ghost"
                    onClick={onBack}
                    className="min-h-9 px-2.5 py-2 text-xs"
                  >
                    Back
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </aside>
      </div>
    </section>
  )
}
