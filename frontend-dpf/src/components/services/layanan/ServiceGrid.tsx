import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faTruckRampBox, faClipboardCheck, faHeadset } from "@fortawesome/free-solid-svg-icons";

export type Service = {
  key: "jemput" | "konfirmasi" | "konsultasi";
  titleKey: string;
  descriptionKey: string;
  icon: any;
  badgeKey: string;
  link: string;
  ctaKey: string;
};

export const SERVICES: Service[] = [
  {
    key: "jemput",
    titleKey: "layanan.services.pickup.title",
    descriptionKey: "layanan.services.pickup.desc",
    icon: faTruckRampBox,
    badgeKey: "layanan.services.pickup.badge",
    link: "/jemput-wakaf",
    ctaKey: "layanan.services.pickup.cta",
  },
  {
    key: "konfirmasi",
    titleKey: "layanan.services.confirm.title",
    descriptionKey: "layanan.services.confirm.desc",
    icon: faClipboardCheck,
    badgeKey: "layanan.services.confirm.badge",
    link: "/konfirmasi-donasi",
    ctaKey: "layanan.services.confirm.cta",
  },
  {
    key: "konsultasi",
    titleKey: "layanan.services.consult.title",
    descriptionKey: "layanan.services.consult.desc",
    icon: faHeadset,
    badgeKey: "layanan.services.consult.badge",
    link: "/konsultasi",
    ctaKey: "layanan.services.consult.cta",
  },
];

type ServiceGridProps = {
  translate: (key: string) => string;
  heading: string;
  subtitle: string;
  badge: string;
};

export function ServiceGrid({ translate, heading, subtitle, badge }: ServiceGridProps) {
  return (
    <section id="layanan" className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-primary-700 shadow-sm">
              {badge}
            </p>
            <h2 className="text-3xl font-heading font-semibold text-slate-900 sm:text-4xl">{heading}</h2>
            <p className="text-sm text-slate-600 max-w-xl">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {SERVICES.map((service) => {
            const title = translate(service.titleKey);
            const desc = translate(service.descriptionKey);
            const serviceBadge = translate(service.badgeKey);
            const cta = translate(service.ctaKey);
            return (
              <article
                key={service.titleKey}
                className="group flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-slate-100 bg-white shadow-[0_25px_60px_-40px_rgba(0,0,0,0.4)] transition-shadow hover:shadow-[0_28px_70px_-38px_rgba(0,0,0,0.45)]"
              >
                <div className="flex items-center justify-between px-5 pt-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700 shadow-sm">
                    <FontAwesomeIcon icon={service.icon} className="text-lg" />
                  </div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold text-primary-700 shadow-sm ring-1 ring-primary-100">
                    {serviceBadge}
                  </span>
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-heading font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
                  <Link
                    to={service.link}
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 transition hover:gap-3"
                  >
                    {cta}
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
