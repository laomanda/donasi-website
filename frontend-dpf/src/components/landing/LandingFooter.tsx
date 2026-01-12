import dpfLogo from '../../brand/dpf-icon.png'
import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import {
  faChevronRight,
  faEnvelope,
  faMapLocationDot,
  faPhone,
  faHandHoldingHeart,
} from '@fortawesome/free-solid-svg-icons'
import { faInstagram, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { Link } from 'react-router-dom'
import { useLang } from '../../lib/i18n'
import { landingDict, translate } from '../../i18n/landing'

type FooterProgramLink = { label: string; href: string }

type LandingFooterProps = {
  programLinks?: FooterProgramLink[]
}

export function LandingFooter({ programLinks = [] }: LandingFooterProps) {
  const currentYear = new Date().getFullYear()
  const limitedPrograms = programLinks.slice(0, 5)
  const { locale } = useLang()
  const t = (key: string, fallback?: string) => translate(landingDict, locale, key, fallback)

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-brandGreen-700 via-brandGreen-800 to-primary-700 text-slate-100">

      {/* Lighting Effects for Premium Feel */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-20 top-0 h-[500px] w-[500px] rounded-full bg-brandGreen-500/10 blur-[100px]" />
        <div className="absolute bottom-0 -right-20 h-[500px] w-[500px] rounded-full bg-primary-600/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-16 lg:px-8">
        {/* GRID LAYOUT: 12 Columns System */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">

          {/* KOLOM 1: BRAND (Span 4) */}
          <div className="lg:col-span-4 space-y-6 pr-0 lg:pr-8">
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

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm ring-1 ring-white/20 transition-all hover:bg-emerald-600 hover:ring-emerald-600 hover:shadow-lg hover:-translate-y-0.5"
              >
                <FontAwesomeIcon icon={faHandHoldingHeart} />
                <span>Salurkan Donasi</span>
              </Link>
              <SocialIcon href="#" icon={faInstagram} variant="ig" />
              <SocialIcon href="#" icon={faXTwitter} variant="x" />
            </div>
          </div>

          {/* KOLOM 2: NAVIGASI (Span 2) */}
          <div className="lg:col-span-2 lg:pl-4">
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
          <div className="lg:col-span-3">
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
                 <FooterLinkItem to="/program/zakat" label={t('footer.program.zakat', 'Zakat Penghasilan')} />
                 <FooterLinkItem to="/program/pendidikan" label={t('footer.program.beasiswa', 'Beasiswa Dhuafa')} />
                 <FooterLinkItem to="/program/wakaf" label={t('footer.program.wakaf', 'Wakaf Produktif')} />
                 <FooterLinkItem to="/program/kemanusiaan" label={t('footer.program.kemanusiaan', 'Bantuan Bencana')} />
              </ul>
            )}
          </div>

          {/* KOLOM 4: KONTAK (Span 3) */}
          <div className="lg:col-span-3">
            <FooterHeading>{t('footer.contact')}</FooterHeading>
            <ul className="space-y-5 text-sm">
               <ContactItem
                 icon={faMapLocationDot}
                 text={
                    <>
                       {t('footer.address').split('\n')[0]}<br/>
                       {t('footer.address').split('\n')[1]}
                    </>
                 }
               />
               <ContactItem
                 icon={faPhone}
                 text="+62 812-3456-7890"
                 href="tel:6281234567890"
               />
               <ContactItem
                 icon={faEnvelope}
                 text="layanan@dpf.or.id"
                 href="mailto:layanan@dpf.or.id"
               />
            </ul>

            <div className="mt-6 space-y-2">
              <div className="overflow-hidden rounded-xl border border-white/10 shadow-lg">
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=106.85403477404349%2C-6.25460046114402%2C106.87403477404349%2C-6.23460046114402&layer=mapnik&marker=-6.24460046114402%2C106.86403477404349"
                  width="100%"
                  height="180"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="Lokasi DPF"
                  className="opacity-85 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href="https://maps.google.com/?q=-6.24460046114402,106.86403477404349"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-emerald-300 transition-colors"
              >
                <FontAwesomeIcon icon={faMapLocationDot} className="h-4 w-4" />
                Lihat di Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="mt-16 border-t border-white/10 pt-8 flex flex-col items-center justify-between gap-4 md:flex-row text-xs text-slate-400">
          <p className="text-center md:text-left text-white">
            &copy; {currentYear} DPF ZISWAF. {t('footer.copyright', 'Dikelola oleh Yayasan DPF Indonesia.')}
          </p>
          <div className="flex gap-6 font-medium text-white">
             <Link to="/kebijakan-privasi" className="hover:text-emerald-400 transition-colors">{t('footer.privacy', 'Privasi')}</Link>
             <Link to="/syarat-ketentuan" className="hover:text-emerald-400 transition-colors">{t('footer.tos', 'Syarat & Ketentuan')}</Link>
             <Link to="/faq" className="hover:text-emerald-400 transition-colors">{t('footer.help', 'Bantuan')}</Link>
          </div>
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
        <a href={href} className="flex gap-3 hover:text-white transition-colors">
          {content}
        </a>
      </li>
    )
  }

  return <li className="flex gap-3 cursor-default">{content}</li>
}

function SocialIcon({ href, icon, variant }: { href: string; icon: IconProp; variant: 'ig' | 'x' }) {
  const hoverStyles = {
    ig: 'hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:border-transparent',
    x: 'hover:bg-black hover:border-transparent',
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
