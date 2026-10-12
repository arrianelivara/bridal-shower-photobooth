import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { eventConfig } from './config/event'
import { ConfirmDialog } from './components/ui/ConfirmDialog'
import { BoothScreen } from './features/photo-booth/BoothScreen'
import { WelcomeScreen } from './features/photo-booth/WelcomeScreen'
import { ReviewScreen } from './features/photo-booth/ReviewScreen'
import { PreviewScreen } from './features/save/PreviewScreen'
import { useIdleTimeout } from './hooks/useIdleTimeout'
import { CameraError, cameraService } from './services/camera'
import { canShareFiles, saveBlobToDevice } from './services/download'
import { enterFullscreen, exitFullscreen } from './lib/fullscreen'
import { buildExportFilename, composePhoto } from './services/imageExport'
import type {
  AppStep,
  CapturePhase,
  CapturedPhoto,
  CompositionSettings,
  LayoutType,
  SaveStatus,
} from './types/photo'
import { defaultCompositionSettings, shotCountForLayout } from './types/photo'

const REVIEW_HOLD_MS = 1100
const NEXT_SHOT_DELAY_MS = 450

function revokePhotos(photos: CapturedPhoto[]): void {
  for (const photo of photos) {
    URL.revokeObjectURL(photo.objectUrl)
  }
}

function createPhoto(blob: Blob): CapturedPhoto {
  return {
    id: crypto.randomUUID(),
    blob,
    objectUrl: URL.createObjectURL(blob),
  }
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const countdownTimerRef = useRef<number | null>(null)
  const autoAdvanceTimerRef = useRef<number | null>(null)
  const savingLockRef = useRef(false)
  const generatingLockRef = useRef(false)
  const photosRef = useRef<CapturedPhoto[]>([])
  const totalShotsRef = useRef<number>(2)
  const startCountdownRef = useRef<() => void>(() => {})
  const retakeAfterRef = useRef<CapturedPhoto[] | null>(null)
  const retakeIndexRef = useRef<number | null>(null)

  const [step, setStep] = useState<AppStep>('welcome')
  const [layout, setLayout] = useState<LayoutType>('strip2')
  const [isRetaking, setIsRetaking] = useState(false)
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null)
  const [cameraStatus, setCameraStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  )
  const [cameraError, setCameraError] = useState<CameraError | null>(null)
  const [deviceCount, setDeviceCount] = useState(0)
  const [phase, setPhase] = useState<CapturePhase>('ready')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [photos, setPhotos] = useState<CapturedPhoto[]>([])
  const [reviewPhoto, setReviewPhoto] = useState<CapturedPhoto | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmKind, setConfirmKind] = useState<'start-over' | 'new-session'>(
    'start-over',
  )

  const [settings, setSettings] = useState<CompositionSettings>(() =>
    defaultCompositionSettings('strip2', eventConfig.defaultCaption),
  )
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null)
  const [finalUrl, setFinalUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('ready')
  const [showManualFallback, setShowManualFallback] = useState(false)

  const totalShots = shotCountForLayout(layout)
  const currentIndex = photos.length

  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  useEffect(() => {
    totalShotsRef.current = totalShots
  }, [totalShots])

  const attachStream = useCallback(async () => {
    const stream = cameraService.getStream()
    const video = videoRef.current
    if (!stream || !video) return
    video.srcObject = stream
    try {
      await video.play()
    } catch {
      // Autoplay can fail briefly; preview still usually attaches.
    }
  }, [])

  const startCamera = useCallback(async () => {
    setCameraStatus('loading')
    setCameraError(null)
    try {
      const result = await cameraService.start()
      setDeviceCount(result.devices.length)
      setCameraStatus('ready')
      await attachStream()
    } catch (error) {
      const cameraErr =
        error instanceof CameraError
          ? error
          : new CameraError('unknown', 'We could not start the camera.')
      setCameraError(cameraErr)
      setCameraStatus('error')
    }
  }, [attachStream])

  const clearCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
    setCountdown(null)
  }, [])

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current)
      autoAdvanceTimerRef.current = null
    }
  }, [])

  const clearSessionPhotos = useCallback(() => {
    clearCountdown()
    clearAutoAdvance()
    setPhotos((prev) => {
      revokePhotos(prev)
      return []
    })
    setReviewPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev.objectUrl)
      return null
    })
    if (finalUrl) URL.revokeObjectURL(finalUrl)
    setFinalBlob(null)
    setFinalUrl(null)
    setSaveStatus('ready')
    setShowManualFallback(false)
    setGenerating(false)
    setPhase('ready')
    setCountdown(null)
    setBusy(false)
  }, [clearAutoAdvance, clearCountdown, finalUrl])

  const resetToWelcome = useCallback(() => {
    clearCountdown()
    clearAutoAdvance()
    cameraService.stop()
    retakeIndexRef.current = null
    retakeAfterRef.current = null
    setRetakeIndex(null)
    setIsRetaking(false)
    clearSessionPhotos()
    setSettings(defaultCompositionSettings('strip2', eventConfig.defaultCaption))
    setLayout('strip2')
    setBusy(false)
    savingLockRef.current = false
    setStep('welcome')
    void exitFullscreen()
  }, [clearAutoAdvance, clearCountdown, clearSessionPhotos])

  useIdleTimeout(step === 'preview', eventConfig.idleTimeoutMs, resetToWelcome)

  useEffect(() => {
    if (step === 'booth') {
      void attachStream()
    }
  }, [step, cameraStatus, phase, attachStream])

  useEffect(() => {
    return () => {
      clearCountdown()
      clearAutoAdvance()
      cameraService.stop()
    }
  }, [clearAutoAdvance, clearCountdown])

  const goToReview = useCallback(
    (nextPhotos: CapturedPhoto[]) => {
      setPhotos(nextPhotos)
      setReviewPhoto(null)
      setPhase('ready')
      setBusy(false)
      cameraService.stop()
      setSettings((prev) => ({ ...prev, layout }))
      setStep('review')
    },
    [layout],
  )

  const acceptPhotoAndContinue = useCallback(
    (photo: CapturedPhoto) => {
      clearAutoAdvance()

      // Single-slot retake from the review screen
      if (retakeIndexRef.current !== null && retakeAfterRef.current) {
        const nextPhotos = [
          ...photosRef.current,
          photo,
          ...retakeAfterRef.current,
        ]
        retakeIndexRef.current = null
        retakeAfterRef.current = null
        setRetakeIndex(null)
        setIsRetaking(false)
        setPhotos(nextPhotos)
        setReviewPhoto(null)
        goToReview(nextPhotos)
        return
      }

      const nextPhotos = [...photosRef.current, photo]
      setPhotos(nextPhotos)
      setReviewPhoto(null)

      if (nextPhotos.length >= totalShotsRef.current) {
        goToReview(nextPhotos)
        return
      }

      setPhase('ready')
      setBusy(false)
      autoAdvanceTimerRef.current = window.setTimeout(() => {
        startCountdownRef.current()
      }, NEXT_SHOT_DELAY_MS)
    },
    [clearAutoAdvance, goToReview],
  )

  const captureNow = useCallback(async () => {
    const video = videoRef.current
    if (!video) {
      setBusy(false)
      setPhase('ready')
      return
    }

    setPhase('flash')
    try {
      const blob = await cameraService.captureFromVideo(video)
      const photo = createPhoto(blob)
      setReviewPhoto(photo)
      setPhase('review')
      clearAutoAdvance()
      autoAdvanceTimerRef.current = window.setTimeout(() => {
        acceptPhotoAndContinue(photo)
      }, REVIEW_HOLD_MS)
    } catch {
      setPhase('ready')
      setBusy(false)
    }
  }, [acceptPhotoAndContinue, clearAutoAdvance])

  const startCountdown = useCallback(() => {
    clearAutoAdvance()
    clearCountdown()
    setBusy(true)
    setPhase('countdown')
    let remaining = eventConfig.countdownSeconds
    setCountdown(remaining)

    countdownTimerRef.current = window.setInterval(() => {
      remaining -= 1
      if (remaining <= 0) {
        if (countdownTimerRef.current) {
          window.clearInterval(countdownTimerRef.current)
          countdownTimerRef.current = null
        }
        setCountdown(null)
        void captureNow()
        return
      }
      setCountdown(remaining)
    }, 1000)
  }, [captureNow, clearAutoAdvance, clearCountdown])

  useEffect(() => {
    startCountdownRef.current = startCountdown
  }, [startCountdown])

  const handleStart = () => {
    setSettings((prev) => ({ ...prev, layout }))
    setStep('booth')
    void enterFullscreen()
    void startCamera()
  }

  const handleSwitchCamera = async () => {
    setBusy(true)
    try {
      const result = await cameraService.switchCamera()
      setDeviceCount(result.devices.length)
      setCameraStatus('ready')
      await attachStream()
    } catch (error) {
      if (error instanceof CameraError) setCameraError(error)
    } finally {
      setBusy(false)
    }
  }

  const handleCapture = () => {
    if (busy || phase !== 'ready' || cameraStatus !== 'ready') return
    if (photos.length > 0 && !isRetaking) return
    startCountdown()
  }

  const handleRetakeAt = async (index: number) => {
    const current = photosRef.current
    if (index < 0 || index >= current.length) return

    clearCountdown()
    clearAutoAdvance()

    const removed = current[index]
    if (removed) URL.revokeObjectURL(removed.objectUrl)

    const before = current.slice(0, index)
    const after = current.slice(index + 1)
    retakeIndexRef.current = index
    retakeAfterRef.current = after
    setRetakeIndex(index)
    setIsRetaking(true)
    setPhotos(before)
    setReviewPhoto(null)
    setPhase('ready')
    setBusy(false)

    if (finalUrl) {
      URL.revokeObjectURL(finalUrl)
      setFinalUrl(null)
    }
    setFinalBlob(null)

    setStep('booth')
    await startCamera()
    // Brief beat so the video element can attach before countdown
    window.setTimeout(() => {
      startCountdownRef.current()
    }, 350)
  }

  const handleDownloadFromReview = async () => {
    if (generatingLockRef.current || savingLockRef.current || photos.length === 0) {
      return
    }
    generatingLockRef.current = true
    savingLockRef.current = true
    setGenerating(true)
    setSaveStatus('preparing')
    setShowManualFallback(false)
    try {
      const blob = await composePhoto(photos, settings)
      const url = URL.createObjectURL(blob)
      setFinalBlob(blob)
      setFinalUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })

      const result = await saveBlobToDevice(blob)
      if (result.method === 'share') {
        setSaveStatus('shared')
      } else if (result.method === 'manual') {
        setSaveStatus('manual')
        setShowManualFallback(true)
      } else {
        setSaveStatus('saved')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setSaveStatus('ready')
      } else {
        setSaveStatus('failed')
        setShowManualFallback(true)
      }
    } finally {
      setGenerating(false)
      generatingLockRef.current = false
      savingLockRef.current = false
    }
  }

  const handleRetakeShot = () => {
    clearAutoAdvance()
    setReviewPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev.objectUrl)
      return null
    })
    startCountdown()
  }

  const requestStartOver = () => {
    if (photos.length === 0 && !reviewPhoto && phase === 'ready') {
      return
    }
    setConfirmKind('start-over')
    setConfirmOpen(true)
  }

  const confirmAction = () => {
    setConfirmOpen(false)
    if (confirmKind === 'new-session') {
      resetToWelcome()
      return
    }
    clearSessionPhotos()
    setBusy(false)
    setPhase('ready')
    if (!cameraService.getStream()) {
      void startCamera()
    }
  }

  const handleRetakeAll = async () => {
    retakeIndexRef.current = null
    retakeAfterRef.current = null
    setRetakeIndex(null)
    setIsRetaking(false)
    clearSessionPhotos()
    setSettings((prev) => ({ ...prev, layout }))
    setStep('booth')
    await startCamera()
  }

  const handleBackToReview = () => {
    if (finalUrl) {
      URL.revokeObjectURL(finalUrl)
      setFinalUrl(null)
    }
    setFinalBlob(null)
    setSaveStatus('ready')
    setShowManualFallback(false)
    setStep('review')
  }

  const performSave = async (preferShare: boolean) => {
    if (!finalBlob || savingLockRef.current) return
    savingLockRef.current = true
    setSaveStatus('preparing')
    setShowManualFallback(false)

    try {
      if (preferShare) {
        const file = new File([finalBlob], buildExportFilename(), {
          type: 'image/png',
        })
        if (canShareFiles(file) && navigator.share) {
          await navigator.share({
            files: [file],
            title: eventConfig.gardenTitle,
          })
          setSaveStatus('shared')
          return
        }
      }

      const result = await saveBlobToDevice(finalBlob)
      if (result.method === 'share') {
        setSaveStatus('shared')
      } else if (result.method === 'manual') {
        setSaveStatus('manual')
        setShowManualFallback(true)
      } else {
        setSaveStatus('saved')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setSaveStatus('ready')
      } else {
        setSaveStatus('failed')
        setShowManualFallback(true)
      }
    } finally {
      savingLockRef.current = false
    }
  }

  const shareAvailable = useMemo(() => {
    if (!finalBlob) return false
    const file = new File([finalBlob], 'photo.png', { type: 'image/png' })
    return canShareFiles(file)
  }, [finalBlob])

  return (
    <main className="relative min-h-dvh">
      {step === 'welcome' ? (
        <WelcomeScreen
          layout={layout}
          onLayoutChange={setLayout}
          onStart={handleStart}
        />
      ) : null}

      {step === 'booth' ? (
        <BoothScreen
          layout={layout}
          phase={phase}
          countdown={countdown}
          currentIndex={isRetaking && retakeIndex !== null ? retakeIndex : currentIndex}
          totalShots={totalShots}
          photos={photos}
          reviewUrl={reviewPhoto?.objectUrl ?? null}
          deviceCount={deviceCount}
          busy={busy}
          cameraStatus={cameraStatus}
          cameraError={cameraError}
          isRetaking={isRetaking}
          videoRef={videoRef}
          onCapture={handleCapture}
          onRetake={handleRetakeShot}
          onSwitchCamera={() => void handleSwitchCamera()}
          onStartOver={requestStartOver}
          onRetryCamera={() => void startCamera()}
          onBack={() => {
            clearCountdown()
            clearAutoAdvance()
            retakeIndexRef.current = null
            retakeAfterRef.current = null
            setRetakeIndex(null)
            setIsRetaking(false)
            cameraService.stop()
            clearSessionPhotos()
            setStep('welcome')
          }}
        />
      ) : null}

      {step === 'review' ? (
        <ReviewScreen
          photos={photos}
          settings={settings}
          generating={generating}
          saveStatus={saveStatus}
          onChange={setSettings}
          onDownload={() => void handleDownloadFromReview()}
          onNewSession={() => {
            setConfirmKind('new-session')
            setConfirmOpen(true)
          }}
          onRetakeAt={(index) => void handleRetakeAt(index)}
          onRetakeAll={() => void handleRetakeAll()}
        />
      ) : null}

      {step === 'preview' && finalUrl ? (
        <PreviewScreen
          imageUrl={finalUrl}
          saveStatus={saveStatus}
          canShare={shareAvailable}
          showManualFallback={showManualFallback}
          onSave={() => void performSave(false)}
          onShare={() => void performSave(true)}
          onRetake={handleBackToReview}
          onNewSession={() => {
            setConfirmKind('new-session')
            setConfirmOpen(true)
          }}
        />
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title={confirmKind === 'new-session' ? 'Start a new session?' : 'Start over?'}
        message={
          confirmKind === 'new-session'
            ? 'This clears the finished photo from memory on this shared laptop so the next guest can begin.'
            : 'This discards the photos captured in this session. This cannot be undone.'
        }
        confirmLabel={confirmKind === 'new-session' ? 'New session' : 'Discard photos'}
        onConfirm={confirmAction}
        onCancel={() => setConfirmOpen(false)}
      />
    </main>
  )
}
