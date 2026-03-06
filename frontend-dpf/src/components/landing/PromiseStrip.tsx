import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck, faReceipt, faUserGroup, faArrowRight } from "@fortawesome/free-solid-svg-icons";

export function PromiseStrip({ t }: { t: (k: string, f?: string) => string }) {
  const promiseItems = useMemo(
    () => [
      {
        title: t("landing.promise.jemput.title"),
        text: t("landing.promise.jemput.text"),
        icon: faTruck,
        href: "/jemput-wakaf",
      },
      {
        title: t("landing.promise.konfirmasi.title"),
        text: t("landing.promise.konfirmasi.text"),
        icon: faReceipt,
        href: "/konfirmasi-donasi",
      },
      {
        title: t("landing.promise.konsultasi.title"),
        text: t("landing.promise.konsultasi.text"),
        icon: faUserGroup,
        href: "/konsultasi",
      },
    ],
    [t]
  );

  return (
    <section className="relative bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-2 pb-8">
          <h2 className="text-3xl sm:text-4xl font-heading font-semibold text-slate-900">
            {t("landing.promise.title")}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {t("landing.promise.subtitle")}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {promiseItems.map((item) => (
            <Link
              to={item.href}
              key={item.title}
              className="group flex h-full flex-col gap-4 rounded-[28px] border border-slate-100 bg-gradient-to-b from-slate-50 to-white px-5 py-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-brandGreen-200 hover:shadow-[0_20px_60px_-25px_rgba(22,101,52,0.25)]"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brandGreen-50 text-brandGreen-600 shadow-sm transition-colors group-hover:bg-brandGreen-600 group-hover:text-white">
                  <FontAwesomeIcon icon={item.icon} className="text-xl" />
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xl font-heading font-semibold text-slate-900 leading-snug group-hover:text-brandGreen-700 transition-colors">{item.title}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
              </div>

              <div
                className="mt-auto inline-flex w-fit items-center justify-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 shadow-sm transition-all group-hover:bg-gradient-to-r group-hover:from-brandGreen-500 group-hover:to-brandGreen-600 group-hover:text-white group-hover:border-transparent"
              >
                {t("landing.promise.more")}
                <FontAwesomeIcon icon={faArrowRight} className="text-xs transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
