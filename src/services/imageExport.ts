import { STICKER_OPTIONS, frameTheme } from '../config/compose'
import { eventConfig } from '../config/event'
import type {
  CapturedPhoto,
  CompositionSettings,
  LayoutType,
  PhotoFilter,
  PlacedSticker,
} from '../types/photo'
import { isPortraitLayout, isStoryLayout, shotCountForLayout } from '../types/photo'

/** Classic booth strip proportions. */
const STRIP_WIDTH = 900
const STRIP_SIDE_PAD = 56
const STRIP_TOP_PAD = 56
const STRIP_PHOTO_GAP = 28
const STRIP_FOOTER_HEIGHT = 200

/** Instagram Stories export size (9:16). */
const STORY_WIDTH = 1080
const STORY_HEIGHT = 1920
const STORY_SIDE_PAD = 48
const STORY_TOP_PAD = 72
const STORY_PHOTO_GAP = 28
const STORY_FOOTER_HEIGHT = 220

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load image.'))
    image.src = url
  })
}

/**
 * Safari ignores `ctx.filter` on a clipped photo, so filters are applied to
 * the cropped pixels directly. Values match the CSS filter definitions.
 */
function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  filter: PhotoFilter,
): void {
  const destWidth = Math.max(1, Math.round(width))
  const destHeight = Math.max(1, Math.round(height))
  const scale = Math.max(destWidth / image.width, destHeight / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  const offsetX = (destWidth - drawWidth) / 2
  const offsetY = (destHeight - drawHeight) / 2

  const layer = document.createElement('canvas')
  layer.width = destWidth
  layer.height = destHeight
  const layerCtx = layer.getContext('2d', { willReadFrequently: true })
  if (!layerCtx) return
  layerCtx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
  if (filter !== 'none') applyPhotoFilter(layerCtx, destWidth, destHeight, filter)
  ctx.drawImage(layer, x, y)
}

function applyPhotoFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter: PhotoFilter,
): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = filterChannels(data[i], data[i + 1], data[i + 2], filter)
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
  }
  ctx.putImageData(imageData, 0, 0)
}

function filterChannels(
  r: number,
  g: number,
  b: number,
  filter: PhotoFilter,
): [number, number, number] {
  if (filter === 'bw') return contrast(grayscale(r, g, b), 1.05)
  if (filter === 'warm') {
    return brightness(saturate(sepia(r, g, b, 0.28), 1.15), 1.04)
  }
  if (filter === 'dreamy') {
    return brightness(saturate(contrast([r, g, b], 0.92), 1.2), 1.06)
  }
  return [r, g, b]
}

function grayscale(r: number, g: number, b: number): [number, number, number] {
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return [y, y, y]
}

function contrast(
  [r, g, b]: [number, number, number],
  amount: number,
): [number, number, number] {
  const scale = (channel: number) => (channel / 255 - 0.5) * amount * 255 + 127.5
  return [scale(r), scale(g), scale(b)]
}

function brightness(
  [r, g, b]: [number, number, number],
  amount: number,
): [number, number, number] {
  return [r * amount, g * amount, b * amount]
}

function sepia(
  r: number,
  g: number,
  b: number,
  amount: number,
): [number, number, number] {
  const sr = r * 0.393 + g * 0.769 + b * 0.189
  const sg = r * 0.349 + g * 0.686 + b * 0.168
  const sb = r * 0.272 + g * 0.534 + b * 0.131
  const mix = (source: number, tinted: number) => source + (tinted - source) * amount
  return [mix(r, sr), mix(g, sg), mix(b, sb)]
}

function saturate(
  [r, g, b]: [number, number, number],
  amount: number,
): [number, number, number] {
  const inv = 1 - amount
  const lr = 0.2126 * inv
  const lg = 0.7152 * inv
  const lb = 0.0722 * inv
  return [
    r * (lr + amount) + g * lg + b * lb,
    r * lr + g * (lg + amount) + b * lb,
    r * lr + g * lg + b * (lb + amount),
  ]
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const words = text.split(/\s+/)
  let line = ''
  let currentY = y
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, currentY)
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to export the composed photo.'))
        return
      }
      resolve(blob)
    }, 'image/png')
  })
}

async function drawStickers(
  ctx: CanvasRenderingContext2D,
  stickers: PlacedSticker[],
  width: number,
  height: number,
): Promise<void> {
  if (stickers.length === 0) return

  const loaded = await Promise.all(
    stickers.map(async (sticker) => {
      const option = STICKER_OPTIONS.find((item) => item.id === sticker.id)
      if (!option) return null
      return { sticker, image: await loadImage(option.src) }
    }),
  )

  for (const item of loaded) {
    if (!item) continue
    const { sticker, image } = item
    const size = Math.max(48, width * sticker.size)
    const cx = sticker.x * width
    const cy = sticker.y * height
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate((sticker.rotate * Math.PI) / 180)
    ctx.drawImage(image, -size / 2, -size / 2, size, size)
    ctx.restore()
  }
}

function layoutMetrics(layout: LayoutType, photoCount: number) {
  if (isPortraitLayout(layout)) {
    const width = STORY_WIDTH
    const height = STORY_HEIGHT
    const topPad = STORY_TOP_PAD
    const gap = STORY_PHOTO_GAP
    const footerHeight = STORY_FOOTER_HEIGHT
    const photoArea =
      height - topPad - footerHeight - Math.max(0, photoCount - 1) * gap
    const photoHeight = Math.floor(photoArea / photoCount)
    const photoWidth = Math.round((photoHeight * 3) / 4)
    const sidePad = Math.round((width - photoWidth) / 2)
    return {
      width,
      height,
      sidePad,
      textPad: STORY_SIDE_PAD,
      topPad,
      gap,
      photoWidth,
      photoHeight,
      footerCenterY: topPad + photoCount * photoHeight + (photoCount - 1) * gap + 78,
      captionSize: 26,
      titleSize: 48,
      captionLine: 32,
      titleLine: 54,
    }
  }

  if (isStoryLayout(layout)) {
    const width = STORY_WIDTH
    const height = STORY_HEIGHT
    const sidePad = STORY_SIDE_PAD
    const topPad = STORY_TOP_PAD
    const gap = STORY_PHOTO_GAP
    const footerHeight = STORY_FOOTER_HEIGHT
    const photoWidth = width - sidePad * 2
    const photoArea =
      height - topPad - footerHeight - Math.max(0, photoCount - 1) * gap
    const photoHeight = Math.floor(photoArea / photoCount)
    return {
      width,
      height,
      sidePad,
      textPad: sidePad,
      topPad,
      gap,
      photoWidth,
      photoHeight,
      footerCenterY: topPad + photoCount * photoHeight + (photoCount - 1) * gap + 78,
      captionSize: 26,
      titleSize: 48,
      captionLine: 32,
      titleLine: 54,
    }
  }

  const width = STRIP_WIDTH
  const sidePad = STRIP_SIDE_PAD
  const topPad = STRIP_TOP_PAD
  const gap = STRIP_PHOTO_GAP
  const footerHeight = STRIP_FOOTER_HEIGHT
  const photoWidth = width - sidePad * 2
  const photoHeight = Math.round(photoWidth * 0.72)
  const height =
    topPad + photoCount * photoHeight + (photoCount - 1) * gap + footerHeight
  return {
    width,
    height,
    sidePad,
    textPad: sidePad,
    topPad,
    gap,
    photoWidth,
    photoHeight,
    footerCenterY: topPad + photoCount * photoHeight + (photoCount - 1) * gap + 72,
    captionSize: 22,
    titleSize: 40,
    captionLine: 28,
    titleLine: 46,
  }
}

export async function composePhoto(
  photos: CapturedPhoto[],
  settings: CompositionSettings,
  options?: { omitStickers?: boolean },
): Promise<Blob> {
  const photoCount = Math.min(shotCountForLayout(settings.layout), photos.length)
  const images = await Promise.all(
    photos.slice(0, photoCount).map((photo) => loadImage(photo.objectUrl)),
  )

  const metrics = layoutMetrics(settings.layout, photoCount)
  const {
    width,
    height,
    sidePad,
    textPad,
    topPad,
    gap,
    photoWidth,
    photoHeight,
    footerCenterY,
    captionSize,
    titleSize,
    captionLine,
    titleLine,
  } = metrics

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available in this browser.')

  const theme = frameTheme(settings.background)
  ctx.fillStyle = theme.color
  ctx.fillRect(0, 0, width, height)

  images.forEach((image, index) => {
    const x = sidePad
    const y = topPad + index * (photoHeight + gap)
    drawCover(ctx, image, x, y, photoWidth, photoHeight, settings.filter)
  })

  if (!options?.omitStickers) {
    await drawStickers(ctx, settings.stickers, width, height)
  }

  ctx.textAlign = 'center'
  ctx.fillStyle = theme.muted

  const caption = settings.caption.trim()
  if (caption) {
    ctx.font = `500 ${captionSize}px "Outfit", sans-serif`
    wrapText(
      ctx,
      caption.toUpperCase(),
      width / 2,
      footerCenterY,
      width - textPad * 2,
      captionLine,
    )
  }

  ctx.fillStyle = theme.ink
  ctx.font = `700 ${titleSize}px "Playfair Display", Georgia, serif`
  const titleY = caption ? footerCenterY + 56 : footerCenterY + 18
  wrapText(
    ctx,
    eventConfig.footerText.toUpperCase(),
    width / 2,
    titleY,
    width - textPad * 2,
    titleLine,
  )

  return canvasToPngBlob(canvas)
}

export function buildExportFilename(date = new Date()): string {
  const pad = (value: number) => value.toString().padStart(2, '0')
  const stamp = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-')
  const time = [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(
    '',
  )
  return `stephanies-garden-${stamp}-${time}.png`
}
