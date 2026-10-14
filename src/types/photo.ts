export type AppStep = 'welcome' | 'booth' | 'review' | 'preview'

export type LayoutType = 'strip2' | 'strip3' | 'single' | 'story3' | 'portrait2'

export type CapturePhase = 'ready' | 'countdown' | 'flash' | 'review'

export type SaveStatus =
  | 'ready'
  | 'preparing'
  | 'saved'
  | 'shared'
  | 'failed'
  | 'manual'

export type FrameBackground =
  | 'white'
  | 'black'
  | 'dustyBlue'
  | 'butter'
  | 'lavender'

export type PhotoFilter = 'none' | 'bw' | 'warm' | 'dreamy'

export type StickerId =
  | 'rose'
  | 'daisy'
  | 'peony'
  | 'steph1'
  | 'steph2'
  | 'steph3'
  | 'steph4'

export interface CapturedPhoto {
  id: string
  blob: Blob
  objectUrl: string
}

/** Normalized sticker placement on the strip (center x/y are 0–1). */
export interface PlacedSticker {
  id: StickerId
  x: number
  y: number
  /** Width as a fraction of strip width */
  size: number
  rotate: number
}

export interface CompositionSettings {
  layout: LayoutType
  caption: string
  background: FrameBackground
  filter: PhotoFilter
  stickers: PlacedSticker[]
}

export interface GuestbookEntry {
  id: string
  name: string
  message: string
  createdAt: string
}

export function shotCountForLayout(layout: LayoutType): number {
  if (layout === 'strip2' || layout === 'portrait2') return 2
  if (layout === 'strip3' || layout === 'story3') return 3
  return 1
}

export function isStripLayout(layout: LayoutType): boolean {
  return layout === 'strip2' || layout === 'strip3'
}

export function isStoryLayout(layout: LayoutType): boolean {
  return layout === 'story3'
}

/** Two phone-portrait frames on the Instagram Story canvas. */
export function isPortraitLayout(layout: LayoutType): boolean {
  return layout === 'portrait2'
}

export function defaultCompositionSettings(
  layout: LayoutType = 'strip2',
  caption = '',
): CompositionSettings {
  return {
    layout,
    caption,
    background: 'white',
    filter: 'none',
    stickers: [],
  }
}
