import dpfLogo from '../../brand/dpf-icon.png'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import {
  faChevronRight,
  faEnvelope,
  faMapLocationDot,
  faPhone,
  faHandHoldingHeart,
} from '@fortawesome/free-solid-svg-icons'
import { faFacebookF, faInstagram, faTiktok, faWhatsapp, faYoutube } from '@fortawesome/free-brands-svg-icons'
import { Link } from 'react-router-dom'
import { useLang } from '../../lib/i18n'
import { landingDict, translate } from '../../i18n/landing'
import { fetchPublicSettings } from '../../lib/publicSettings'

type FooterProgramLink = { label: string; href: string }

type LandingFooterProps = {
  programLinks?: FooterProgramLink[]
}

export function LandingFooter({ programLinks = [] }: LandingFooterProps) {
  const currentYear = new Date().getFullYear()
  const limitedPrograms = programLinks.slice(0, 5)
  const { locale } = useLang()
  const t = (key: string, fallback?: string) => translate(landingDict, locale, key, fallback)
  const [publicSettings, setPublicSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true
    fetchPublicSettings([
      'landing.contact_address',
      'landing.contact_phone',
      'landing.contact_phone_display',
      'landing.contact_phone_link',
      'landing.contact_email',
      'landing.contact_email_link',
      'landing.contact_map_jakarta_embed',
      'landing.contact_map_jakarta_link',
      'landing.contact_map_medan_embed',
      'landing.contact_map_medan_link',
      'landing.social_whatsapp_link',
    ])
      .then((settings) => {
        if (active) setPublicSettings(settings)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const addressText = publicSettings['landing.contact_address']?.trim() || t('footer.address')
  const addressLines = addressText.split('\n').filter(Boolean)
  const phoneNumber = publicSettings['landing.contact_phone']?.trim() || '0813-1176-8254'
  const phoneDisplay =
    publicSettings['landing.contact_phone_display']?.trim() || `${phoneNumber} (DPF Official)`
  const phoneLink = publicSettings['landing.contact_phone_link']?.trim() || 'https://wa.me/6281311768254'
  const emailText = publicSettings['landing.contact_email']?.trim() || 'layanan@dpf.or.id'
  const emailLink =
    publicSettings['landing.contact_email_link']?.trim() || `mailto:${emailText}`
  const jakartaMapEmbed =
    publicSettings['landing.contact_map_jakarta_embed']?.trim() ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63458.32104835289!2d106.80576511303089!3d-6.2446057999999915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3804815921d%3A0x6b5d698d11d225a9!2sDPF%20(Djalaludin%20Pane%20Foundation)!5e0!3m2!1sid!2sid!4v1768288510620!5m2!1sid!2sid'
  const jakartaMapLink =
    publicSettings['landing.contact_map_jakarta_link']?.trim() ||
    'https://maps.google.com/?q=-6.24460046114402,106.86403477404349'
  const medanMapEmbed =
    publicSettings['landing.contact_map_medan_embed']?.trim() ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15928.511404694102!2d98.62002560195295!3d3.5580108814351994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30312fae9de99267%3A0xf1b47cb5a453853e!2sLAZNAS%20DPF!5e0!3m2!1sid!2sid!4v1768288065923!5m2!1sid!2sid'
  const medanMapLink = publicSettings['landing.contact_map_medan_link']?.trim()
  const whatsappLink = publicSettings['landing.social_whatsapp_link']?.trim() || phoneLink

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-brandGreen-700 via-brandGreen-800 to-primary-700 text-slate-100">

      {/* Lighting Effects for Premium Feel */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-20 top-0 h-[500px] w-[500px] rounded-full bg-brandGreen-500/10 blur-[100px]" />
        <div className="absolute bottom-0 -right-20 h-[500px] w-[500px] rounded-full bg-primary-600/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-16 lg:px-8">
        {/* GRID LAYOUT: 12 Columns System */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">

          {/* KOLOM 1: BRAND (Span 4) */}
          <div className="lg:col-span-4 space-y-6 pr-0 lg:pr-6">
            {/* Logo */}
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg shadow-white/5">
                <img src={dpfLogo} alt="DPF Logo" className="h-10 w-auto object-contain" />
              </div>
              <div className="space-y-2">
                <div>
                  <span className="block text-xl font-bold font-heading text-white tracking-tight">
                    DPF ZISWAF
                  </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
                    {t('nav.tagline', 'Amanah | Profesional')}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed text-slate-300/90 font-light whitespace-pre-line">
              {t('footer.description')}
            </p>

            <div className="flex flex-col items-start gap-3 pt-2">
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm ring-1 ring-white/20 transition-all hover:bg-emerald-600 hover:ring-emerald-600 hover:shadow-lg hover:-translate-y-0.5"
              >
                <FontAwesomeIcon icon={faHandHoldingHeart} />
                <span>Salurkan Donasi</span>
              </Link>
              <div className="flex items-center gap-3">
                <SocialIcon href={whatsappLink} icon={faWhatsapp} variant="wa" />
                <SocialIcon href="https://instagram.com/wakafdpf/" icon={faInstagram} variant="ig" />
                <SocialIcon href="https://www.tiktok.com/@dpf.or.id" icon={faTiktok} variant="tiktok" />
                <SocialIcon href="https://www.youtube.com/@dpfofficial" icon={faYoutube} variant="yt" />
                <SocialIcon
                  href="https://www.facebook.com/people/Djalaluddin-Pane/pfbid02KjuGjczQitKPCZqDu8QvXHywyEoz17FroATYcY1meQVV4yu5mH9YQj5C84W1WkPxl/"
                  icon={faFacebookF}
                  variant="fb"
                />
              </div>
            </div>
          </div>

          {/* KOLOM 2: NAVIGASI (Span 2) */}
          <div className="lg:col-span-3 lg:pl-2">
            <FooterHeading>{t('footer.explore')}</FooterHeading>
            <ul className="space-y-3">
              <FooterLinkItem to="/" label={t('nav.home')} />
              <FooterLinkItem to="/layanan" label={t('nav.services')} />
              <FooterLinkItem to="/program" label={t('nav.programs')} />
              <FooterLinkItem to="/literasi" label={t('nav.literacy')} />
              <FooterLinkItem to="/tentang-kami" label={t('nav.about')} />
            </ul>
          </div>

          {/* KOLOM 3: PROGRAM (Span 3) */}
          <div className="lg:col-span-2">
            <FooterHeading>{t('footer.programHighlight')}</FooterHeading>
            {limitedPrograms.length ? (
              <ul className="space-y-3">
                {limitedPrograms.map((p) => (
                  <FooterLinkItem key={p.href} to={p.href} label={p.label} />
                ))}
              </ul>
            ) : (
               // Default fallback if no props
              <ul className="space-y-3">
                 <FooterLinkItem to="/program/wakaf" label={t('footer.program.wakafIncome', 'Wakaf Penghasilan')} />
                 <FooterLinkItem to="/program/pendidikan" label={t('footer.program.beasiswa', 'Beasiswa Dhuafa')} />
                 <FooterLinkItem to="/program/wakaf" label={t('footer.program.wakaf', 'Wakaf Produktif')} />
                 <FooterLinkItem to="/program/kemanusiaan" label={t('footer.program.kemanusiaan', 'Bantuan Bencana')} />
              </ul>
            )}
          </div>

          {/* KOLOM 4: KONTAK (Span 3) */}
          <div className="lg:col-span-3">
            <FooterHeading>{t('footer.contact')}</FooterHeading>
            <ul className="space-y-4 text-sm">
               <ContactItem
                 icon={faMapLocationDot}
                 text={
                   <>
                     {addressLines.map((line, index) => {
                       const isLabel = line.trim().endsWith(':')
                       const spacingClass = isLabel && index !== 0 ? 'mt-3' : ''
                       const textClass = isLabel
                         ? 'block font-semibold text-white/90'
                         : 'block text-slate-300/90'
                       return (
                         <span key={`${line}-${index}`} className={`${textClass} ${spacingClass}`}>
                           {line}
                         </span>
                       )
                     })}
                   </>
                 }
               />
               <ContactItem
                 icon={faPhone}
                 text={phoneDisplay}
                 href={phoneLink}
               />
               <ContactItem
                 icon={faEnvelope}
                 text={emailText}
                 href={emailLink}
               />
            </ul>

          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col">
            <div className="overflow-hidden rounded-xl border border-white/10 shadow-lg">
              <iframe
                src={jakartaMapEmbed}
                width="100%"
                height="220"
                style={{ border: 0 }}
                loading="lazy"
                title="Lokasi DPF Jakarta"
                className="opacity-85 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <a
              href={jakartaMapLink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-emerald-300 transition-colors"
            >
              <FontAwesomeIcon icon={faMapLocationDot} className="h-4 w-4" />
              Lihat di Google Maps (Jakarta)
            </a>
          </div>
          <div className="flex flex-col">
            <div className="overflow-hidden rounded-xl border border-white/10 shadow-lg">
              <iframe
                src={medanMapEmbed}
                width="100%"
                height="220"
                style={{ border: 0 }}
                loading="lazy"
                title="Lokasi DPF Medan"
                className="opacity-85 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            {medanMapLink ? (
              <a
                href={medanMapLink}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-emerald-300 transition-colors"
              >
                <FontAwesomeIcon icon={faMapLocationDot} className="h-4 w-4" />
                Lihat di Google Maps (Medan)
              </a>
            ) : null}
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="mt-16 border-t border-white/10 pt-8 flex flex-col items-center justify-between gap-4 md:flex-row text-xs text-slate-400">
          <p className="text-center md:text-left text-white">
            &copy; {currentYear} DPF ZISWAF. {t('footer.copyright', 'Dikelola oleh Yayasan DPF Indonesia.')}
          </p>
        </div>

      </div>
    </footer>
  )
}

// --- SUB COMPONENTS (Untuk menjaga kode tetap bersih) ---

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-white/90 mb-6 font-heading border-l-2 border-emerald-500 pl-3">
      {children}
    </h3>
  )
}

function FooterLinkItem({ to, label }: { to: string; label: string }) {
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

function ContactItem({ icon, text, href }: { icon: IconProp; text: ReactNode; href?: string }) {
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

function SocialIcon({
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
