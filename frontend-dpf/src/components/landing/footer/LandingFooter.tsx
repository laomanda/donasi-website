import { useLandingFooter } from './useLandingFooter'
import { FooterBrand } from './FooterBrand'
import { FooterNavigation } from './FooterNavigation'
import { FooterContact } from './FooterContact'
import { FooterTagsAndMap } from './FooterTagsAndMap'
import { FooterBottom } from './FooterBottom'

type FooterProgramLink = { label: string; href: string }

type LandingFooterProps = {
  programLinks?: FooterProgramLink[]
}

export function LandingFooter({ programLinks = [] }: LandingFooterProps) {
  const {
    t,
    tags,
    addressLines,
    phoneDisplay,
    phoneLink,
    emailText,
    emailLink,
    jakartaMapEmbed,
    jakartaMapLink,
    whatsappLink,
    currentYear,
  } = useLandingFooter()

  const limitedPrograms = programLinks.slice(0, 5)

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-brandGreen-700 via-brandGreen-800 to-primary-700 text-slate-100">
      {/* Lighting Effects for Premium Feel */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-20 top-0 h-[500px] w-[500px] rounded-full bg-brandGreen-500/10 blur-[100px]" />
        <div className="absolute bottom-0 -right-20 h-[500px] w-[500px] rounded-full bg-primary-600/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <FooterBrand t={t} whatsappLink={whatsappLink} />
          <FooterNavigation t={t} limitedPrograms={limitedPrograms} />
          <FooterContact
            t={t}
            addressLines={addressLines}
            phoneDisplay={phoneDisplay}
            phoneLink={phoneLink}
            emailText={emailText}
            emailLink={emailLink}
          />
        </div>

        <FooterTagsAndMap
          tags={tags}
          jakartaMapEmbed={jakartaMapEmbed}
          jakartaMapLink={jakartaMapLink}
        />

        <FooterBottom currentYear={currentYear} t={t} />
      </div>
    </footer>
  )
}
