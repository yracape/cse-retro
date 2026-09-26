import type { ReactNode } from 'react'
import { Sparkle } from 'lucide-react'

export function SectionHeader({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <Sparkle className="w-5 h-5 text-tangerine fill-tangerine" />
        <span className="retro-chip bg-mustard text-cocoa">{kicker}</span>
        <div className="flex-1 h-2 groovy-wave opacity-60" />
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-3xl md:text-4xl text-rust drop-shadow-[2px_2px_0_#E9A319]">{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function Starburst({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-mustard">
        <polygon
          fill="currentColor"
          stroke="#4A2C14"
          strokeWidth="2.5"
          points="50,2 58,22 74,8 72,30 94,24 80,42 2,50 80,58 94,76 72,70 74,92 58,78 50,98 42,78 26,92 28,70 6,76 20,58 2,50 20,42 6,24 28,30 26,8 42,22"
          transform="rotate(15 50 50)"
        />
      </svg>
      <span className="relative z-10 font-display text-cocoa text-center leading-tight px-6 py-6">{children}</span>
    </div>
  )
}

export function ProgressRing({ value, max, label, color = '#E8641C' }: { value: number; max: number; label: string; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const r = 52
  const c = 2 * Math.PI * r
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#F8EAD3" strokeWidth="14" />
          <circle cx="60" cy="60" r={r} fill="none" stroke="#4A2C14" strokeWidth="18" opacity="0.15" />
          <circle
            cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="14"
            strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl text-cocoa">{pct}%</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-bold uppercase tracking-widest text-mocha text-center">{label}</span>
    </div>
  )
}

export function SunDivider() {
  return (
    <div className="flex items-center gap-4 my-2">
      <div className="flex-1 h-2 groovy-wave" />
      <svg viewBox="0 0 40 40" className="w-8 h-8 text-tangerine">
        <g stroke="#4A2C14" strokeWidth="2" fill="currentColor">
          <circle cx="20" cy="20" r="8" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4
            return (
              <line
                key={i}
                x1={20 + Math.cos(a) * 11} y1={20 + Math.sin(a) * 11}
                x2={20 + Math.cos(a) * 17} y2={20 + Math.sin(a) * 17}
                strokeLinecap="round" strokeWidth="3.5"
              />
            )
          })}
        </g>
      </svg>
      <div className="flex-1 h-2 groovy-wave" />
    </div>
  )
}
