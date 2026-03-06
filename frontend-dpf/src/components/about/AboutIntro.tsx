import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPeopleGroup } from "@fortawesome/free-solid-svg-icons";

type AboutIntroProps = {
  t: (key: string, fallback?: string) => string;
};

export function AboutIntro({ t }: AboutIntroProps) {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-8 shadow-[0_22px_70px_-45px_rgba(0,0,0,0.4)]">
          <div className="flex items-start gap-4 border-b border-slate-100 pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <FontAwesomeIcon icon={faPeopleGroup} className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">{t("about.section.intro.label")}</p>
              <h2 className="text-2xl font-heading font-semibold text-slate-900">{t("about.section.intro.heading")}</h2>
            </div>
          </div>
          <p className="mt-6 text-base leading-relaxed text-slate-700">
            {t("about.section.intro.body")}
          </p>
        </div>
      </div>
    </section>
  );
}
