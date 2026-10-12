import {
  STICKER_OPTIONS,
  canvasFilterFor,
  frameTheme,
} from '../config/compose'
import { eventConfig } from '../config/event'
import type {
  CapturedPhoto,
  CompositionSettings,
  LayoutType,
  PlacedSticker,
} from '../types/photo'
import { isStoryLayout, shotCountForLayout } from '../types/photo'

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

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  filter: string,
): void {
  const scale = Math.max(width / image.width, height / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  const offsetX = x + (width - drawWidth) / 2
  const offsetY = y + (height - drawHeight) / 2
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, width, height)
  ctx.clip()
  ctx.filter = filter
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
  ctx.restore()
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

  const filter = canvasFilterFor(settings.filter)
  images.forEach((image, index) => {
    const x = sidePad
    const y = topPad + index * (photoHeight + gap)
    drawCover(ctx, image, x, y, photoWidth, photoHeight, filter)
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
      width - sidePad * 2,
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
    width - sidePad * 2,
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
