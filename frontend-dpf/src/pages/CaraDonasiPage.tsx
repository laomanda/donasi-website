import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCheckCircle,
  faCreditCard,
  faHandHoldingHeart,
  faHeadset,
  faMobileScreenButton,
  faPaperPlane,
  faShieldHalved,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { LandingLayout } from "../layouts/LandingLayout";
import { WaveDivider } from "../components/landing/WaveDivider";
import http from "../lib/http";
import { useLang } from "../lib/i18n";
import { landingDict, translate as translateLanding } from "../i18n/landing";

type BankAccount = {
  id: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  branch?: string | null;
  is_visible?: boolean;
  notes?: string | null;
};

type OrganizationResponse = {
  bank_accounts?: BankAccount[];
};

const manualSteps = [
  "donasi.manual.step1",
  "donasi.manual.step2",
  "donasi.manual.step3",
];

const midtransSteps = [
  "donasi.midtrans.step1",
  "donasi.midtrans.step2",
  "donasi.midtrans.step3",
];

export function CaraDonasiPage() {
  const { locale } = useLang();
  const t = (key: string, fallback?: string) => translateLanding(landingDict, locale, key, fallback);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<"fetch_failed" | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    http
      .get<OrganizationResponse>("/organization")
      .then((res) => {
        if (!active) return;
        setAccounts(res.data?.bank_accounts ?? []);
        setErrorKey(null);
      })
      .catch(() => {
        if (!active) return;
        setErrorKey("fetch_failed");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const visibleAccounts = accounts.filter((a) => a.is_visible !== false);

  return (
    <LandingLayout footerWaveBgClassName="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-brandGreen-50">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 top-16 h-72 w-72 rounded-full bg-primary-200/30 blur-[110px]" />
          <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-brandGreen-200/35 blur-[120px]" />
          <div className="absolute inset-x-10 top-1/3 h-24 rounded-full bg-white/60 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-18 pt-24 sm:px-6 lg:grid-cols-[1.05fr,0.95fr] lg:items-center lg:px-8 lg:pt-28">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary-700 shadow-sm">
              {t("donasi.hero.badge")}
            </span>
            <h1 className="font-heading text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
              {t("donasi.hero.title.leading")} <span className="text-primary-500">{t("donasi.hero.title.highlight1")}</span> & <span className="text-brandGreen-600">{t("donasi.hero.title.highlight2")}</span>
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-slate-700">
              {t("donasi.hero.subtitle")}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/donate"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:bg-primary-700"
              >
                <FontAwesomeIcon icon={faCreditCard} />
                {t("donasi.hero.cta.midtrans")}
              </a>
              <a
                href="/konfirmasi-donasi"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brandGreen-200 bg-white px-6 py-3 text-sm font-semibold text-brandGreen-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brandGreen-300 hover:text-brandGreen-800"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                {t("donasi.hero.cta.manual")}
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-[0_25px_80px_-50px_rgba(0,0,0,0.4)] backdrop-blur">
              <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brandGreen-600 to-primary-600 px-4 py-3 text-white shadow-lg">
                <FontAwesomeIcon icon={faShieldHalved} className="text-lg" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]">{t("donasi.hero.trust.badge")}</p>
                  <p className="text-base font-bold leading-tight">{t("donasi.hero.trust.title")}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InfoPill icon={faCheckCircle} label={t("donasi.hero.pills.1")} />
                <InfoPill icon={faMobileScreenButton} label={t("donasi.hero.pills.2")} />
                <InfoPill icon={faHandHoldingHeart} label={t("donasi.hero.pills.3")} />
                <InfoPill icon={faHeadset} label={t("donasi.hero.pills.4")} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider fillClassName="fill-white" className="-mt-1" />

      {/* METODE */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <MethodCard
              title={t("donasi.methods.midtrans.title")}
              description={t("donasi.methods.midtrans.desc")}
              steps={midtransSteps.map((k) => t(k))}
              cta={{ href: "/donate", label: t("donasi.methods.midtrans.cta") }}
              icon={faCreditCard}
            />
            <MethodCard
              title={t("donasi.methods.manual.title")}
              description={t("donasi.methods.manual.desc")}
              steps={manualSteps.map((k) => t(k))}
              cta={{ href: "/konfirmasi-donasi", label: t("donasi.methods.manual.cta") }}
              icon={faWallet}
            />
          </div>
        </div>
      </section>

      {/* REKENING */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brandGreen-50 text-brandGreen-700">
              <FontAwesomeIcon icon={faWallet} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brandGreen-700">{t("donasi.accounts.badge")}</p>
              <h2 className="text-2xl font-heading font-semibold text-slate-900">{t("donasi.accounts.heading")}</h2>
            </div>
          </div>

          {errorKey && (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {t("donasi.accounts.error")}
            </div>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, idx) => <AccountSkeleton key={`acc-skel-${idx}`} />)
              : visibleAccounts.length > 0
              ? visibleAccounts.map((acc) => <AccountCard key={acc.id} account={acc} />)
              : (
                <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                    {t("donasi.accounts.empty")}
                  </div>
                )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white pb-20">
        <div className="mx-auto max-w-5xl rounded-[28px] border border-slate-100 bg-gradient-to-r from-brandGreen-600 to-primary-600 px-6 py-10 text-white shadow-[0_28px_80px_-50px_rgba(16,185,129,0.6)] sm:px-10">
          <div className="grid gap-6 sm:grid-cols-[1.2fr,0.8fr] sm:items-center">
            <div className="space-y-3">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-50">{t("donasi.cta.badge")}</p>
              <h3 className="text-3xl font-heading font-semibold leading-tight">{t("donasi.cta.heading")}</h3>
              <p className="text-sm text-emerald-50">{t("donasi.cta.subtitle")}</p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <a
                href="/donate"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5"
              >
                <FontAwesomeIcon icon={faCreditCard} />
                {t("donasi.cta.midtrans")}
              </a>
              <a
                href="/konfirmasi-donasi"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/60 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                {t("donasi.cta.manual")}
              </a>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

function InfoPill({ icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white bg-white/80 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brandGreen-50 text-brandGreen-700">
        <FontAwesomeIcon icon={icon} />
      </span>
      <span>{label}</span>
    </div>
  );
}

function MethodCard({
  title,
  description,
  steps,
  cta,
  icon,
}: {
  title: string;
  description: string;
  steps: string[];
  cta: { href: string; label: string };
  icon: any;
}) {
  return (
    <article className="flex h-full flex-col rounded-[22px] border border-slate-100 bg-white p-6 shadow-[0_25px_60px_-40px_rgba(0,0,0,0.4)] transition hover:-translate-y-1 hover:shadow-[0_28px_70px_-38px_rgba(0,0,0,0.45)]">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brandGreen-50 text-brandGreen-700 shadow-sm">
          <FontAwesomeIcon icon={icon} className="text-lg" />
        </span>
        <div>
          <h3 className="text-xl font-heading font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600">
        {steps.map((step) => (
          <li key={step} className="flex gap-2">
            <FontAwesomeIcon icon={faCheckCircle} className="mt-1 text-brandGreen-600" />
            <span>{step}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-4">
        <a
          href={cta.href}
          className="inline-flex items-center gap-2 text-sm font-bold text-brandGreen-700 transition hover:gap-3"
        >
          {cta.label}
          <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
        </a>
      </div>
    </article>
  );
}

function AccountCard({ account }: { account: BankAccount }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.4)]">
      <div className="space-y-1.5">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brandGreen-700">{account.bank_name}</p>
        <p className="text-lg font-heading font-semibold text-slate-900">{account.account_number}</p>
        <p className="text-sm font-semibold text-slate-700">{account.account_name}</p>
        {account.branch && <p className="text-xs text-slate-500">Cabang: {account.branch}</p>}
        {account.notes && <p className="text-xs text-slate-500">{account.notes}</p>}
      </div>
      <div className="pt-3 text-xs text-slate-500">Gunakan tepat sesuai nama & nomor rekening.</div>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.35)] animate-pulse space-y-3">
      <div className="h-3 w-20 rounded bg-slate-100" />
      <div className="h-5 w-40 rounded bg-slate-100" />
      <div className="h-4 w-32 rounded bg-slate-100" />
      <div className="h-3 w-24 rounded bg-slate-100" />
    </div>
  );
}

export default CaraDonasiPage;
