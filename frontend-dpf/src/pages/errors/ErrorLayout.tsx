// PERBAIKAN: Gunakan 'import type' untuk tipe data
import type { CSSProperties, ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

import {
  faArrowLeft,
  faHouse,
} from '@fortawesome/free-solid-svg-icons'

const customScrollbarStyle: CSSProperties = {
  scrollbarWidth: 'thin',
  scrollbarColor: '#cbd5e1 transparent',
}

type ToneVariant = 'primary' | 'green' | 'danger'

type ToneTokens = {
  pill: string
  iconWrap: string
  icon: string
  primaryBtn: string
  glow: string
  dot: string
}

const toneTokens = (tone: ToneVariant): ToneTokens => {
  if (tone === 'green') {
    return {
      pill: 'bg-brandGreen-50 text-brandGreen-700 ring-1 ring-brandGreen-100',
      iconWrap: 'bg-brandGreen-50 ring-1 ring-brandGreen-100',
      icon: 'text-brandGreen-700',
      primaryBtn:
        'bg-brandGreen-600 hover:bg-brandGreen-700 focus-visible:ring-brandGreen-200 text-white',
      glow: 'from-brandGreen-200/40 via-white to-white',
      dot: 'bg-brandGreen-500',
    }
  }

  if (tone === 'danger') {
    return {
      pill: 'bg-red-50 text-red-700 ring-1 ring-red-100',
      iconWrap: 'bg-red-50 ring-1 ring-red-100',
      icon: 'text-red-600',
      primaryBtn: 'bg-slate-900 hover:bg-slate-800 focus-visible:ring-slate-300 text-white',
      glow: 'from-red-200/30 via-white to-white',
      dot: 'bg-red-500',
    }
  }

  return {
    pill: 'bg-primary-50 text-primary-700 ring-1 ring-primary-100',
    iconWrap: 'bg-primary-50 ring-1 ring-primary-100',
    icon: 'text-primary-700',
    primaryBtn:
      'bg-primary-600 hover:bg-primary-700 focus-visible:ring-primary-200 text-white',
    glow: 'from-primary-200/40 via-white to-white',
    dot: 'bg-primary-500',
  }
}

type ErrorLayoutProps = {
  code: number
  title: string
  description: string
  suggestion?: string
  message?: string | null
  icon: IconDefinition
  tone?: ToneVariant
  extraActions?: ReactNode
}

const ErrorLayout = ({
  code,
  title,
  description,
  suggestion,
  message,
  icon,
  tone = 'primary',
  extraActions,
}: ErrorLayoutProps) => {
  const tokens = toneTokens(tone)
  const displayMessage = message ?? description

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-slate-50 font-sans">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className={`absolute -top-32 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b ${tokens.glow} blur-3xl opacity-80`}
        />
        <div className="absolute -bottom-48 -left-32 h-[450px] w-[450px] rounded-full bg-emerald-100/60 blur-[80px]" />
        <div className="absolute -bottom-48 -right-32 h-[400px] w-[400px] rounded-full bg-blue-50/50 blur-[80px]" />
      </div>

      <div className="z-10 w-full overflow-y-auto px-4 py-6" style={customScrollbarStyle}>
        <div className="mx-auto w-full max-w-2xl">
          <div className="overflow-hidden rounded-2xl border border-slate-100/80 bg-white/90 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-white/60 px-5 py-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tokens.iconWrap}`}>
                  <FontAwesomeIcon icon={icon} className={`text-xs ${tokens.icon}`} />
                </div>
                <div className="leading-tight">
                  <p className="font-accent text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Pusat Bantuan
                  </p>
                  <p className="font-heading text-sm font-semibold text-slate-800">Sistem Gangguan</p>
                </div>
              </div>
              <div className="h-8 w-auto">
                <img
                  src="/brand/dpf-icon.png"
                  alt="Logo DPF"
                  className="h-full w-full object-contain drop-shadow-sm"
                  onError={(event) => {
                    ;(event.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            </div>

            <div className="px-6 py-6 text-center sm:px-8">
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide shadow-sm ${tokens.pill}`}
              >
                <span>Kesalahan:</span>
                <span>{code}</span>
              </div>

              <h1 className="mt-3 font-heading text-xl font-bold text-slate-900 sm:text-2xl">
                {title}
              </h1>

              <p className="mt-2 text-balance font-body text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                {displayMessage}
              </p>

              {suggestion && (
                <p className="mt-1 font-body text-xs text-slate-400">{suggestion}</p>
              )}

              <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row sm:gap-3">
                <Link
                  to="/"
                  className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium shadow-md transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${tokens.primaryBtn}`}
                >
                  <FontAwesomeIcon icon={faHouse} className="mr-2 text-xs" />
                  Beranda
                </Link>
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-1"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="mr-2 text-xs" />
                  Kembali
                </button>
                {extraActions}
              </div>

              <div className="mt-6 w-full rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 text-left">
                <p className="mb-2 font-heading text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Pemecahan masalah
                </p>
                <ul className="space-y-1.5 font-body text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${tokens.dot}`} />
                    <span>Muat ulang halaman atau periksa koneksi internet Anda.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                    <span>Jika masalah berlanjut, hubungi admin DPF.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3 text-center">
              <p className="font-body text-[10px] text-slate-400">
                Sistem DPF - Keamanan & Pemantauan
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorLayout


