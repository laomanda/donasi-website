import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandHoldingHeart } from '@fortawesome/free-solid-svg-icons'
import { faFacebookF, faInstagram, faTiktok, faYoutube, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { dpfIcon } from "@/assets/brand";
import { SocialIcon } from './FooterUI'

type FooterBrandProps = {
  t: (key: string, fallback?: string) => string
  whatsappLink: string
}

export function FooterBrand({ t, whatsappLink }: FooterBrandProps) {
  return (
    <div className="lg:col-span-4 space-y-6 pr-0 lg:pr-6">
      {/* Logo */}
      <div className="flex items-center gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg shadow-white/5">
                    <img
                        src={dpfIcon}
                        alt="DPF Logo"
                        className="h-full w-full object-contain p-1"
                    />
        </div>
        <div className="space-y-2">
          <div>
            <span className="block text-xl font-bold font-heading text-white tracking-tight">
              DPF WAKAF
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
          to="/donate#donate-form-section"
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
  )
}
