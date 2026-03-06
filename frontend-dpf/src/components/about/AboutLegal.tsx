import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

type AboutLegalProps = {
  t: (key: string, fallback?: string) => string;
  legalItems: string[];
};

export function AboutLegal({ t, legalItems }: AboutLegalProps) {
  return (
    <section id="legalitas" className="bg-slate-50 pt-16 pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-8 shadow-[0_22px_70px_-45px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <FontAwesomeIcon icon={faShieldHalved} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">{t("about.legal.label")}</p>
              <h3 className="text-xl font-heading font-semibold text-slate-900">{t("about.legal.heading")}</h3>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {legalItems.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-sm">
                <FontAwesomeIcon icon={faCheckCircle} className="mt-1 text-primary-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://wa.me/6281311768254"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brandGreen-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brandGreen-500/25 transition hover:-translate-y-0.5 hover:bg-brandGreen-700"
            >
              <FontAwesomeIcon icon={faWhatsapp} />
              {t("about.legal.cta.collab")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
