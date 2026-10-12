/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BRIDE_NAME?: string
  readonly VITE_EVENT_TITLE?: string
  readonly VITE_EVENT_DATE?: string
  readonly VITE_GARDEN_TITLE?: string
  readonly VITE_SUBTITLE?: string
  readonly VITE_DESCRIPTION?: string
  readonly VITE_PRIMARY_CTA?: string
  readonly VITE_COMPLETION_MESSAGE?: string
  readonly VITE_DEFAULT_CAPTION?: string
  readonly VITE_FOOTER_TEXT?: string
  readonly VITE_COUNTDOWN_SECONDS?: string
  readonly VITE_IDLE_TIMEOUT_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
