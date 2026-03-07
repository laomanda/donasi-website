type FooterBottomProps = {
  currentYear: number
  t: (key: string, fallback?: string) => string
}

export function FooterBottom({ currentYear, t }: FooterBottomProps) {
  return (
    <div className="mt-16 border-t border-white/10 pt-8 flex flex-col items-center justify-between gap-4 md:flex-row text-xs text-slate-400">
      <p className="text-center md:text-left text-white">
        &copy; {currentYear} DPF WAKAF {t('footer.copyright', 'Dikelola oleh Yayasan DPF Indonesia.')}
      </p>
    </div>
  )
}
