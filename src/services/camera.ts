export type CameraErrorCode =
  | 'unsupported'
  | 'permission-denied'
  | 'not-found'
  | 'unavailable'
  | 'unknown'

export class CameraError extends Error {
  readonly code: CameraErrorCode

  constructor(code: CameraErrorCode, message: string) {
    super(message)
    this.name = 'CameraError'
    this.code = code
  }
}

export interface CameraStartResult {
  stream: MediaStream
  devices: MediaDeviceInfo[]
  deviceId: string | null
}

function mapDomError(error: unknown): CameraError {
  if (error instanceof CameraError) return error
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return new CameraError(
        'permission-denied',
        'Camera access was denied. Please allow camera permission in your browser settings, then try again.',
      )
    }
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return new CameraError(
        'not-found',
        'No camera was found on this device.',
      )
    }
    if (
      error.name === 'NotReadableError' ||
      error.name === 'TrackStartError' ||
      error.name === 'AbortError'
    ) {
      return new CameraError(
        'unavailable',
        'The camera is busy or unavailable. Close other apps using the camera and try again.',
      )
    }
  }
  return new CameraError(
    'unknown',
    'We could not start the camera. Please try again.',
  )
}

export class CameraService {
  private stream: MediaStream | null = null
  private currentDeviceId: string | null = null

  isSupported(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    )
  }

  getStream(): MediaStream | null {
    return this.stream
  }

  getCurrentDeviceId(): string | null {
    return this.currentDeviceId
  }

  async listVideoDevices(): Promise<MediaDeviceInfo[]> {
    if (!this.isSupported()) return []
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter((device) => device.kind === 'videoinput')
  }

  async start(preferredDeviceId?: string): Promise<CameraStartResult> {
    if (!this.isSupported()) {
      throw new CameraError(
        'unsupported',
        'Camera access is not supported in this browser. Please use Chrome, Edge, or Safari over HTTPS or localhost.',
      )
    }

    this.stop()

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: preferredDeviceId
        ? {
            deviceId: { exact: preferredDeviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        : {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      this.stream = stream
      const track = stream.getVideoTracks()[0]
      this.currentDeviceId = track?.getSettings().deviceId ?? preferredDeviceId ?? null
      const devices = await this.listVideoDevices()
      return {
        stream,
        devices,
        deviceId: this.currentDeviceId,
      }
    } catch (error) {
      throw mapDomError(error)
    }
  }

  async switchCamera(): Promise<CameraStartResult> {
    const devices = await this.listVideoDevices()
    if (devices.length < 2) {
      throw new CameraError(
        'not-found',
        'Only one camera is available on this device.',
      )
    }

    const currentIndex = devices.findIndex(
      (device) => device.deviceId === this.currentDeviceId,
    )
    const next = devices[(currentIndex + 1) % devices.length]
    return this.start(next.deviceId)
  }

  stop(): void {
    if (!this.stream) return
    for (const track of this.stream.getTracks()) {
      track.stop()
    }
    this.stream = null
  }

  captureFromVideo(video: HTMLVideoElement): Promise<Blob> {
    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) {
      return Promise.reject(
        new CameraError('unavailable', 'Camera preview is not ready yet.'),
      )
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return Promise.reject(
        new CameraError('unknown', 'Could not capture a frame from the camera.'),
      )
    }

    // Mirror selfie preview into the captured image for a natural result.
    ctx.translate(width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, width, height)

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new CameraError('unknown', 'Could not capture a frame from the camera.'),
            )
            return
          }
          resolve(blob)
        },
        'image/jpeg',
        0.92,
      )
    })
  }
}

export const cameraService = new CameraService()
