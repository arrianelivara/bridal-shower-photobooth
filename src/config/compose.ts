import { assetUrl } from '../lib/assetUrl'
import type {
  FrameBackground,
  PhotoFilter,
  PlacedSticker,
  StickerId,
} from '../types/photo'

export const FRAME_BACKGROUNDS: {
  id: FrameBackground
  label: string
  color: string
  ink: string
  muted: string
}[] = [
  { id: 'white', label: 'White', color: '#FFFFFF', ink: '#1A1A1A', muted: '#6B6258' },
  { id: 'black', label: 'Black', color: '#1A1A1A', ink: '#FFFDF8', muted: '#D8D0C6' },
  {
    id: 'dustyBlue',
    label: 'Dusty blue',
    color: '#DCEAF3',
    ink: '#3F3A33',
    muted: '#5F6B74',
  },
  {
    id: 'butter',
    label: 'Butter yellow',
    color: '#F5E4A9',
    ink: '#3F3A33',
    muted: '#6B6258',
  },
  {
    id: 'lavender',
    label: 'Lavender',
    color: '#E6DFF0',
    ink: '#3F3A33',
    muted: '#6B6258',
  },
]

export const PHOTO_FILTERS: { id: PhotoFilter; label: string; detail: string }[] = [
  { id: 'none', label: 'Original', detail: 'No filter' },
  { id: 'bw', label: 'B&W', detail: 'Classic mono' },
  { id: 'warm', label: 'Warm', detail: 'Soft golden' },
  { id: 'dreamy', label: 'Dreamy', detail: 'Soft blush' },
]

export const STICKER_OPTIONS: {
  id: StickerId
  label: string
  src: string
  group: 'flower' | 'steph'
}[] = [
  { id: 'rose', label: 'Rose', src: assetUrl('flower-rose.svg'), group: 'flower' },
  { id: 'daisy', label: 'Daisy', src: assetUrl('flower-daisy.svg'), group: 'flower' },
  { id: 'peony', label: 'Peony', src: assetUrl('flower-peony.svg'), group: 'flower' },
  { id: 'steph1', label: 'Steph 1', src: assetUrl('sticker-1.png'), group: 'steph' },
  { id: 'steph2', label: 'Steph 2', src: assetUrl('sticker-2.png'), group: 'steph' },
  { id: 'steph3', label: 'Steph 3', src: assetUrl('sticker-3.png'), group: 'steph' },
  { id: 'steph4', label: 'Steph 4', src: assetUrl('sticker-4.png'), group: 'steph' },
]

const DEFAULT_SLOTS: { x: number; y: number; rotate: number }[] = [
  { x: 0.14, y: 0.16, rotate: -10 },
  { x: 0.86, y: 0.2, rotate: 8 },
  { x: 0.16, y: 0.72, rotate: 6 },
  { x: 0.84, y: 0.68, rotate: -8 },
  { x: 0.5, y: 0.12, rotate: 4 },
  { x: 0.5, y: 0.88, rotate: -4 },
  { x: 0.1, y: 0.45, rotate: -6 },
]

export function defaultPlacedSticker(
  id: StickerId,
  existingCount: number,
): PlacedSticker {
  const option = STICKER_OPTIONS.find((item) => item.id === id)
  const slot = DEFAULT_SLOTS[existingCount % DEFAULT_SLOTS.length]
  const size = option?.group === 'steph' ? 0.2 : 0.14
  return {
    id,
    x: slot.x,
    y: slot.y,
    size,
    rotate: slot.rotate,
  }
}

export function frameTheme(background: FrameBackground) {
  return (
    FRAME_BACKGROUNDS.find((item) => item.id === background) ?? FRAME_BACKGROUNDS[0]
  )
}

export function canvasFilterFor(filter: PhotoFilter): string {
  switch (filter) {
    case 'bw':
      return 'grayscale(1) contrast(1.05)'
    case 'warm':
      return 'sepia(0.28) saturate(1.15) brightness(1.04)'
    case 'dreamy':
      return 'contrast(0.92) saturate(1.2) brightness(1.06)'
    default:
      return 'none'
  }
}

export function stickerSrc(id: StickerId): string {
  return STICKER_OPTIONS.find((item) => item.id === id)?.src ?? ''
}
