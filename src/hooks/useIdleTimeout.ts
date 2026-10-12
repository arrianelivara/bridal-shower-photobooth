import { useEffect, useRef } from 'react'

export function useIdleTimeout(
  enabled: boolean,
  timeoutMs: number,
  onTimeout: () => void,
): void {
  const callbackRef = useRef(onTimeout)

  useEffect(() => {
    callbackRef.current = onTimeout
  }, [onTimeout])

  useEffect(() => {
    if (!enabled || timeoutMs <= 0) return

    let timer = window.setTimeout(() => callbackRef.current(), timeoutMs)

    const reset = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => callbackRef.current(), timeoutMs)
    }

    const events: Array<keyof WindowEventMap> = [
      'pointerdown',
      'keydown',
      'touchstart',
      'mousemove',
    ]

    for (const event of events) {
      window.addEventListener(event, reset, { passive: true })
    }

    return () => {
      window.clearTimeout(timer)
      for (const event of events) {
        window.removeEventListener(event, reset)
      }
    }
  }, [enabled, timeoutMs])
}
