import { Download, Heart } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { eventConfig } from '../../config/event'
import { Button } from '../../components/ui/Button'
import type { GuestbookEntry } from '../../types/photo'
import {
  downloadGuestbook,
  loadGuestbookEntries,
  saveGuestbookEntry,
} from './guestbookStorage'

interface GuestbookFormProps {
  onSaved?: () => void
}

export function GuestbookForm({ onSaved }: GuestbookFormProps) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [errorText, setErrorText] = useState('')
  const [entries, setEntries] = useState<GuestbookEntry[]>(() => loadGuestbookEntries())

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const result = saveGuestbookEntry(name, message)
    if (!result.ok) {
      setStatus('error')
      setErrorText(
        result.reason === 'full'
          ? 'This device storage is full, so the note could not be saved here.'
          : 'Local storage is unavailable in this browser, so the note could not be saved.',
      )
      return
    }
    setEntries(result.entries)
    setName('')
    setMessage('')
    setStatus('saved')
    setErrorText('')
    onSaved?.()
  }

  return (
    <div className="rounded-[2rem] border border-blush/70 bg-ivory/90 p-5 shadow-soft sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <Heart className="mt-1 h-5 w-5 text-sage" aria-hidden="true" />
        <div>
          <h3 className="font-serif text-2xl text-ink">Leave a little love for the bride</h3>
          <p className="mt-1 text-sm text-taupe">
            Optional. Notes are saved on this device only — they are not sent to{' '}
            {eventConfig.brideName}. The organizer can export the guestbook from this laptop.
          </p>
        </div>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-taupe">Your name or nickname</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
            className="w-full rounded-2xl border border-blush/80 bg-white/70 px-4 py-3 outline-none ring-sage/40 focus:ring-2"
            placeholder="With love,"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-taupe">A wish for {eventConfig.brideName}</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={280}
            rows={3}
            className="w-full resize-none rounded-2xl border border-blush/80 bg-white/70 px-4 py-3 outline-none ring-sage/40 focus:ring-2"
            placeholder="May your days be full of laughter and flowers…"
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="secondary">
            Save note on this device
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => downloadGuestbook(entries)}
            disabled={entries.length === 0}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download guestbook
          </Button>
        </div>
      </form>

      {status === 'saved' ? (
        <p className="mt-3 text-sm text-sage" role="status">
          Saved on this device only.
        </p>
      ) : null}
      {status === 'error' ? (
        <p className="mt-3 text-sm text-[#9B5B5B]" role="alert">
          {errorText}
        </p>
      ) : null}
    </div>
  )
}
