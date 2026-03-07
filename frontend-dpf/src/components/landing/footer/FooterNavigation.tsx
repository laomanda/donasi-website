import { FooterHeading, FooterLinkItem } from './FooterUI'

type FooterNavigationProps = {
  t: (key: string, fallback?: string) => string
  limitedPrograms: { label: string; href: string }[]
}

export function FooterNavigation({ t, limitedPrograms }: FooterNavigationProps) {
  return (
    <>
      {/* KOLOM 2: NAVIGASI (Span 3) */}
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

      {/* KOLOM 3: PROGRAM (Span 2) */}
      <div className="lg:col-span-2">
        <FooterHeading>{t('footer.programHighlight')}</FooterHeading>
        {limitedPrograms.length ? (
          <ul className="space-y-3">
            {limitedPrograms.map((p) => (
              <FooterLinkItem key={p.href} to={p.href} label={p.label} />
            ))}
          </ul>
        ) : (
          <ul className="space-y-3">
             <FooterLinkItem to="/program/wakaf" label={t('footer.program.wakafIncome', 'Wakaf Penghasilan')} />
             <FooterLinkItem to="/program/pendidikan" label={t('footer.program.beasiswa', 'Beasiswa Dhuafa')} />
             <FooterLinkItem to="/program/wakaf" label={t('footer.program.wakaf', 'Wakaf Produktif')} />
             <FooterLinkItem to="/program/kemanusiaan" label={t('footer.program.kemanusiaan', 'Bantuan Bencana')} />
          </ul>
        )}
      </div>
    </>
  )
}
