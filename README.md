# Stephanie's Garden

A laptop-first floral photo booth for Stephanie's bridal shower.

Guests take photos in the browser, compose a plain photo-strip keepsake, and save the finished image to their own device. Nothing is uploaded. There is no backend.

## Features

- Welcome screen with layout choice (4-shot strip or single portrait)
- Camera setup with permission handling, retry, and camera switching
- Countdown capture with per-shot review / retake
- Plain white 1 / 2 / 3 photo strips via Canvas
- Local save via Blob download; Web Share on supported mobile browsers
- Optional guestbook notes stored in `localStorage` on the booth laptop only
- Idle timeout on the final screen to clear photo memory for the next guest

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Lucide React
- Self-hosted fonts (Playfair Display, Great Vibes, Outfit) — no third-party analytics or trackers

## Quick start

```bash
npm install
npm run dev
```

Open the printed URL (usually `http://localhost:5173`). Camera access requires a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts): **localhost** or **HTTPS**.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Typecheck and build the static site to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Configuration

Copy `.env.example` to `.env` and edit public event settings:

```bash
cp .env.example .env
```

Editable values live in `src/config/event.ts` (with Vite `VITE_*` overrides):

- Bride name, garden title, event title, date
- Captions, footer text, CTA copy
- Countdown seconds and idle timeout
All of these values are public in the client bundle. Do not put secrets in `.env`.

`.env` files are gitignored; keep `.env.example` as the template.

## Privacy model

- Photos exist only in memory for the active session (Blobs / object URLs).
- Photos are **not** written to `localStorage`, IndexedDB, or caches.
- Saving triggers a local download or the device share sheet — never an upload.
- Starting a new session or hitting the idle timeout on the final screen clears photo data and releases the camera.
- Guestbook messages (optional) are stored in `localStorage` on the current browser only. The UI states this plainly. Organizers can use **Download guestbook** to export a text file from the booth laptop.

## Deploy to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that builds and publishes `dist/` on every push to `main` or `master`.

### One-time setup

1. Push this project to a GitHub repository (folder name / repo name defaults to `photobooth`).
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main` (or run the **Deploy to GitHub Pages** workflow manually).
4. Open the site at `https://<your-user>.github.io/<repo>/` (HTTPS — required for the camera).

The workflow sets Vite `base` to `/<repo>/` automatically so assets and stickers load under the project subpath.

### Local check (project-site base)

```bash
npm run build:gh-pages
npm run preview:gh-pages
```

Then open the printed URL (usually `http://localhost:4173/photobooth/`).

### Other static hosts

```bash
npm run build
```

Deploy the `dist/` folder to any static host over **HTTPS** (Netlify, Vercel, etc.). For root-domain hosting, leave `BASE_PATH` unset so `base` stays `/`.

Camera permissions will not work on plain `http://` hosts (except localhost).

## Venue setup tips

1. Prefer **Chrome** or **Edge** on the booth laptop; Safari also works on macOS.
2. Open the site once before guests arrive and **Allow** camera access permanently for the origin.
3. Use fullscreen / kiosk mode (`F11` or the browser’s app mode) so guests stay in the flow.
4. Point the laptop at soft front lighting; avoid strong backlight from windows.
5. Downloads typically land in the laptop’s **Downloads** folder — clear or collect them between guests if you want copies for the couple.
6. For phones, offer **Save to Photos / Share** when the browser supports file sharing; otherwise use Save Photo or long-press → Save Image.
7. Pre-test capture, composition, and download on the exact laptop that will be used.

## Troubleshooting

| Issue | What to try |
| --- | --- |
| Camera permission denied | Click the camera icon in the address bar → Allow → use **Try again** |
| Camera busy / black preview | Quit Zoom/Meet/Photo Booth apps using the camera, then retry |
| No camera found | Confirm a webcam is connected and enabled in OS settings |
| Download didn’t appear | Check the Downloads folder and browser download blocked icon; on iOS in-app browsers, long-press the image → Save Image |
| Guestbook won’t save | Private mode or full disk can block `localStorage`; notes are optional and never block photo saving |
| Site works on Wi‑Fi but camera fails on phone | Use HTTPS; `http://192.168.x.x` is not a secure context for `getUserMedia` |

## Project structure

```
src/
  components/          # Shared UI + floral artwork
  config/              # Event settings
  features/
    photo-booth/       # Welcome, camera setup, capture
    photo-composer/    # Strip preview + caption
    save/              # Final preview + save states
    guestbook/         # localStorage guestbook + export
  services/            # Camera, canvas export, download/share
  hooks/
  styles/
  types/
```

## License

Private event project — use and adapt for Stephanie's celebration.
