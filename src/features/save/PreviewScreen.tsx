import {
  Download,
  ImageDown,
  LoaderCircle,
  RefreshCw,
  Share2,
  Sparkles,
} from 'lucide-react'
import { eventConfig } from '../../config/event'
import { FloralDecor } from '../../components/floral/FloralDecor'
import { Button } from '../../components/ui/Button'
import type { SaveStatus } from '../../types/photo'

interface PreviewScreenProps {
  imageUrl: string
  saveStatus: SaveStatus
  canShare: boolean
  showManualFallback: boolean
  onSave: () => void
  onShare: () => void
  onRetake: () => void
  onNewSession: () => void
}

export function PreviewScreen({
  imageUrl,
  saveStatus,
  canShare,
  showManualFallback,
  onSave,
  onShare,
  onRetake,
  onNewSession,
}: PreviewScreenProps) {
  const saving = saveStatus === 'preparing'

  return (
    <section className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-6">
      <FloralDecor density="subtle" />

      <div className="relative z-10 mb-4 text-center lg:text-left">
        <p className="font-script text-xl text-sage sm:text-2xl">{eventConfig.completionMessage}</p>
        <h2 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">
          Your garden keepsake
        </h2>
      </div>

      <div className="relative z-10 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div
          className={[
            'flex items-center justify-center rounded-[1.5rem] border border-blush/70 bg-ivory/85 p-3 shadow-soft sm:p-4',
            saveStatus === 'saved' || saveStatus === 'shared' ? 'success-glow' : '',
          ].join(' ')}
        >
          <img
            src={imageUrl}
            alt="Finished photo booth composition"
            className="max-h-[70vh] w-auto max-w-full rounded-xl shadow-soft"
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-blush/70 bg-ivory/90 p-4 shadow-soft sm:p-5">
            <StatusMessage status={saveStatus} canShare={canShare} />

            {showManualFallback ? (
              <div className="mb-4 rounded-2xl border border-butter bg-butter/40 px-4 py-3 text-sm text-ink">
                If the download didn&apos;t start, long-press the photo and choose
                &ldquo;Save Image.&rdquo;
              </div>
            ) : null}

            <div className="flex flex-col gap-3">
              <Button
                onClick={onSave}
                disabled={saving}
                className="w-full py-4 text-base"
              >
                {saving ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="h-5 w-5" aria-hidden="true" />
                )}
                {saving ? 'Preparing your photo…' : 'Save Photo'}
              </Button>

              {canShare ? (
                <Button
                  variant="secondary"
                  onClick={onShare}
                  disabled={saving}
                  className="w-full"
                >
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  Save to Photos / Share
                </Button>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" onClick={onRetake} disabled={saving}>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Back to review
                </Button>
                <Button variant="secondary" onClick={onNewSession} disabled={saving}>
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  New session
                </Button>
              </div>
            </div>

            <p className="mt-4 flex items-start gap-2 text-xs text-taupe/70">
              <ImageDown className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Saving stays on this device. Browsers do not confirm the final folder —
              check Downloads on a laptop, or Photos/Files on a phone.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatusMessage({
  status,
  canShare,
}: {
  status: SaveStatus
  canShare: boolean
}) {
  if (status === 'preparing') {
    return (
      <p className="mb-4 text-sm text-taupe" role="status">
        Preparing your photo…
      </p>
    )
  }
  if (status === 'saved') {
    return (
      <p className="mb-4 text-sm text-sage" role="status">
        Your photo is ready. Check your Downloads folder
        {canShare ? ' (or Photos if you used Share)' : ''}.
      </p>
    )
  }
  if (status === 'shared') {
    return (
      <p className="mb-4 text-sm text-sage" role="status">
        Share sheet opened. Save the image to Photos if you&apos;d like to keep it.
      </p>
    )
  }
  if (status === 'failed') {
    return (
      <p className="mb-4 text-sm text-[#9B5B5B]" role="alert">
        We couldn&apos;t save your photo just yet. Please try again — your photo is
        still here.
      </p>
    )
  }
  if (status === 'manual') {
    return (
      <p className="mb-4 text-sm text-taupe" role="status">
        Automatic download isn&apos;t available here. Long-press the photo and choose
        Save Image.
      </p>
    )
  }
  return (
    <p className="mb-4 text-sm text-taupe" role="status">
      Ready to save your keepsake.
    </p>
  )
}
