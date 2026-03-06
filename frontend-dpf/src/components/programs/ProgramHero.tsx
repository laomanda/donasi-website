interface ProgramHeroProps {
  t: (key: string, fallback?: string) => string;
}

export function ProgramHero({ t }: ProgramHeroProps) {
  return (
    <section className="relative overflow-hidden bg-slate-50 pb-20 pt-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-brandGreen-50 px-3 py-1 text-xs font-semibold text-brandGreen-700 ring-1 ring-brandGreen-100">
            {t("program.list.badge")}
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl font-heading">
            {t("program.list.title.leading")}{" "}
            <span className="text-brandGreen-600">{t("program.list.title.highlight")}</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            {t("program.list.subtitle")}
          </p>
        </div>
      </div>
    </section>
  );
}
