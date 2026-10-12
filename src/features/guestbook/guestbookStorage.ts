import { eventConfig } from '../../config/event'
import type { GuestbookEntry } from '../../types/photo'

export type GuestbookStorageResult =
  | { ok: true; entries: GuestbookEntry[] }
  | { ok: false; reason: 'unavailable' | 'full' | 'corrupt'; entries: GuestbookEntry[] }

function readRaw(): GuestbookStorageResult {
  try {
    if (typeof localStorage === 'undefined') {
      return { ok: false, reason: 'unavailable', entries: [] }
    }
    const raw = localStorage.getItem(eventConfig.guestbookStorageKey)
    if (!raw) return { ok: true, entries: [] }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return { ok: false, reason: 'corrupt', entries: [] }
    }
    const entries = parsed.filter(isGuestbookEntry)
    return { ok: true, entries }
  } catch {
    return { ok: false, reason: 'unavailable', entries: [] }
  }
}

function isGuestbookEntry(value: unknown): value is GuestbookEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry.id === 'string' &&
    typeof entry.name === 'string' &&
    typeof entry.message === 'string' &&
    typeof entry.createdAt === 'string'
  )
}

export function loadGuestbookEntries(): GuestbookEntry[] {
  return readRaw().entries
}

export function saveGuestbookEntry(
  name: string,
  message: string,
): GuestbookStorageResult {
  const trimmedName = name.trim().slice(0, 60)
  const trimmedMessage = message.trim().slice(0, 280)
  if (!trimmedName && !trimmedMessage) {
    return { ok: true, entries: loadGuestbookEntries() }
  }

  const current = readRaw()
  const entry: GuestbookEntry = {
    id: crypto.randomUUID(),
    name: trimmedName || 'A friend',
    message: trimmedMessage || 'Sending love!',
    createdAt: new Date().toISOString(),
  }

  const entries = [...current.entries, entry]
  try {
    if (typeof localStorage === 'undefined') {
      return { ok: false, reason: 'unavailable', entries: current.entries }
    }
    localStorage.setItem(eventConfig.guestbookStorageKey, JSON.stringify(entries))
    return { ok: true, entries }
  } catch (error) {
    const reason =
      error instanceof DOMException && error.name === 'QuotaExceededError'
        ? 'full'
        : 'unavailable'
    return { ok: false, reason, entries: current.entries }
  }
}

export function exportGuestbookText(entries: GuestbookEntry[]): string {
  const lines = [
    `${eventConfig.eventTitle} — Guestbook`,
    `Exported ${new Date().toISOString()}`,
    'Messages are stored only on this device.',
    '',
  ]

  for (const entry of entries) {
    lines.push(`— ${entry.name} (${entry.createdAt})`)
    lines.push(entry.message)
    lines.push('')
  }

  return lines.join('\n')
}

export function downloadGuestbook(entries: GuestbookEntry[]): void {
  const blob = new Blob([exportGuestbookText(entries)], {
    type: 'text/plain;charset=utf-8',
  })
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = 'stephanies-garden-guestbook.txt'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000)
}
