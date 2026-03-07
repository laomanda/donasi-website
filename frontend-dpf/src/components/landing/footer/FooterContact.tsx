import { faEnvelope, faMapLocationDot, faPhone } from '@fortawesome/free-solid-svg-icons'
import { FooterHeading, ContactItem } from './FooterUI'

type FooterContactProps = {
  t: (key: string, fallback?: string) => string
  addressLines: string[]
  phoneDisplay: string
  phoneLink: string
  emailText: string
  emailLink: string
}

export function FooterContact({
  t,
  addressLines,
  phoneDisplay,
  phoneLink,
  emailText,
  emailLink,
}: FooterContactProps) {
  return (
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
  )
}
