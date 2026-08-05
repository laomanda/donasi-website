type FooterBottomProps = {
  currentYear?: number
  t?: (key: string, fallback?: string) => string
}

export function FooterBottom(_props?: FooterBottomProps) {
  return (
    <div className="mt-16 border-t border-white/10 pt-8 flex flex-col items-center justify-between gap-4 md:flex-row text-xs text-slate-300">
      <p className="text-center md:text-left text-slate-300">
        © Dibuat Oleh Jakkob, Raihan dan TIM DPF WAKAF
      </p>
    </div>
  )
}
