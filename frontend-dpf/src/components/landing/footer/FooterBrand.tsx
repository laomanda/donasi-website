import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandHoldingHeart } from '@fortawesome/free-solid-svg-icons'
import { faFacebookF, faInstagram, faTiktok, faYoutube, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { dpfWakaf } from "@/assets/brand";
import { SocialIcon } from './FooterUI'

type FooterBrandProps = {
  t: (key: string, fallback?: string) => string
  whatsappLink: string
}

export function FooterBrand({ t, whatsappLink }: FooterBrandProps) {
  return (
    <div className="lg:col-span-4 space-y-6 pr-0 lg:pr-6">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center">
          <img
            src={dpfWakaf}
            alt="DPF Logo"
            width="48"
            height="48"
            loading="lazy"
            className="h-12 w-12 rounded-full object-contain"
          />
        </div>
        <div>
          <span className="block text-xl font-bold font-heading text-white tracking-tight leading-tight">
            DPF WAKAF
          </span>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-100/90 leading-tight mt-1">
            {t('nav.tagline', 'AMANAH | PROFESIONAL')}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-slate-300/90 font-light whitespace-pre-line">
        {t('footer.description')}
      </p>

      <div className="flex flex-col items-start gap-3 pt-2">
        <Link
          to="/donate#donate-form-section"
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm ring-1 ring-white/20 transition-all hover:bg-emerald-600 hover:ring-emerald-600 hover:shadow-lg hover:-translate-y-0.5"
        >
          <FontAwesomeIcon icon={faHandHoldingHeart} />
          <span>Salurkan Wakaf</span>
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
  )
}
