/** Best-effort fullscreen for booth / embedded webviews. Safe to no-op if unsupported. */
export async function enterFullscreen(): Promise<void> {
  const root = document.documentElement
  if (document.fullscreenElement) return
  try {
    if (root.requestFullscreen) {
      await root.requestFullscreen()
      return
    }
    const webkitRoot = root as HTMLElement & {
      webkitRequestFullscreen?: () => void
    }
    webkitRoot.webkitRequestFullscreen?.()
  } catch {
    // User gesture required / blocked by host webview — layout still uses full viewport.
  }
}

export async function exitFullscreen(): Promise<void> {
  if (!document.fullscreenElement) return
  try {
    await document.exitFullscreen()
  } catch {
    // Ignore
  }
}
