import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary:
    'bg-sage text-ivory shadow-soft hover:bg-sage/90 focus-visible:ring-sage disabled:bg-sage/50',
  secondary:
    'bg-ivory text-taupe border border-blush/80 hover:bg-blush/40 focus-visible:ring-blush',
  ghost:
    'bg-transparent text-taupe hover:bg-blush/30 focus-visible:ring-powder',
  danger:
    'bg-transparent text-[#9B5B5B] border border-[#E2BDBD] hover:bg-[#F8EAEA] focus-visible:ring-[#E2BDBD]',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
