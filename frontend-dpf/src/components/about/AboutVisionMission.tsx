import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHandHoldingHeart, 
  faHeartPulse, 
  faCheckCircle 
} from "@fortawesome/free-solid-svg-icons";
import type { ValueCard } from "./AboutShared";

type AboutVisionMissionProps = {
  t: (key: string, fallback?: string) => string;
  missionList: string[];
  missionItemKeys: string[];
  valueCards: ValueCard[];
};

export function AboutVisionMission({ t, missionList, missionItemKeys, valueCards }: AboutVisionMissionProps) {
  return (
    <section id="visi-misi" className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brandGreen-600 to-emerald-500 p-10 text-white shadow-[0_28px_80px_-50px_rgba(16,185,129,0.65)]">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-50">{t("about.vision.label")}</p>
            <div className="mt-4 text-4xl">"</div>
            <p className="text-2xl leading-relaxed font-heading">{t("about.vision.text")}</p>
            <div className="mt-6 flex items-center gap-3 text-emerald-100">
              <FontAwesomeIcon icon={faHandHoldingHeart} />
              <span className="text-sm font-semibold">{t("about.vision.tagline")}</span>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-100 bg-white p-8 shadow-[0_22px_70px_-45px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <FontAwesomeIcon icon={faHeartPulse} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-700">{t("about.mission.label")}</p>
                <h3 className="text-lg font-heading font-semibold text-slate-900">{t("about.mission.heading")}</h3>
              </div>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
              {missionItemKeys.map((key, idx) => (
                <li key={key} className="flex gap-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="mt-1 text-primary-600" />
                  <span>{missionList[idx]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* values */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {valueCards.map((val) => (
            <div key={val.title} className="flex h-full flex-col rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary-700 shadow-sm">
                <FontAwesomeIcon icon={val.icon} />
              </div>
              <h4 className="mt-3 text-lg font-heading font-semibold text-slate-900">{val.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
