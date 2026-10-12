import { assetUrl } from '../../lib/assetUrl'

interface FloralDecorProps {
  className?: string
  density?: 'welcome' | 'subtle'
}

/** Only these two are shown — positions match the welcome layout notes */
const STICKER_LEFT = assetUrl('sticker-1.png')
const STICKER_RIGHT = assetUrl('sticker-3.png')

function Rose({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="10" fill="#C46B7E" />
      <ellipse cx="32" cy="18" rx="8" ry="12" fill="#E8A0B0" />
      <ellipse cx="46" cy="28" rx="8" ry="12" fill="#F0B8C4" transform="rotate(45 46 28)" />
      <ellipse cx="44" cy="42" rx="8" ry="12" fill="#E8A0B0" transform="rotate(90 44 42)" />
      <ellipse cx="20" cy="42" rx="8" ry="12" fill="#F0B8C4" transform="rotate(135 20 42)" />
      <ellipse cx="18" cy="26" rx="8" ry="12" fill="#E8A0B0" transform="rotate(200 18 26)" />
      <path d="M30 42c-2 8-8 14-14 16" stroke="#8D9B79" strokeWidth="3" fill="none" />
    </svg>
  )
}

function Daisy({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {Array.from({ length: 8 }).map((_, index) => {
        const angle = (index * 360) / 8
        return (
          <ellipse
            key={angle}
            cx="32"
            cy="18"
            rx="7"
            ry="12"
            fill="#FFFDF8"
            stroke="#F4DDE2"
            transform={`rotate(${angle} 32 32)`}
          />
        )
      })}
      <circle cx="32" cy="32" r="8" fill="#F5E4A9" />
    </svg>
  )
}

function Peony({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="34" r="16" fill="#F4DDE2" />
      <circle cx="22" cy="26" r="10" fill="#E7B8C4" />
      <circle cx="42" cy="26" r="10" fill="#F7D4DC" />
      <circle cx="32" cy="22" r="9" fill="#F0C4CE" />
      <circle cx="32" cy="34" r="7" fill="#D98A9C" />
    </svg>
  )
}

function BabyBreath({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M20 50 C24 36, 28 28, 34 18" stroke="#8D9B79" strokeWidth="2" fill="none" />
      <circle cx="34" cy="16" r="3" fill="#DCEAF3" />
      <circle cx="28" cy="24" r="2.5" fill="#FFFDF8" stroke="#DCEAF3" />
      <circle cx="38" cy="28" r="2.5" fill="#FFFDF8" stroke="#DCEAF3" />
      <circle cx="24" cy="34" r="2" fill="#DCEAF3" />
      <circle cx="32" cy="38" r="2.5" fill="#FFFDF8" stroke="#DCEAF3" />
    </svg>
  )
}

export function FloralDecor({ className = '', density = 'welcome' }: FloralDecorProps) {
  const welcome = density === 'welcome'

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Florals — edge-anchored on mobile so they stay in view; farther out on larger screens */}
      <Rose
        className={
          welcome
            ? 'floral-float absolute left-1 top-[12%] h-10 w-10 opacity-80 sm:left-[calc(50%-22rem)] sm:top-[14%] sm:h-20 sm:w-20 lg:left-[calc(50%-26rem)]'
            : 'floral-float absolute left-2 top-[18%] h-14 w-14 opacity-35 sm:left-6 sm:h-16 sm:w-16'
        }
      />
      <Daisy
        className={
          welcome
            ? 'floral-float-delayed absolute right-1 top-[14%] h-9 w-9 opacity-85 sm:right-[calc(50%-21.5rem)] sm:top-[16%] sm:h-16 sm:w-16 lg:right-[calc(50%-25.5rem)]'
            : 'floral-float-delayed absolute right-2 top-[22%] h-12 w-12 opacity-40 sm:right-8 sm:h-16 sm:w-16'
        }
      />
      <Peony
        className={
          welcome
            ? 'floral-float absolute left-1 top-[68%] h-11 w-11 opacity-75 sm:left-[calc(50%-23rem)] sm:top-[62%] sm:h-24 sm:w-24 lg:left-[calc(50%-27rem)]'
            : 'floral-float absolute bottom-[22%] left-3 h-16 w-16 opacity-35 sm:left-8 sm:h-20 sm:w-20'
        }
      />
      <BabyBreath
        className={
          welcome
            ? 'floral-float-delayed absolute right-1 top-[64%] h-11 w-11 opacity-85 sm:right-[calc(50%-22.5rem)] sm:top-[58%] sm:h-20 sm:w-20 lg:right-[calc(50%-26.5rem)]'
            : 'floral-float-delayed absolute bottom-[20%] right-3 h-14 w-14 opacity-40 sm:right-8 sm:h-16 sm:w-16'
        }
      />
      <Daisy
        className={
          welcome
            ? 'floral-float absolute left-3 top-[5%] h-8 w-8 opacity-60 sm:left-[calc(50%-20rem)] sm:top-[8%] sm:h-11 sm:w-11 lg:left-[calc(50%-24rem)]'
            : 'floral-float absolute left-4 top-3 h-10 w-10 opacity-30'
        }
      />
      <Rose
        className={
          welcome
            ? 'floral-float-delayed absolute right-3 top-[82%] h-8 w-8 opacity-60 sm:right-[calc(50%-20rem)] sm:top-[80%] sm:h-12 sm:w-12 lg:right-[calc(50%-24rem)]'
            : 'floral-float-delayed absolute bottom-3 right-6 h-11 w-11 opacity-30'
        }
      />

      {/* Stickers — smaller and edge-visible on mobile */}
      <img
        src={STICKER_LEFT}
        alt=""
        className={
          welcome
            ? 'floral-float absolute left-0 top-[42%] w-16 rotate-[-10deg] sm:left-[calc(50%-21rem)] sm:top-[42%] sm:w-36 lg:left-[calc(50%-26rem)] lg:w-40'
            : 'floral-float absolute left-2 top-[40%] w-16 rotate-[-6deg] opacity-55 sm:w-20'
        }
      />
      <img
        src={STICKER_RIGHT}
        alt=""
        className={
          welcome
            ? 'floral-float-delayed absolute right-0 top-[38%] w-14 rotate-[8deg] sm:right-[calc(50%-20.5rem)] sm:top-[38%] sm:w-32 lg:right-[calc(50%-25.5rem)] lg:w-36'
            : 'floral-float-delayed absolute right-2 top-[38%] w-14 rotate-[7deg] opacity-50 sm:w-20'
        }
      />
    </div>
  )
}

export function FloralCorner({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 180 120" className="h-auto w-full">
        <path
          d="M10 100 C40 80, 50 40, 80 30"
          stroke="#8D9B79"
          strokeWidth="3"
          fill="none"
        />
        <circle cx="86" cy="26" r="14" fill="#E8A0B0" />
        <circle cx="70" cy="40" r="10" fill="#F4DDE2" />
        <circle cx="102" cy="42" r="9" fill="#DCEAF3" />
        <circle cx="118" cy="28" r="7" fill="#F5E4A9" />
        <ellipse
          cx="48"
          cy="68"
          rx="16"
          ry="8"
          fill="#B7C4A3"
          transform="rotate(-30 48 68)"
        />
      </svg>
    </div>
  )
}
