import { buildExportFilename } from './imageExport'

export type DownloadResult =
  | { method: 'download' }
  | { method: 'share' }
  | { method: 'manual' }

function isMobileLike(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

export function canShareFiles(file: File): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.canShare !== 'function') {
    return false
  }
  try {
    return navigator.canShare({ files: [file] })
  } catch {
    return false
  }
}

export async function saveBlobToDevice(blob: Blob): Promise<DownloadResult> {
  const filename = buildExportFilename()
  const file = new File([blob], filename, { type: blob.type || 'image/png' })

  if (isMobileLike() && canShareFiles(file) && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        files: [file],
        title: "Stephanie's Garden",
      })
      return { method: 'share' }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error
      }
      // Fall through to download / manual.
    }
  }

  try {
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = filename
    anchor.rel = 'noopener'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000)
    return { method: 'download' }
  } catch {
    return { method: 'manual' }
  }
}
