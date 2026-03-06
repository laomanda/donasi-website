import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimeline, faStar } from "@fortawesome/free-solid-svg-icons";
import type { TimelineItem } from "./AboutShared";

type AboutHistoryProps = {
  t: (key: string, fallback?: string) => string;
  timelineCards: (TimelineItem & { titleKey: string; descKey: string; yearKey?: string })[];
};

export function AboutHistory({ t, timelineCards }: AboutHistoryProps) {
  return (
    <section className="relative overflow-hidden bg-slate-50">
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
            <FontAwesomeIcon icon={faTimeline} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">{t("about.history.label")}</p>
            <h2 className="text-2xl font-heading font-semibold text-slate-900">{t("about.history.heading")}</h2>
          </div>
        </div>

        <p className="mt-6 text-base leading-relaxed text-slate-700">
          {t("about.history.body1")}
        </p>
        <p className="mt-4 text-base leading-relaxed text-slate-700">
          {t("about.history.body2")}
        </p>
        <p className="mt-4 text-base leading-relaxed text-slate-700">
          {t("about.history.body3")}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {timelineCards.map((item) => (
            <div key={item.yearKey ?? item.year} className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700">{item.year}</span>
                <FontAwesomeIcon icon={faStar} className="text-primary-400" />
              </div>
              <h3 className="mt-2 text-lg font-heading font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
