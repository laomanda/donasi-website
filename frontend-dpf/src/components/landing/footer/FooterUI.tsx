import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import type { ReactNode } from 'react'

export function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-white/90 mb-6 font-heading border-l-2 border-emerald-500 pl-3">
      {children}
    </h3>
  )
}

export function FooterLinkItem({ to, label }: { to: string; label: string }) {
  return (
    <li>
      <Link
        to={to}
        className="group flex items-center gap-2 text-[15px] text-slate-300/80 transition-all hover:text-emerald-400"
      >
        <FontAwesomeIcon
          icon={faChevronRight}
          className="h-2 w-2 text-emerald-500 opacity-0 -translate-x-2 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
        />
        <span className="-translate-x-4 transition-transform duration-300 group-hover:translate-x-0 group-hover:font-medium">
          {label}
        </span>
      </Link>
    </li>
  )
}

export function ContactItem({ icon, text, href }: { icon: IconProp; text: ReactNode; href?: string }) {
  const content = (
    <>
      <FontAwesomeIcon icon={icon} className="mt-1 h-4 w-4 text-slate-200 flex-shrink-0" />
      <span className="leading-relaxed text-slate-300">{text}</span>
    </>
  )

  if (href) {
    return (
      <li>
        <a href={href} className="flex items-start gap-3 hover:text-white transition-colors">
          {content}
        </a>
      </li>
    )
  }

  return <li className="flex items-start gap-3 cursor-default">{content}</li>
}

export function SocialIcon({
  href,
  icon,
  variant,
}: {
  href: string
  icon: IconProp
  variant: 'ig' | 'wa' | 'tiktok' | 'yt' | 'fb'
}) {
  const hoverStyles = {
    ig: 'hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:border-transparent',
    wa: 'hover:bg-emerald-600 hover:border-transparent',
    tiktok: 'hover:bg-slate-900 hover:border-transparent',
    yt: 'hover:bg-red-600 hover:border-transparent',
    fb: 'hover:bg-blue-600 hover:border-transparent',
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`
        flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5
        text-slate-300 transition-all duration-300 ease-out
        hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-900/20
        ${hoverStyles[variant]}
      `}
    >
      <FontAwesomeIcon icon={icon} />
    </a>
  )
}
